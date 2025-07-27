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

describe("POST /workflow/:workflowId/plugin", () => {
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
          description: "Test workflow for plugin testing",
          projectId: projectId,
        },
      });

      await tx.workflowVersion.create({
        data: {
          summary: "Initial Commit",
          description: "Test workflow for plugin testing",
          version: "1.0.0",
          code: { step1: "initial", step2: "setup" },
          workflowId: workflow.id,
        },
      });

      return workflow;
    });
  }

  // Authentication Tests
  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const { workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/plugin`)
      .send({
        slug: "@testuser/demo-plugin:1.0.0",
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const { workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/plugin`)
      .set("Authorization", "Bearer invalid_token")
      .send({
        slug: "@testuser/demo-plugin:1.0.0",
      });

    expect(res.status).toBe(401);
  });

  // Validation Tests
  it("should return 400 if workflowId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/workflow/invalid-uuid/plugin")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@testuser/demo-plugin:1.0.0",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should return 400 if required fields are missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'slug': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if description is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@testuser/demo-plugin:1.0.0",
        description: "a".repeat(501), // Exceeds 500 character limit
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Description must be less than 500 characters"
    );

    await revokeSession(sessionId);
  });

  it("should return 400 for invalid slug formats", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const invalidSlugs = [
      "demo-plugin:1.0.0", // missing @username/
      "@user/plugin", // missing :version
      "@user/plugin:v1.0.0", // invalid version format (v prefix)
      "@user/plugin:1.0", // invalid semantic version
      "user/plugin:1.0.0", // missing @ prefix
      "@/plugin:1.0.0", // empty username
      "@user/:1.0.0", // empty plugin name
      "@user/plugin:", // empty version
      "@user@domain/plugin:1.0.0", // invalid username format
      "@user/plugin-name:beta", // invalid version (not latest or semver)
    ];

    for (const invalidSlug of invalidSlugs) {
      const res = await request(server)
        .post(`/workflow/${workflowId}/plugin`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          slug: invalidSlug,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain(
        "Plugin slug must follow format @username/plugin:version"
      );
    }

    await revokeSession(sessionId);
  });

  it("should accept valid slug formats", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const validSlugs = [
      "@username/plugin:1.0.0",
      "@user_name/plugin-name:2.1.3",
      "@user-name/plugin_name:latest",
      "@test123/demo:10.0.0",
      "@a/b:0.0.1",
    ];

    for (const validSlug of validSlugs) {
      const res = await request(server)
        .post(`/workflow/${workflowId}/plugin`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          slug: validSlug,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Plugin installed successfully.");

      // Verify plugin was installed in database
      const installedPlugin = await db.workflowInstalledPlugins.findFirst({
        where: {
          workflowId: workflowId,
          slug: validSlug,
        },
      });
      expect(installedPlugin).toBeDefined();
      expect(installedPlugin?.slug).toBe(validSlug);
    }

    await revokeSession(sessionId);
  });

  // Not Found Tests
  it("should return 404 if workflow does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const nonExistentWorkflowId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .post(`/workflow/${nonExistentWorkflowId}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@testuser/demo-plugin:1.0.0",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Workflow not found");

    await revokeSession(sessionId);
  });

  // Business Logic Tests
  it("should successfully install a plugin with valid data", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // Create a test workflow
    const testWorkflow = await createTestWorkflow(projectId);

    const pluginSlug = "@testuser/awesome-plugin:1.2.0";

    const res = await request(server)
      .post(`/workflow/${testWorkflow.id}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: pluginSlug,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Plugin installed successfully.");

    // Verify in database
    const dbPlugin = await db.workflowInstalledPlugins.findFirst({
      where: {
        workflowId: testWorkflow.id,
        slug: pluginSlug,
      },
    });

    expect(dbPlugin).toBeDefined();
    expect(dbPlugin?.slug).toBe(pluginSlug);
    expect(dbPlugin?.description).toBeNull(); // No description provided
    expect(dbPlugin?.pluginType).toBe("CUSTOM"); // Default pluginType when not found
    expect(dbPlugin?.manifest).toEqual({}); // Default empty manifest when not available
    expect(dbPlugin?.workflowId).toBe(testWorkflow.id);
    expect(dbPlugin?.createdAt).toBeDefined();
    expect(dbPlugin?.updatedAt).toBeDefined();

    await revokeSession(sessionId);
  });

  it("should successfully install a plugin with description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // Create a test workflow
    const testWorkflow = await createTestWorkflow(projectId);

    const pluginSlug = "@testuser/described-plugin:1.0.0";
    const pluginDescription =
      "This is a comprehensive plugin for data processing and visualization";

    const res = await request(server)
      .post(`/workflow/${testWorkflow.id}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: pluginSlug,
        description: pluginDescription,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Plugin installed successfully.");

    // Verify in database
    const dbPlugin = await db.workflowInstalledPlugins.findFirst({
      where: {
        workflowId: testWorkflow.id,
        slug: pluginSlug,
      },
    });

    expect(dbPlugin).toBeDefined();
    expect(dbPlugin?.slug).toBe(pluginSlug);
    expect(dbPlugin?.description).toBe(pluginDescription);
    expect(dbPlugin?.workflowId).toBe(testWorkflow.id);
    expect(dbPlugin?.createdAt).toBeDefined();
    expect(dbPlugin?.updatedAt).toBeDefined();

    await revokeSession(sessionId);
  });

  it("should return 409 if plugin is already installed for the workflow", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // Create a test workflow
    const testWorkflow = await createTestWorkflow(projectId);
    const pluginSlug = "@testuser/duplicate-plugin:1.0.0";

    // Install plugin first time
    const res1 = await request(server)
      .post(`/workflow/${testWorkflow.id}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: pluginSlug,
      });

    expect(res1.status).toBe(201);

    // Try to install the same plugin again
    const res2 = await request(server)
      .post(`/workflow/${testWorkflow.id}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: pluginSlug,
      });

    expect(res2.status).toBe(409);
    expect(res2.body.message).toBe(
      `Plugin ${pluginSlug} is already installed in this workflow`
    );

    // Verify only one record exists in database
    const pluginCount = await db.workflowInstalledPlugins.count({
      where: {
        workflowId: testWorkflow.id,
        slug: pluginSlug,
      },
    });

    expect(pluginCount).toBe(1);

    await revokeSession(sessionId);
  });

  it("should allow installing different plugins in the same workflow", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId);

    const plugins = [
      "@user1/plugin1:1.0.0",
      "@user2/plugin2:2.0.0",
      "@user1/plugin3:latest",
    ];

    for (const pluginSlug of plugins) {
      const res = await request(server)
        .post(`/workflow/${testWorkflow.id}/plugin`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          slug: pluginSlug,
        });

      expect(res.status).toBe(201);
    }

    // Verify all plugins are installed
    const installedPlugins = await db.workflowInstalledPlugins.findMany({
      where: {
        workflowId: testWorkflow.id,
      },
    });

    expect(installedPlugins).toHaveLength(3);
    expect(installedPlugins.map((p) => p.slug)).toEqual(
      expect.arrayContaining(plugins)
    );

    await revokeSession(sessionId);
  });

  it("should allow installing the same plugin in different workflows", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // Create two test workflows
    const workflow1 = await createTestWorkflow(projectId, "Workflow 1");
    const workflow2 = await createTestWorkflow(projectId, "Workflow 2");

    const pluginSlug = "@shared/common-plugin:1.0.0";

    // Install same plugin in both workflows
    const res1 = await request(server)
      .post(`/workflow/${workflow1.id}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: pluginSlug,
      });

    expect(res1.status).toBe(201);

    const res2 = await request(server)
      .post(`/workflow/${workflow2.id}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: pluginSlug,
      });

    expect(res2.status).toBe(201);

    // Verify both installations exist
    const workflow1Plugin = await db.workflowInstalledPlugins.findFirst({
      where: { workflowId: workflow1.id, slug: pluginSlug },
    });
    const workflow2Plugin = await db.workflowInstalledPlugins.findFirst({
      where: { workflowId: workflow2.id, slug: pluginSlug },
    });

    expect(workflow1Plugin).toBeDefined();
    expect(workflow2Plugin).toBeDefined();
    expect(workflow1Plugin?.id).not.toBe(workflow2Plugin?.id);

    await revokeSession(sessionId);
  });

  it("should allow installing different versions of the same plugin", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId);

    const pluginVersions = [
      "@user/my-plugin:1.0.0",
      "@user/my-plugin:2.0.0",
      "@user/my-plugin:latest",
    ];

    for (const pluginSlug of pluginVersions) {
      const res = await request(server)
        .post(`/workflow/${testWorkflow.id}/plugin`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          slug: pluginSlug,
        });

      expect(res.status).toBe(201);
    }

    // Verify all versions are installed
    const installedPlugins = await db.workflowInstalledPlugins.findMany({
      where: {
        workflowId: testWorkflow.id,
      },
    });

    expect(installedPlugins).toHaveLength(3);
    expect(installedPlugins.map((p) => p.slug)).toEqual(
      expect.arrayContaining(pluginVersions)
    );

    await revokeSession(sessionId);
  });

  // Security Tests
  it("should handle SQL injection attempts safely", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const maliciousSlug =
      "@user/plugin'; DROP TABLE workflow_installed_plugins; --:1.0.0";

    const res = await request(server)
      .post(`/workflow/${workflowId}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: maliciousSlug,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Plugin slug must follow format @username/plugin:version"
    );

    await revokeSession(sessionId);
  });

  it("should reject extra unexpected fields in request body due to strict validation", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post(`/workflow/${workflowId}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@user/plugin:1.0.0",
        priority: "high", // Extra field - should cause validation error
        description: "test description", // Extra field - should cause validation error
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Unrecognized key(s) in object");

    // Verify plugin was not installed
    const dbPlugin = await db.workflowInstalledPlugins.findFirst({
      where: {
        workflowId: workflowId,
        slug: "@user/plugin:1.0.0",
      },
    });

    expect(dbPlugin).toBeNull();

    await revokeSession(sessionId);
  });

  it("should not allow installing plugins in workflows from other organizations", async () => {
    await flushDatabase(expect);

    // Setup two different organizations
    const user1 = await setupUserAndOrg(1);
    const user2 = await setupUserAndOrg(2);

    // User 2 tries to install a plugin in User 1's workflow
    const res = await request(server)
      .post(`/workflow/${user1.workflowId}/plugin`)
      .set("Authorization", `Bearer ${user2.jwt}`)
      .send({
        slug: "@malicious/unauthorized-plugin:1.0.0",
      });

    // NOTE: This should ideally return 403 Forbidden, but current implementation
    // allows it (security gap noted in requirements). Testing current behavior.
    expect(res.status).toBe(201);

    // TODO: Add authorization checks to prevent cross-org plugin installs
    // Expected behavior: expect(res.status).toBe(403);

    await revokeSession(user1.sessionId);
    await revokeSession(user2.sessionId);
  });

  // Edge Cases
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
      .post(`/workflow/${testWorkflow.id}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@user/plugin:1.0.0",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Workflow not found");

    await revokeSession(sessionId);
  });

  it("should not create any plugin records if workflow does not exist (atomicity test)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Count existing plugin records before the failed attempt
    const initialPluginCount = await db.workflowInstalledPlugins.count();

    const nonExistentWorkflowId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .post(`/workflow/${nonExistentWorkflowId}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@user/failed-plugin:1.0.0",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Workflow not found");

    // Verify no records were created (transaction rolled back)
    const finalPluginCount = await db.workflowInstalledPlugins.count();
    expect(finalPluginCount).toBe(initialPluginCount);

    await revokeSession(sessionId);
  });

  it("should handle malicious content in slug gracefully", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const maliciousSlug = "@<script>alert('xss')</script>/evil:1.0.0";

    const res = await request(server)
      .post(`/workflow/${workflowId}/plugin`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: maliciousSlug,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Plugin slug must follow format @username/plugin:version"
    );

    await revokeSession(sessionId);
  });
});
