import request from "supertest";
import { createServer } from "http";
import {
  createApiTestServer,
  closeApiTestServer,
  signInTestAccount,
  flushDatabase,
  revokeSession,
  generateRequestBodyFromClerkDataForOnboardingSetup,
} from "../test-utils";
import db from "@/server/database/db";
import { z } from "zod";
import { TeamListItem } from "../schema";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("GET /organization/:orgId/teams", () => {
  async function setupUserAndOrg(botNum: number = 1) {
    const userData = await signInTestAccount(botNum, false, false);
    const questions = (await request(server).get("/onboarding/questions")).body;
    const onboardingRequestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    const onboardingResponse = await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send(onboardingRequestBody);

    return { ...userData, orgId: onboardingResponse.body.orgId };
  }

  async function createTeamsForOrg(orgId: string, count: number = 3) {
    const teams = [];
    for (let i = 1; i <= count; i++) {
      const team = await db.team.create({
        data: {
          name: `Test Team ${i}`,
          description: `Description for team ${i}`,
          orgId: orgId,
        },
      });
      teams.push(team);
    }
    return teams;
  }

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const { orgId } = await setupUserAndOrg(1);

    const res = await request(server).get(`/organization/${orgId}/teams`);
    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const { orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get(`/organization/${orgId}/teams`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(401);
  });

  it("should return 400 if orgId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get("/organization/invalid-uuid/teams")
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should return 404 if organization does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Use a valid UUID format but non-existent organization
    const nonExistentOrgId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .get(`/organization/${nonExistentOrgId}/teams`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Organization not found");

    await revokeSession(sessionId);
  });

  it("should return 200 with default team for organization with no additional teams", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get(`/organization/${orgId}/teams`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1); // Default team created during onboarding
    expect(res.body.meta).toEqual({
      totalCount: 1,
      page: 1,
      size: 20,
      totalPages: 1,
    });

    // Verify the default team structure
    const defaultTeam = res.body.items[0];
    expect(defaultTeam).toHaveProperty("id");
    expect(defaultTeam).toHaveProperty("name");
    expect(defaultTeam).toHaveProperty("description");
    expect(defaultTeam).toHaveProperty("organizationId");
    expect(defaultTeam).toHaveProperty("memberCount");
    expect(defaultTeam).toHaveProperty("createdAt");
    expect(defaultTeam.organizationId).toBe(orgId);

    await revokeSession(sessionId);
  });

  it("should return 200 with teams list for organization with teams", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    // Create test teams
    await createTeamsForOrg(orgId, 3);

    const res = await request(server)
      .get(`/organization/${orgId}/teams`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(4); // 3 created + 1 default team
    expect(res.body.meta.totalCount).toBe(4);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.size).toBe(20);
    expect(res.body.meta.totalPages).toBe(1);

    // Verify team structure
    const firstTeam = res.body.items[0];
    expect(firstTeam).toHaveProperty("id");
    expect(firstTeam).toHaveProperty("name");
    expect(firstTeam).toHaveProperty("description");
    expect(firstTeam).toHaveProperty("organizationId");
    expect(firstTeam).toHaveProperty("memberCount");
    expect(firstTeam).toHaveProperty("createdAt");
    expect(firstTeam.organizationId).toBe(orgId);

    await revokeSession(sessionId);
  });

  it("should handle pagination correctly with page parameter", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    // Create 5 teams (plus 1 default = 6 total)
    await createTeamsForOrg(orgId, 5);

    // Test first page with limit 2
    const res1 = await request(server)
      .get(`/organization/${orgId}/teams?page=1&limit=2`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res1.status).toBe(200);
    expect(res1.body.items).toHaveLength(2);
    expect(res1.body.meta).toEqual({
      totalCount: 6, // 5 created + 1 default team
      page: 1,
      size: 2,
      totalPages: 3,
    });

    // Test second page
    const res2 = await request(server)
      .get(`/organization/${orgId}/teams?page=2&limit=2`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res2.status).toBe(200);
    expect(res2.body.items).toHaveLength(2);
    expect(res2.body.meta).toEqual({
      totalCount: 6,
      page: 2,
      size: 2,
      totalPages: 3,
    });

    // Verify different teams are returned
    expect(res1.body.items[0].id).not.toBe(res2.body.items[0].id);

    await revokeSession(sessionId);
  });

  it("should handle invalid pagination parameters gracefully", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    await createTeamsForOrg(orgId, 2);

    // Test with negative page
    const res1 = await request(server)
      .get(`/organization/${orgId}/teams?page=-1`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res1.status).toBe(400);
    expect(res1.body.message).toContain(
      "Number must be greater than or equal to 1"
    );

    // Test with zero limit
    const res2 = await request(server)
      .get(`/organization/${orgId}/teams?limit=0`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res2.status).toBe(400);
    expect(res2.body.message).toContain(
      "Number must be greater than or equal to 1"
    );

    // Test with limit over 100
    const res3 = await request(server)
      .get(`/organization/${orgId}/teams?limit=101`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res3.status).toBe(400);
    expect(res3.body.message).toContain(
      "Number must be less than or equal to 100"
    );

    await revokeSession(sessionId);
  });

  it("should not return teams from other organizations", async () => {
    await flushDatabase(expect);

    // Setup two different organizations
    const user1 = await setupUserAndOrg(1);
    const user2 = await setupUserAndOrg(2);

    // Create teams for each organization
    await createTeamsForOrg(user1.orgId, 2);
    await createTeamsForOrg(user2.orgId, 3);

    // User 1 should only see their org's teams (2 created + 1 default)
    const res1 = await request(server)
      .get(`/organization/${user1.orgId}/teams`)
      .set("Authorization", `Bearer ${user1.jwt}`);

    expect(res1.status).toBe(200);
    expect(res1.body.items).toHaveLength(3); // 2 created + 1 default
    expect(res1.body.meta.totalCount).toBe(3);
    res1.body.items.forEach((team: z.infer<typeof TeamListItem>) => {
      expect(team.organizationId).toBe(user1.orgId);
    });

    // User 2 should only see their org's teams (3 created + 1 default)
    const res2 = await request(server)
      .get(`/organization/${user2.orgId}/teams`)
      .set("Authorization", `Bearer ${user2.jwt}`);

    expect(res2.status).toBe(200);
    expect(res2.body.items).toHaveLength(4); // 3 created + 1 default
    expect(res2.body.meta.totalCount).toBe(4);
    res2.body.items.forEach((team: z.infer<typeof TeamListItem>) => {
      expect(team.organizationId).toBe(user2.orgId);
    });

    await revokeSession(user1.sessionId);
    await revokeSession(user2.sessionId);
  });

  it("should handle SQL injection attempts safely", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Attempt SQL injection in orgId parameter
    const maliciousOrgId = "'; DROP TABLE teams; --";

    const res = await request(server)
      .get(`/organization/${encodeURIComponent(maliciousOrgId)}/teams`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should handle extremely large page numbers", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    await createTeamsForOrg(orgId, 2);

    const res = await request(server)
      .get(`/organization/${orgId}/teams?page=999999`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.meta.page).toBe(999999);
    expect(res.body.meta.totalCount).toBe(3); // 2 created + 1 default

    await revokeSession(sessionId);
  });

  it("should return teams ordered by creation date (newest first)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    // Create teams with slight delay to ensure different creation times
    const team1 = await db.team.create({
      data: {
        name: "First Team",
        description: "Created first",
        orgId: orgId,
      },
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const team2 = await db.team.create({
      data: {
        name: "Second Team",
        description: "Created second",
        orgId: orgId,
      },
    });

    const res = await request(server)
      .get(`/organization/${orgId}/teams`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(3); // 2 created + 1 default team

    // Should be ordered by creation date descending (newest first)
    // team2 should be first, then team1, then the default team created during onboarding
    expect(res.body.items[0].id).toBe(team2.id);
    expect(res.body.items[1].id).toBe(team1.id);

    await revokeSession(sessionId);
  });

  it("should handle teams with null descriptions correctly", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    // Create a team with null description
    await db.team.create({
      data: {
        name: "Team with null description",
        description: null,
        orgId: orgId,
      },
    });

    const res = await request(server)
      .get(`/organization/${orgId}/teams`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2); // 1 created + 1 default team

    // Find the team we created (should have null description)
    const createdTeam = res.body.items.find(
      (team: z.infer<typeof TeamListItem>) =>
        team.name === "Team with null description"
    );
    expect(createdTeam).toBeDefined();
    expect(createdTeam.description).toBeNull();

    await revokeSession(sessionId);
  });
});
