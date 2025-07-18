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
import { ProjectListItem } from "../schema";
import { z } from "zod";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("GET /organization/:orgId/projects", () => {
  async function setupUserAndOrg(botNum: number = 1) {
    const userData = await signInTestAccount(botNum, false, false);
    const questions = (await request(server).get("/onboarding/questions")).body;
    const onboardingRequestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    const onboardingResponse = await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send(onboardingRequestBody);

    return {
      ...userData,
      orgId: onboardingResponse.body.orgId,
      teamId: onboardingResponse.body.teamId,
    };
  }

  async function createProjectsForTeam(teamId: string, count: number = 3) {
    const projects = [];
    for (let i = 1; i <= count; i++) {
      const project = await db.project.create({
        data: {
          name: `Test Project ${i}`,
          description: `Description for project ${i}`,
          teamId: teamId,
        },
      });
      projects.push(project);
    }
    return projects;
  }

  async function createAdditionalTeamWithProjects(
    orgId: string,
    projectCount: number = 2
  ) {
    const team = await db.team.create({
      data: {
        name: "Additional Team",
        description: "Another team for testing",
        orgId: orgId,
      },
    });

    const projects = [];
    for (let i = 1; i <= projectCount; i++) {
      const project = await db.project.create({
        data: {
          name: `Additional Project ${i}`,
          description: `Description for additional project ${i}`,
          teamId: team.id,
        },
      });
      projects.push(project);
    }

    return { team, projects };
  }

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const { orgId } = await setupUserAndOrg(1);

    const res = await request(server).get(`/organization/${orgId}/projects`);
    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const { orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get(`/organization/${orgId}/projects`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(401);
  });

  it("should return 400 if orgId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get("/organization/invalid-uuid/projects")
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
      .get(`/organization/${nonExistentOrgId}/projects`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Organization not found");

    await revokeSession(sessionId);
  });

  it("should return 200 with default project for organization with no additional projects", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get(`/organization/${orgId}/projects`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1); // Default project created during onboarding
    expect(res.body.meta).toEqual({
      totalCount: 1,
      page: 1,
      size: 20,
      totalPages: 1,
    });

    // Verify the default project structure
    const defaultProject = res.body.items[0];
    expect(defaultProject).toHaveProperty("id");
    expect(defaultProject).toHaveProperty("name");
    expect(defaultProject).toHaveProperty("description");
    expect(defaultProject).toHaveProperty("teamId");
    expect(defaultProject).toHaveProperty("teamName");
    expect(defaultProject).toHaveProperty("organizationId");
    expect(defaultProject).toHaveProperty("memberCount");
    expect(defaultProject).toHaveProperty("createdAt");
    expect(defaultProject.organizationId).toBe(orgId);

    await revokeSession(sessionId);
  });

  it("should return 200 with projects list for organization with projects", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupUserAndOrg(1);

    // Create test projects
    await createProjectsForTeam(teamId, 3);

    const res = await request(server)
      .get(`/organization/${orgId}/projects`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(4); // 3 created + 1 default project
    expect(res.body.meta.totalCount).toBe(4);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.size).toBe(20);
    expect(res.body.meta.totalPages).toBe(1);

    // Verify project structure includes teamName
    const firstProject = res.body.items[0];
    expect(firstProject).toHaveProperty("id");
    expect(firstProject).toHaveProperty("name");
    expect(firstProject).toHaveProperty("description");
    expect(firstProject).toHaveProperty("teamId");
    expect(firstProject).toHaveProperty("teamName");
    expect(firstProject).toHaveProperty("organizationId");
    expect(firstProject).toHaveProperty("memberCount");
    expect(firstProject).toHaveProperty("createdAt");
    expect(firstProject.organizationId).toBe(orgId);
    expect(typeof firstProject.teamName).toBe("string");

    await revokeSession(sessionId);
  });

  it("should handle pagination correctly with page parameter", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupUserAndOrg(1);

    // Create 5 projects (plus 1 default = 6 total)
    await createProjectsForTeam(teamId, 5);

    // Test first page with limit 2
    const res1 = await request(server)
      .get(`/organization/${orgId}/projects?page=1&limit=2`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res1.status).toBe(200);
    expect(res1.body.items).toHaveLength(2);
    expect(res1.body.meta).toEqual({
      totalCount: 6, // 5 created + 1 default project
      page: 1,
      size: 2,
      totalPages: 3,
    });

    // Test second page
    const res2 = await request(server)
      .get(`/organization/${orgId}/projects?page=2&limit=2`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res2.status).toBe(200);
    expect(res2.body.items).toHaveLength(2);
    expect(res2.body.meta).toEqual({
      totalCount: 6,
      page: 2,
      size: 2,
      totalPages: 3,
    });

    // Verify different projects are returned
    expect(res1.body.items[0].id).not.toBe(res2.body.items[0].id);

    await revokeSession(sessionId);
  });

  it("should handle invalid pagination parameters gracefully", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    // Test with negative page
    const res1 = await request(server)
      .get(`/organization/${orgId}/projects?page=-1`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res1.status).toBe(400);
    expect(res1.body.message).toContain(
      "Number must be greater than or equal to 1"
    );

    // Test with zero limit
    const res2 = await request(server)
      .get(`/organization/${orgId}/projects?limit=0`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res2.status).toBe(400);
    expect(res2.body.message).toContain(
      "Number must be greater than or equal to 1"
    );

    // Test with limit over 100
    const res3 = await request(server)
      .get(`/organization/${orgId}/projects?limit=101`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res3.status).toBe(400);
    expect(res3.body.message).toContain(
      "Number must be less than or equal to 100"
    );

    await revokeSession(sessionId);
  });

  it("should not return projects from other organizations", async () => {
    await flushDatabase(expect);

    // Setup two different organizations
    const user1 = await setupUserAndOrg(1);
    const user2 = await setupUserAndOrg(2);

    // Create projects for each organization
    await createProjectsForTeam(user1.teamId, 2);
    await createProjectsForTeam(user2.teamId, 3);

    // User 1 should only see their org's projects (2 created + 1 default)
    const res1 = await request(server)
      .get(`/organization/${user1.orgId}/projects`)
      .set("Authorization", `Bearer ${user1.jwt}`);

    expect(res1.status).toBe(200);
    expect(res1.body.items).toHaveLength(3); // 2 created + 1 default
    expect(res1.body.meta.totalCount).toBe(3);
    res1.body.items.forEach((project: z.infer<typeof ProjectListItem>) => {
      expect(project.organizationId).toBe(user1.orgId);
    });

    // User 2 should only see their org's projects (3 created + 1 default)
    const res2 = await request(server)
      .get(`/organization/${user2.orgId}/projects`)
      .set("Authorization", `Bearer ${user2.jwt}`);

    expect(res2.status).toBe(200);
    expect(res2.body.items).toHaveLength(4); // 3 created + 1 default
    expect(res2.body.meta.totalCount).toBe(4);
    res2.body.items.forEach((project: z.infer<typeof ProjectListItem>) => {
      expect(project.organizationId).toBe(user2.orgId);
    });

    await revokeSession(user1.sessionId);
    await revokeSession(user2.sessionId);
  });

  it("should handle SQL injection attempts safely", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Attempt SQL injection in orgId parameter
    const maliciousOrgId = "'; DROP TABLE projects; --";

    const res = await request(server)
      .get(`/organization/${encodeURIComponent(maliciousOrgId)}/projects`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should handle extremely large page numbers", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupUserAndOrg(1);

    await createProjectsForTeam(teamId, 2);

    const res = await request(server)
      .get(`/organization/${orgId}/projects?page=999999`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.meta.page).toBe(999999);
    expect(res.body.meta.totalCount).toBe(3); // 2 created + 1 default

    await revokeSession(sessionId);
  });

  it("should return projects ordered by creation date (newest first)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupUserAndOrg(1);

    // Create projects with slight delay to ensure different creation times
    const project1 = await db.project.create({
      data: {
        name: "First Project",
        description: "Created first",
        teamId: teamId,
      },
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const project2 = await db.project.create({
      data: {
        name: "Second Project",
        description: "Created second",
        teamId: teamId,
      },
    });

    const res = await request(server)
      .get(`/organization/${orgId}/projects`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(3); // 2 created + 1 default project

    // Should be ordered by creation date descending (newest first)
    // project2 should be first, then project1, then the default project created during onboarding
    expect(res.body.items[0].id).toBe(project2.id);
    expect(res.body.items[1].id).toBe(project1.id);

    await revokeSession(sessionId);
  });

  it("should handle projects with null descriptions correctly", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupUserAndOrg(1);

    // Create a project with null description
    await db.project.create({
      data: {
        name: "Project with null description",
        description: null,
        teamId: teamId,
      },
    });

    const res = await request(server)
      .get(`/organization/${orgId}/projects`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2); // 1 created + 1 default project

    // Find the project we created (should have null description)
    const createdProject = res.body.items.find(
      (project: z.infer<typeof ProjectListItem>) =>
        project.name === "Project with null description"
    );
    expect(createdProject).toBeDefined();
    expect(createdProject.description).toBeNull();

    await revokeSession(sessionId);
  });

  it("should include projects from all teams within the organization", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupUserAndOrg(1);

    // Create projects in the default team
    await createProjectsForTeam(teamId, 2);

    // Create another team and projects
    const { team: additionalTeam } =
      await createAdditionalTeamWithProjects(orgId, 2);

    const res = await request(server)
      .get(`/organization/${orgId}/projects`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5); // 2 + 2 created + 1 default project
    expect(res.body.meta.totalCount).toBe(5);

    // Verify projects from both teams are included
    const teamNames = res.body.items.map(
      (project: z.infer<typeof ProjectListItem>) => project.teamName
    );
    expect(teamNames).toContain(additionalTeam.name);

    // Verify all projects belong to the same organization
    res.body.items.forEach((project: z.infer<typeof ProjectListItem>) => {
      expect(project.organizationId).toBe(orgId);
    });

    await revokeSession(sessionId);
  });

  it("should correctly count members for projects", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupUserAndOrg(1);

    // Create a project
    const project = await db.project.create({
      data: {
        name: "Project with members",
        description: "Testing member count",
        teamId: teamId,
      },
    });

    // Create additional users and add them as project members
    const user1 = await db.user.create({
      data: {
        email: "projectmember1@test.com",
        firstName: "Project",
        lastName: "Member1",
        imageUrl: "https://example.com/avatar1.jpg",
      },
    });

    const user2 = await db.user.create({
      data: {
        email: "projectmember2@test.com",
        firstName: "Project",
        lastName: "Member2",
        imageUrl: "https://example.com/avatar2.jpg",
      },
    });

    // Add users to the project
    await db.project.update({
      where: { id: project.id },
      data: {
        members: {
          connect: [{ id: user1.id }, { id: user2.id }],
        },
      },
    });

    const res = await request(server)
      .get(`/organization/${orgId}/projects`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);

    // Find our test project and verify member count
    const testProject = res.body.items.find(
      (p: z.infer<typeof ProjectListItem>) => p.id === project.id
    );
    expect(testProject).toBeDefined();
    expect(testProject.memberCount).toBe(2);

    await revokeSession(sessionId);
  });
});
