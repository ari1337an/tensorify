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

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("POST /team", () => {
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

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const res = await request(server).post("/team").send({
      name: "Test Team",
      description: "A test team",
    });
    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const res = await request(server)
      .post("/team")
      .set("Authorization", "Bearer invalid_token")
      .send({
        name: "Test Team",
        description: "A test team",
      });
    expect(res.status).toBe(401);
  });

  it("should return 400 if the request body is empty", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body \'name\': Required");
    expect(res.body.message).toContain("Body \'orgId\': Required");

    await revokeSession(sessionId);
  }, 15000);

  it("should return 400 if required fields are missing (e.g., name)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const payload = {
      description: "Test team description",
      orgId: orgId,
    };

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body \'name\': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if team name is too short", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "a",
        description: "A test team",
        orgId: orgId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Team name must be at least 2 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if team name is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "a".repeat(101),
        description: "A test team",
        orgId: orgId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Team name must be less than 100 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if description is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Valid Name",
        description: "a".repeat(501),
        orgId: orgId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Description must be less than 500 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if orgId is missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Missing OrgId Team",
        description: "This team creation is missing orgId",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body \'orgId\': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if orgId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Invalid OrgId Team",
        description: "This team creation has an invalid orgId",
        orgId: "not-a-valid-uuid",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Body \'orgId\': Invalid organization ID format."
    );

    await revokeSession(sessionId);
  });

  it("should successfully create a new team with valid data and return 201", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const createTeamPayload = {
      name: "My New Team",
      description: "A team for testing purposes.",
      orgId: orgId,
    };

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createTeamPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Team created successfully.");

    // Verify in database
    const dbTeam = await db.team.findFirst({
      where: {
        name: createTeamPayload.name,
        orgId: orgId,
      },
    });

    expect(dbTeam).toBeDefined();
    expect(dbTeam?.name).toBe(createTeamPayload.name);
    expect(dbTeam?.description).toBe(createTeamPayload.description);
    expect(dbTeam?.orgId).toBe(orgId);

    await revokeSession(sessionId);
  });

  it("should successfully create a new team without description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const createTeamPayload = {
      name: "Team Without Description",
      orgId: orgId,
    };

    const res = await request(server)
      .post("/team")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createTeamPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Team created successfully.");

    // Verify in database
    const dbTeam = await db.team.findFirst({
      where: {
        name: createTeamPayload.name,
        orgId: orgId,
      },
    });

    expect(dbTeam).toBeDefined();
    expect(dbTeam?.name).toBe(createTeamPayload.name);
    expect(dbTeam?.description).toBeNull();
    expect(dbTeam?.orgId).toBe(orgId);

    await revokeSession(sessionId);
  });
});
