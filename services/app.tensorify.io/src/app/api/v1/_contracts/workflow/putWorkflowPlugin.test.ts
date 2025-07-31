import request from "supertest";
import { createServer } from "http";
import {
  signInTestAccount,
  revokeSession,
  generateRequestBodyFromClerkDataForOnboardingSetup,
  flushDatabase,
  createApiTestServer,
  closeApiTestServer,
} from "../test-utils";
import db from "@/server/database/db";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("PUT /workflow/:workflowId/plugin/:pluginId", () => {
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

  async function installPlugin(
    workflowId: string,
    slug: string,
    description?: string
  ) {
    return await db.workflowInstalledPlugins.create({
      data: {
        slug,
        description: description || null,
        pluginType: "CUSTOM",
        manifest: {},
        workflowId: workflowId,
      },
    });
  }

  // Authentication Tests
  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const { workflowId } = await setupUserAndOrg(1);
    const installedPlugin = await installPlugin(
      workflowId,
      "@testuser/demo-plugin:1.0.0"
    );

    const res = await request(server)
      .put(`/workflow/${workflowId}/plugin/${installedPlugin.id}`)
      .send({
        slug: "@testuser/demo-plugin:2.0.0",
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 if authentication token is invalid", async () => {
    await flushDatabase(expect);
    const { workflowId } = await setupUserAndOrg(1);
    const installedPlugin = await installPlugin(
      workflowId,
      "@testuser/demo-plugin:1.0.0"
    );

    const res = await request(server)
      .put(`/workflow/${workflowId}/plugin/${installedPlugin.id}`)
      .set("Authorization", "Bearer invalid_token")
      .send({
        slug: "@testuser/demo-plugin:2.0.0",
      });

    expect(res.status).toBe(401);
  });

  // Validation Tests
  it("should return 400 if workflowId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);
    const installedPlugin = await installPlugin(
      workflowId,
      "@testuser/demo-plugin:1.0.0"
    );

    const res = await request(server)
      .put(`/workflow/invalid-uuid/plugin/${installedPlugin.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@testuser/demo-plugin:2.0.0",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should return 400 if pluginId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .put(`/workflow/${workflowId}/plugin/invalid-uuid`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@testuser/demo-plugin:2.0.0",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should return 400 if required fields are missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);
    const installedPlugin = await installPlugin(
      workflowId,
      "@testuser/demo-plugin:1.0.0"
    );

    const res = await request(server)
      .put(`/workflow/${workflowId}/plugin/${installedPlugin.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Body 'slug': Required");

    await revokeSession(sessionId);
  });

  it("should return 400 if description is too long", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);
    const installedPlugin = await installPlugin(
      workflowId,
      "@testuser/demo-plugin:1.0.0"
    );

    const res = await request(server)
      .put(`/workflow/${workflowId}/plugin/${installedPlugin.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@testuser/demo-plugin:2.0.0",
        description: "a".repeat(501), // Exceeds 500 character limit
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Description must be less than 500 characters"
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if slug format is invalid", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);
    const installedPlugin = await installPlugin(
      workflowId,
      "@testuser/demo-plugin:1.0.0"
    );

    const invalidSlugs = [
      "invalid-slug",
      "@user",
      "@user/",
      "@user/plugin",
      "user/plugin:1.0.0",
      "@user/plugin:invalid_version",
      "@/plugin:1.0.0",
      "@user/:1.0.0",
    ];

    for (const invalidSlug of invalidSlugs) {
      const res = await request(server)
        .put(`/workflow/${workflowId}/plugin/${installedPlugin.id}`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          slug: invalidSlug,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Plugin slug must follow format");
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

    for (let i = 0; i < validSlugs.length; i++) {
      const installedPlugin = await installPlugin(
        workflowId,
        `@test/plugin${i}:1.0.0`
      );

      const res = await request(server)
        .put(`/workflow/${workflowId}/plugin/${installedPlugin.id}`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          slug: validSlugs[i],
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Plugin updated successfully.");

      // Verify plugin was updated in database
      const updatedPlugin = await db.workflowInstalledPlugins.findFirst({
        where: {
          id: installedPlugin.id,
          workflowId: workflowId,
        },
      });
      expect(updatedPlugin).toBeDefined();
      expect(updatedPlugin?.slug).toBe(validSlugs[i]);
    }

    await revokeSession(sessionId);
  });

  // Not Found Tests
  it("should return 404 if workflow does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);
    const installedPlugin = await installPlugin(
      workflowId,
      "@testuser/demo-plugin:1.0.0"
    );

    const nonExistentWorkflowId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .put(`/workflow/${nonExistentWorkflowId}/plugin/${installedPlugin.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@testuser/demo-plugin:2.0.0",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Workflow not found");

    await revokeSession(sessionId);
  });

  it("should return 404 if plugin does not exist in the workflow", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId } = await setupUserAndOrg(1);

    const nonExistentPluginId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .put(`/workflow/${workflowId}/plugin/${nonExistentPluginId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: "@testuser/demo-plugin:2.0.0",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Plugin not found in this workflow");

    await revokeSession(sessionId);
  });

  // Business Logic Tests
  it("should successfully update a plugin with valid data", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    // Create a test workflow
    const testWorkflow = await createTestWorkflow(projectId);
    const installedPlugin = await installPlugin(
      testWorkflow.id,
      "@testuser/awesome-plugin:1.0.0"
    );

    const newSlug = "@testuser/awesome-plugin:2.0.0";

    const res = await request(server)
      .put(`/workflow/${testWorkflow.id}/plugin/${installedPlugin.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: newSlug,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Plugin updated successfully.");

    // Verify in database
    const dbPlugin = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: installedPlugin.id,
        workflowId: testWorkflow.id,
      },
    });

    expect(dbPlugin).toBeDefined();
    expect(dbPlugin?.slug).toBe(newSlug);
    expect(dbPlugin?.workflowId).toBe(testWorkflow.id);
    expect(dbPlugin?.updatedAt).not.toEqual(installedPlugin.updatedAt);

    await revokeSession(sessionId);
  });

  it("should successfully update a plugin with description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId);
    const installedPlugin = await installPlugin(
      testWorkflow.id,
      "@testuser/awesome-plugin:1.0.0"
    );

    const newSlug = "@testuser/awesome-plugin:2.0.0";
    const newDescription = "Updated plugin description";

    const res = await request(server)
      .put(`/workflow/${testWorkflow.id}/plugin/${installedPlugin.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: newSlug,
        description: newDescription,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Plugin updated successfully.");

    // Verify in database
    const dbPlugin = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: installedPlugin.id,
        workflowId: testWorkflow.id,
      },
    });

    expect(dbPlugin).toBeDefined();
    expect(dbPlugin?.slug).toBe(newSlug);
    expect(dbPlugin?.description).toBe(newDescription);

    await revokeSession(sessionId);
  });

  it("should return 409 if updating to a slug that already exists for another plugin", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId);
    const installedPlugin1 = await installPlugin(
      testWorkflow.id,
      "@testuser/plugin1:1.0.0"
    );
    const installedPlugin2 = await installPlugin(
      testWorkflow.id,
      "@testuser/plugin2:1.0.0"
    );

    // Try to update plugin1 to use the same slug as plugin2
    const conflictingSlug = "@testuser/plugin2:1.0.0";

    const res = await request(server)
      .put(`/workflow/${testWorkflow.id}/plugin/${installedPlugin1.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: conflictingSlug,
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain(
      "Plugin @testuser/plugin2:1.0.0 is already installed in this workflow"
    );

    await revokeSession(sessionId);
  });

  it("should allow updating a plugin to the same slug (no conflict with itself)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, projectId } = await setupUserAndOrg(1);

    const testWorkflow = await createTestWorkflow(projectId);
    const installedPlugin = await installPlugin(
      testWorkflow.id,
      "@testuser/plugin:1.0.0"
    );

    // Update plugin to the same slug (should not conflict with itself)
    const sameSlug = "@testuser/plugin:1.0.0";

    const res = await request(server)
      .put(`/workflow/${testWorkflow.id}/plugin/${installedPlugin.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        slug: sameSlug,
        description: "Updated description",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Plugin updated successfully.");

    // Verify description was updated
    const dbPlugin = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: installedPlugin.id,
      },
    });

    expect(dbPlugin?.description).toBe("Updated description");

    await revokeSession(sessionId);
  });
});
