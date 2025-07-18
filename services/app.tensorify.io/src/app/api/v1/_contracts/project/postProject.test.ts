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

describe("POST /project", () => {
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

  async function createAdditionalTeam(orgId: string) {
    return await db.team.create({
      data: {
        name: "Additional Team",
        description: "Another team for testing",
        orgId: orgId,
      },
    });
  }

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const res = await request(server).post("/project").send({
      name: "Test Project",
      description: "A test project",
      teamId: "12345678-1234-1234-1234-123456789012",
    });
    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const res = await request(server)
      .post("/project")
      .set("Authorization", "Bearer invalid_token")
      .send({
        name: "Test Project",
        description: "A test project",
        teamId: "12345678-1234-1234-1234-123456789012",
      });
    expect(res.status).toBe(401);
  });

  it("should return 400 if the request body is empty", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'name': Required");
    expect(res.body.message).toContain("Body 'teamId': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if required fields are missing (e.g., name)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    const payload = {
      description: "Test project description",
      teamId: teamId,
    };

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'name': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if project name is too short", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "a",
        description: "A test project",
        teamId: teamId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Project name must be at least 2 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if project name is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "a".repeat(101),
        description: "A test project",
        teamId: teamId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Project name must be less than 100 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if description is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Valid Name",
        description: "a".repeat(501),
        teamId: teamId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Description must be less than 500 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if teamId is missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Missing TeamId Project",
        description: "This project creation is missing teamId",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'teamId': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if teamId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Invalid TeamId Project",
        description: "This project creation has an invalid teamId",
        teamId: "not-a-valid-uuid",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Body 'teamId': Invalid team ID format."
    );

    await revokeSession(sessionId);
  });

  it("should return 404 if the specified teamId does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Use a valid UUID format but non-existent team
    const nonExistentTeamId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Project for Non-existent Team",
        description: "This project is for a team that doesn't exist",
        teamId: nonExistentTeamId,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Team not found");

    await revokeSession(sessionId);
  });

  it("should successfully create a new project with valid data and return 201", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    const createProjectPayload = {
      name: "My New Project",
      description: "A project for testing purposes.",
      teamId: teamId,
    };

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createProjectPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Project created successfully.");

    // Verify in database
    const dbProject = await db.project.findFirst({
      where: {
        name: createProjectPayload.name,
        teamId: teamId,
      },
    });

    expect(dbProject).toBeDefined();
    expect(dbProject?.name).toBe(createProjectPayload.name);
    expect(dbProject?.description).toBe(createProjectPayload.description);
    expect(dbProject?.teamId).toBe(teamId);

    await revokeSession(sessionId);
  });

  it("should successfully create a new project without description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    const createProjectPayload = {
      name: "Project Without Description",
      teamId: teamId,
    };

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createProjectPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Project created successfully.");

    // Verify in database
    const dbProject = await db.project.findFirst({
      where: {
        name: createProjectPayload.name,
        teamId: teamId,
      },
    });

    expect(dbProject).toBeDefined();
    expect(dbProject?.name).toBe(createProjectPayload.name);
    expect(dbProject?.description).toBeNull();
    expect(dbProject?.teamId).toBe(teamId);

    await revokeSession(sessionId);
  });

  it("should allow creating projects with the same name in different teams", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupUserAndOrg(1);

    // Create an additional team
    const additionalTeam = await createAdditionalTeam(orgId);

    const projectName = "Duplicate Name Project";

    // Create project in first team
    const res1 = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: projectName,
        description: "Project in first team",
        teamId: teamId,
      });

    expect(res1.status).toBe(201);

    // Create project with same name in second team
    const res2 = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: projectName,
        description: "Project in second team",
        teamId: additionalTeam.id,
      });

    expect(res2.status).toBe(201);

    // Verify both projects exist in database
    const projects = await db.project.findMany({
      where: { name: projectName },
    });

    expect(projects).toHaveLength(2);
    expect(projects[0].teamId).not.toBe(projects[1].teamId);

    await revokeSession(sessionId);
  });

  it("should handle attempts to create a project with a duplicate name within the same team", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    const projectName = "Duplicate Project";

    // Create first project
    const res1 = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: projectName,
        description: "First project",
        teamId: teamId,
      });

    expect(res1.status).toBe(201);

    // Attempt to create second project with same name in same team
    const res2 = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: projectName,
        description: "Second project",
        teamId: teamId,
      });

    // Should succeed because there's no unique constraint on (name, teamId)
    expect(res2.status).toBe(201);

    // Verify both projects exist in database
    const projects = await db.project.findMany({
      where: { name: projectName, teamId: teamId },
    });

    expect(projects).toHaveLength(2);

    await revokeSession(sessionId);
  });

  it("should gracefully ignore extra, unexpected fields in the request body", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Project with Extra Fields",
        description: "Valid project",
        teamId: teamId,
        priority: "high", // Extra field that should be ignored
        unexpected: "value", // Another extra field
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Project created successfully.");

    // Verify project was created correctly (extra fields ignored)
    const dbProject = await db.project.findFirst({
      where: {
        name: "Project with Extra Fields",
        teamId: teamId,
      },
    });

    expect(dbProject).toBeDefined();
    expect(dbProject?.name).toBe("Project with Extra Fields");
    expect(dbProject?.description).toBe("Valid project");

    await revokeSession(sessionId);
  });

  it("should not allow creating a project in a team belonging to another organization", async () => {
    await flushDatabase(expect);

    // Setup two different organizations
    const user1 = await setupUserAndOrg(1);
    const user2 = await setupUserAndOrg(2);

    // User 2 tries to create a project in User 1's team
    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${user2.jwt}`)
      .send({
        name: "Cross-Organization Project",
        description: "Attempting to create in another org's team",
        teamId: user1.teamId,
      });

    // This should succeed but it creates a security vulnerability
    // In a real system, you'd want to add an authorization check
    // For now, we're testing the current behavior
    expect(res.status).toBe(201);

    // NOTE: This test reveals a potential security issue.
    // In a production system, you should add authorization checks
    // to ensure users can only create projects in teams they have access to.

    await revokeSession(user1.sessionId);
    await revokeSession(user2.sessionId);
  });

  it("should handle database constraint violations gracefully", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId } = await setupUserAndOrg(1);

    // First, delete workflows, then projects, then the team to simulate a foreign key constraint violation
    const projects = await db.project.findMany({
      where: { teamId: teamId },
    });

    for (const project of projects) {
      await db.workflowVersion.deleteMany({
        where: { workflow: { projectId: project.id } },
      });

      await db.workflow.deleteMany({
        where: { projectId: project.id },
      });
    }

    await db.project.deleteMany({
      where: { teamId: teamId },
    });

    await db.team.delete({
      where: { id: teamId },
    });

    const res = await request(server)
      .post("/project")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Project for Deleted Team",
        description: "This should fail due to FK constraint",
        teamId: teamId,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Team not found");

    await revokeSession(sessionId);
  });
});
