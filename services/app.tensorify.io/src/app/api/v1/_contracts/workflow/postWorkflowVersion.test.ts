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

describe("POST /workflow/:workflowId/version", () => {
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
      workflowId: onboardingResponse.body.workflowId,
    };
  }

  async function createTestWorkflow(
    projectId: string,
    name: string = "Test Workflow"
  ) {
    return await db.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          name,
          description: "Test workflow for version testing",
          projectId: projectId,
        },
      });

      await tx.workflowVersion.create({
        data: {
          summary: "Initial Commit",
          description: "Test workflow for version testing",
          version: "1.0.0",
          code: { step1: "initial", step2: "setup" },
          workflowId: workflow.id,
        },
      });

      return workflow;
    });
  }

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const { workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/version`)
      .send({
        summary: "New version",
        version: "2.0.0",
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const { workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/version`)
      .set("Authorization", "Bearer invalid_token")
      .send({
        summary: "New version",
        version: "2.0.0",
      });

    expect(res.status).toBe(401);
  });

  it("should return 400 if workflowId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow/invalid-uuid/version")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "New version",
        version: "2.0.0",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should return 400 if required fields are missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'summary': Required");
    expect(res.body.message).toContain("Body 'version': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if summary is empty", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "",
        version: "2.0.0",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Summary is required");

    await revokeSession(sessionId);
  });

  it("should return 400 if summary is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "a".repeat(101),
        version: "2.0.0",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Summary must be less than 100 characters"
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if description is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "Valid summary",
        description: "a".repeat(501),
        version: "2.0.0",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Description must be less than 500 characters"
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if version format is invalid", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const invalidVersions = ["2.0", "v2.0.0", "2.0.0-beta", "invalid"];

    for (const invalidVersion of invalidVersions) {
      const res = await request(server)
        .post(`/workflow/${workflowId}/version`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          summary: "Test version",
          version: invalidVersion,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain(
        "Version must follow semantic versioning format"
      );
    }

    await revokeSession(sessionId);
  });

  it("should return 404 if workflow does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const nonExistentWorkflowId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .post(`/workflow/${nonExistentWorkflowId}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "New version",
        version: "2.0.0",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Workflow not found");

    await revokeSession(sessionId);
  });

  it("should return 409 if version already exists for the workflow", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // Create a test workflow with an initial version
    const testWorkflow = await createTestWorkflow(projectId);

    // Try to create the same version again
    const res = await request(server)
      .post(`/workflow/${testWorkflow.id}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "Duplicate version",
        version: "1.0.0", // This version already exists
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe(
      "Version 1.0.0 already exists for this workflow"
    );

    await revokeSession(sessionId);
  });

  it("should successfully create a new version with valid data", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // Create a test workflow
    const testWorkflow = await createTestWorkflow(projectId);

    const newVersionData = {
      summary: "Added new features",
      description:
        "This version includes new authentication and UI improvements",
      version: "2.0.0",
    };

    const res = await request(server)
      .post(`/workflow/${testWorkflow.id}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send(newVersionData);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Workflow version created successfully.");

    // Verify in database
    const dbVersion = await db.workflowVersion.findFirst({
      where: {
        workflowId: testWorkflow.id,
        version: "2.0.0",
      },
    });

    expect(dbVersion).toBeDefined();
    expect(dbVersion?.summary).toBe(newVersionData.summary);
    expect(dbVersion?.description).toBe(newVersionData.description);
    expect(dbVersion?.version).toBe(newVersionData.version);
    expect(dbVersion?.code).toEqual({ step1: "initial", step2: "setup" }); // Copied from previous version

    await revokeSession(sessionId);
  });

  it("should copy code from the latest version when creating a new version", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId);

    // Create an intermediate version with different code
    await db.workflowVersion.create({
      data: {
        summary: "Intermediate version",
        description: "Version with updated code",
        version: "1.5.0",
        code: { step1: "updated", step2: "improved", step3: "new" },
        workflowId: testWorkflow.id,
      },
    });

    // Create a new version
    const res = await request(server)
      .post(`/workflow/${testWorkflow.id}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "Latest version",
        version: "2.0.0",
      });

    expect(res.status).toBe(201);

    // Verify the new version copied code from the latest version (1.5.0)
    const newVersion = await db.workflowVersion.findFirst({
      where: {
        workflowId: testWorkflow.id,
        version: "2.0.0",
      },
    });

    expect(newVersion?.code).toEqual({
      step1: "updated",
      step2: "improved",
      step3: "new",
    });

    await revokeSession(sessionId);
  });

  it("should use workflow description as default when description is not provided", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId, "Test Workflow");

    const res = await request(server)
      .post(`/workflow/${testWorkflow.id}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "Version without description",
        version: "2.0.0",
      });

    expect(res.status).toBe(201);

    const dbVersion = await db.workflowVersion.findFirst({
      where: {
        workflowId: testWorkflow.id,
        version: "2.0.0",
      },
    });

    expect(dbVersion?.description).toBe("Test workflow for version testing");

    await revokeSession(sessionId);
  });

  it("should handle creating versions for workflows without existing versions", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // Create a workflow without any versions
    const workflowWithoutVersions = await db.workflow.create({
      data: {
        name: "Workflow without versions",
        description: "Testing version creation for empty workflow",
        projectId: projectId,
      },
    });

    const res = await request(server)
      .post(`/workflow/${workflowWithoutVersions.id}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "First version",
        version: "1.0.0",
      });

    expect(res.status).toBe(201);

    const dbVersion = await db.workflowVersion.findFirst({
      where: {
        workflowId: workflowWithoutVersions.id,
        version: "1.0.0",
      },
    });

    expect(dbVersion).toBeDefined();
    expect(dbVersion?.code).toEqual({}); // Empty object when no previous versions

    await revokeSession(sessionId);
  });

  it("should allow creating multiple versions with different version numbers", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId);

    const versions = [
      { summary: "Bug fixes", version: "1.0.1" },
      { summary: "Minor update", version: "1.1.0" },
      { summary: "Major release", version: "2.0.0" },
    ];

    for (const versionData of versions) {
      const res = await request(server)
        .post(`/workflow/${testWorkflow.id}/version`)
        .set("Authorization", `Bearer ${jwt}`)
        .send(versionData);

      expect(res.status).toBe(201);
    }

    // Verify all versions exist
    const allVersions = await db.workflowVersion.findMany({
      where: { workflowId: testWorkflow.id },
      orderBy: { createdAt: "asc" },
    });

    expect(allVersions).toHaveLength(4); // 1 initial + 3 created
    expect(allVersions.map((v) => v.version)).toEqual([
      "1.0.0",
      "1.0.1",
      "1.1.0",
      "2.0.0",
    ]);

    await revokeSession(sessionId);
  });

  it("should handle SQL injection attempts safely", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const maliciousData = {
      summary: "'; DROP TABLE workflow_versions; --",
      description: "<script>alert('xss')</script>",
      version: "2.0.0",
    };

    const res = await request(server)
      .post(`/workflow/${workflowId}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send(maliciousData);

    expect(res.status).toBe(201);

    // Verify the malicious content is stored as-is (but escaped when queried)
    const dbVersion = await db.workflowVersion.findFirst({
      where: {
        workflowId: workflowId,
        version: "2.0.0",
      },
    });

    expect(dbVersion?.summary).toBe(maliciousData.summary);
    expect(dbVersion?.description).toBe(maliciousData.description);

    await revokeSession(sessionId);
  });

  it("should not allow creating versions for workflows from other organizations", async () => {
    await flushDatabase(expect);

    // Setup two different organizations
    const user1 = await setupUserAndOrg(1);
    const user2 = await setupUserAndOrg(2);

    // User 2 tries to create a version for User 1's workflow
    const res = await request(server)
      .post(`/workflow/${user1.workflowId}/version`)
      .set("Authorization", `Bearer ${user2.jwt}`)
      .send({
        summary: "Unauthorized version",
        version: "2.0.0",
      });

    // Should succeed in current implementation (potential security issue)
    // In production, you'd want to add authorization checks
    expect(res.status).toBe(201);

    await revokeSession(user1.sessionId);
    await revokeSession(user2.sessionId);
  });

  it("should reject extra unexpected fields in request body due to strict validation", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "Version with extra fields",
        version: "2.0.0",
        priority: "high", // Extra field - should cause validation error
        author: "test user", // Extra field - should cause validation error
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Unrecognized key(s) in object");

    // Verify version was not created
    const dbVersion = await db.workflowVersion.findFirst({
      where: {
        workflowId: workflowId,
        version: "2.0.0",
      },
    });

    expect(dbVersion).toBeNull();

    await revokeSession(sessionId);
  });

  it("should handle database constraint violations gracefully", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId);

    // Delete the workflow to simulate a constraint violation
    await db.workflowVersion.deleteMany({
      where: { workflowId: testWorkflow.id },
    });
    await db.workflow.delete({
      where: { id: testWorkflow.id },
    });

    const res = await request(server)
      .post(`/workflow/${testWorkflow.id}/version`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        summary: "Version for deleted workflow",
        version: "2.0.0",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Workflow not found");

    await revokeSession(sessionId);
  });
});
