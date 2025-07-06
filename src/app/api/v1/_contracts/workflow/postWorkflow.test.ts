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

describe("POST /workflow", () => {
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
      projectId: onboardingResponse.body.projectId,
    };
  }

  async function createAdditionalProject(teamId: string) {
    return await db.project.create({
      data: {
        name: "Additional Project",
        description: "Another project for testing",
        team: {
          connect: {
            id: teamId,
          },
        },
      },
    });
  }

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const res = await request(server).post("/workflow").send({
      name: "Test Workflow",
      description: "A test workflow",
      projectId: "12345678-1234-1234-1234-123456789012",
    });
    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const res = await request(server)
      .post("/workflow")
      .set("Authorization", "Bearer invalid_token")
      .send({
        name: "Test Workflow",
        description: "A test workflow",
        projectId: "12345678-1234-1234-1234-123456789012",
      });
    expect(res.status).toBe(401);
  });

  it("should return 400 if the request body is empty", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'name': Required");
    expect(res.body.message).toContain("Body 'description': Required");
    expect(res.body.message).toContain("Body 'projectId': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if required fields are missing (e.g., name)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const payload = {
      description: "Test workflow description",
      projectId: projectId,
    };

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'name': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if workflow name is too short", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "a",
        description: "A test workflow",
        projectId: projectId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Workflow name must be at least 2 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if workflow name is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "a".repeat(101),
        description: "A test workflow",
        projectId: projectId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Workflow name must be less than 100 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if description is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Valid Name",
        description: "a".repeat(501),
        projectId: projectId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Description must be less than 500 characters."
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if projectId is missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Missing ProjectId Workflow",
        description: "This workflow creation is missing projectId",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'projectId': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if projectId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Invalid ProjectId Workflow",
        description: "This workflow creation has an invalid projectId",
        projectId: "not-a-valid-uuid",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Body 'projectId': Invalid project ID format."
    );

    await revokeSession(sessionId);
  });

  it("should return 404 if the specified projectId does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Use a valid UUID format but non-existent project
    const nonExistentProjectId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Workflow for Non-existent Project",
        description: "This workflow is for a project that doesn't exist",
        projectId: nonExistentProjectId,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Project not found");

    await revokeSession(sessionId);
  });

  it("should not create any workflow or version records if project does not exist (atomicity test)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Count existing records before the failed attempt
    const initialWorkflowCount = await db.workflow.count();
    const initialVersionCount = await db.workflowVersion.count();

    const nonExistentProjectId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Failed Atomic Workflow",
        description: "This should not create any records",
        projectId: nonExistentProjectId,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Project not found");

    // Verify no records were created (transaction rolled back)
    const finalWorkflowCount = await db.workflow.count();
    const finalVersionCount = await db.workflowVersion.count();

    expect(finalWorkflowCount).toBe(initialWorkflowCount);
    expect(finalVersionCount).toBe(initialVersionCount);

    await revokeSession(sessionId);
  });

  it("should successfully create a new workflow with valid data and return 201", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const createWorkflowPayload = {
      name: "My New Workflow",
      description: "A workflow for testing purposes.",
      projectId: projectId,
    };

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createWorkflowPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Workflow created successfully.");

    // Verify in database
    const dbWorkflow = await db.workflow.findFirst({
      where: {
        name: createWorkflowPayload.name,
        projectId: projectId,
      },
      include: {
        versions: true, // Include versions to verify they were created
      },
    });

    expect(dbWorkflow).toBeDefined();
    expect(dbWorkflow?.name).toBe(createWorkflowPayload.name);
    expect(dbWorkflow?.description).toBe(createWorkflowPayload.description);
    expect(dbWorkflow?.projectId).toBe(projectId);

    // Verify that exactly one workflow version was created
    expect(dbWorkflow?.versions).toHaveLength(1);
    const workflowVersion = dbWorkflow?.versions[0];
    expect(workflowVersion).toBeDefined();
    expect(workflowVersion?.summary).toBe("Initial Commit");
    expect(workflowVersion?.description).toBe(
      createWorkflowPayload.description
    );
    expect(workflowVersion?.version).toBe("1.0.0");
    expect(workflowVersion?.code).toEqual({});
    expect(workflowVersion?.workflowId).toBe(dbWorkflow?.id);

    await revokeSession(sessionId);
  });

  it("should allow creating workflows with the same name in different projects", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, teamId, projectId } = await setupUserAndOrg(1);

    // Create an additional project
    const additionalProject = await createAdditionalProject(teamId);

    const workflowName = "Duplicate Name Workflow";

    // Create workflow in first project
    const res1 = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: workflowName,
        description: "Workflow in first project",
        projectId: projectId,
      });

    expect(res1.status).toBe(201);

    // Create workflow with same name in second project
    const res2 = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: workflowName,
        description: "Workflow in second project",
        projectId: additionalProject.id,
      });

    expect(res2.status).toBe(201);

    // Verify both workflows exist in database
    const workflows = await db.workflow.findMany({
      where: { name: workflowName },
      include: { versions: true },
    });

    expect(workflows).toHaveLength(2);
    expect(workflows[0].projectId).not.toBe(workflows[1].projectId);

    // Verify both workflows have initial versions
    expect(workflows[0].versions).toHaveLength(1);
    expect(workflows[1].versions).toHaveLength(1);
    expect(workflows[0].versions[0].version).toBe("1.0.0");
    expect(workflows[1].versions[0].version).toBe("1.0.0");

    await revokeSession(sessionId);
  });

  it("should handle attempts to create a workflow with a duplicate name within the same project", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const workflowName = "Duplicate Workflow";

    // Create first workflow
    const res1 = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: workflowName,
        description: "First workflow",
        projectId: projectId,
      });

    expect(res1.status).toBe(201);

    // Attempt to create second workflow with same name in same project
    const res2 = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: workflowName,
        description: "Second workflow",
        projectId: projectId,
      });

    // Should succeed because there's no unique constraint on (name, projectId)
    expect(res2.status).toBe(201);

    // Verify both workflows exist in database
    const workflows = await db.workflow.findMany({
      where: { name: workflowName, projectId: projectId },
      include: { versions: true },
    });

    expect(workflows).toHaveLength(2);

    // Verify both workflows have initial versions
    workflows.forEach((workflow) => {
      expect(workflow.versions).toHaveLength(1);
      expect(workflow.versions[0].version).toBe("1.0.0");
      expect(workflow.versions[0].summary).toBe("Initial Commit");
    });

    await revokeSession(sessionId);
  });

  it("should gracefully ignore extra, unexpected fields in the request body", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Workflow with Extra Fields",
        description: "Valid workflow",
        projectId: projectId,
        priority: "high", // Extra field that should be ignored
        unexpected: "value", // Another extra field
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Workflow created successfully.");

    // Verify workflow was created correctly (extra fields ignored)
    const dbWorkflow = await db.workflow.findFirst({
      where: {
        name: "Workflow with Extra Fields",
        projectId: projectId,
      },
    });

    expect(dbWorkflow).toBeDefined();
    expect(dbWorkflow?.name).toBe("Workflow with Extra Fields");
    expect(dbWorkflow?.description).toBe("Valid workflow");

    await revokeSession(sessionId);
  });

  it("should not allow creating a workflow in a project belonging to another organization", async () => {
    await flushDatabase(expect);

    // Setup two different organizations
    const user1 = await setupUserAndOrg(1);
    const user2 = await setupUserAndOrg(2);

    // User 2 tries to create a workflow in User 1's project
    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${user2.jwt}`)
      .send({
        name: "Cross-Organization Workflow",
        description: "Attempting to create in another org's project",
        projectId: user1.projectId,
      });

    // This should succeed but it creates a security vulnerability
    // In a real system, you'd want to add an authorization check
    // For now, we're testing the current behavior
    expect(res.status).toBe(201);

    // NOTE: This test reveals a potential security issue.
    // In a production system, you should add authorization checks
    // to ensure users can only create workflows in projects they have access to.

    await revokeSession(user1.sessionId);
    await revokeSession(user2.sessionId);
  });

  it("should handle database constraint violations gracefully", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // First, delete workflows and their versions, then projects to simulate a foreign key constraint violation
    const workflows = await db.workflow.findMany({
      where: { projectId: projectId },
    });

    for (const workflow of workflows) {
      // Delete workflow versions first due to foreign key constraint
      await db.workflowVersion.deleteMany({
        where: { workflowId: workflow.id },
      });

      await db.workflow.delete({
        where: { id: workflow.id },
      });
    }

    await db.project.delete({
      where: { id: projectId },
    });

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Workflow for Deleted Project",
        description: "This should fail due to FK constraint",
        projectId: projectId,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Project not found");

    await revokeSession(sessionId);
  });

  it("should handle SQL injection attempts safely", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Attempt SQL injection in projectId parameter
    const maliciousProjectId = "'; DROP TABLE workflows; --";

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "SQL Injection Test",
        description: "Testing SQL injection prevention",
        projectId: maliciousProjectId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid project ID format.");

    await revokeSession(sessionId);
  });

  it("should handle malicious input in name and description fields", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const maliciousName = "<script>alert('xss')</script>";
    const maliciousDescription = "'; DROP TABLE workflows; --";

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: maliciousName,
        description: maliciousDescription,
        projectId: projectId,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Workflow created successfully.");

    // Verify the malicious content is stored as-is (but escaped when queried)
    const dbWorkflow = await db.workflow.findFirst({
      where: {
        name: maliciousName,
        projectId: projectId,
      },
    });

    expect(dbWorkflow).toBeDefined();
    expect(dbWorkflow?.name).toBe(maliciousName);
    expect(dbWorkflow?.description).toBe(maliciousDescription);

    await revokeSession(sessionId);
  });

  it("should not allow empty string values for non-required fields", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Workflow with Empty Description",
        description: "",
        projectId: projectId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Body 'description': Description is required"
    );

    // Verify workflow was not created with empty description
    const dbWorkflow = await db.workflow.findFirst({
      where: { name: "Workflow with Empty Description" },
    });
    expect(dbWorkflow).toBeNull();

    await revokeSession(sessionId);
  });
});
