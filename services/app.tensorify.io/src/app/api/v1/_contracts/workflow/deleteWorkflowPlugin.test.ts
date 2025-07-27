import request from "supertest";
import { createServer } from "http";
import {
  createApiTestServer,
  closeApiTestServer,
  signInTestAccount,
  flushDatabase,
  generateRequestBodyFromClerkDataForOnboardingSetup,
} from "../test-utils";
import db from "@/server/database/db";
import { z } from "zod";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("DELETE /workflow/:workflowId/plugin/:pluginId", () => {
  // Helper function to set up a complete test scenario with workflow and plugin
  async function setupWorkflowWithPlugin(botNum: number = 1) {
    const userData = await signInTestAccount(botNum, false, false);
    const questions = (await request(server).get("/onboarding/questions")).body;
    const onboardingRequestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    const onboardingResponse = await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send(onboardingRequestBody);

    const orgId = onboardingResponse.body.orgId;

    // Create a team
    const team = await db.team.create({
      data: {
        name: "Test Team",
        orgId,
      },
    });

    // Create a project
    const project = await db.project.create({
      data: {
        name: "Test Project",
        teamId: team.id,
      },
    });

    // Create a workflow
    const workflow = await db.workflow.create({
      data: {
        name: "Test Workflow",
        description: "Test Workflow Description",
        projectId: project.id,
      },
    });

    // Install a plugin
    const installedPlugin = await db.workflowInstalledPlugins.create({
      data: {
        slug: "@johndoe/conv2d:5.0.2",
        description: "A 2D convolution plugin for neural networks",
        workflowId: workflow.id,
      },
    });

    return {
      ...userData,
      orgId,
      teamId: team.id,
      projectId: project.id,
      workflowId: workflow.id,
      pluginId: installedPlugin.id,
      pluginSlug: installedPlugin.slug,
    };
  }

  it("should return 401 when no Authorization header is provided", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server).delete(
      `/workflow/${testData.workflowId}/plugin/${testData.pluginId}`
    );

    expect(res.status).toBe(401);
  });

  it("should return 401 when invalid JWT token is provided", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server)
      .delete(`/workflow/${testData.workflowId}/plugin/${testData.pluginId}`)
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
  });

  it("should return 400 when workflowId is not a valid UUID", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server)
      .delete(`/workflow/invalid-uuid/plugin/${testData.pluginId}`)
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");
  });

  it("should return 400 when pluginId is not a valid UUID", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server)
      .delete(`/workflow/${testData.workflowId}/plugin/invalid-uuid`)
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");
  });

  it("should return 404 when workflow does not exist", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const nonExistentWorkflowId = "550e8400-e29b-41d4-a716-446655440000";
    const nonExistentPluginId = "550e8400-e29b-41d4-a716-446655440001";

    const res = await request(server)
      .delete(
        `/workflow/${nonExistentWorkflowId}/plugin/${nonExistentPluginId}`
      )
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Workflow not found");
  });

  it("should return 404 when plugin does not exist in the workflow", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);
    const nonExistentPluginId = "550e8400-e29b-41d4-a716-446655440001";

    const res = await request(server)
      .delete(`/workflow/${testData.workflowId}/plugin/${nonExistentPluginId}`)
      .set("Authorization", `Bearer ${testData.jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Plugin not found in this workflow");
  });

  it("should successfully delete a plugin from workflow", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    // Verify plugin exists before deletion
    const pluginBefore = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: testData.pluginId,
        workflowId: testData.workflowId,
      },
    });
    expect(pluginBefore).not.toBeNull();

    const res = await request(server)
      .delete(`/workflow/${testData.workflowId}/plugin/${testData.pluginId}`)
      .set("Authorization", `Bearer ${testData.jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("@johndoe/conv2d:5.0.2");
    expect(res.body.message).toContain("uninstalled successfully");

    // Verify plugin is actually deleted from database
    const pluginAfter = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: testData.pluginId,
        workflowId: testData.workflowId,
      },
    });
    expect(pluginAfter).toBeNull();
  });

  it("should handle race condition - attempting to delete already deleted plugin", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    // Delete the plugin first
    await db.workflowInstalledPlugins.delete({
      where: { id: testData.pluginId },
    });

    // Attempt to delete again
    const res = await request(server)
      .delete(`/workflow/${testData.workflowId}/plugin/${testData.pluginId}`)
      .set("Authorization", `Bearer ${testData.jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Plugin not found in this workflow");
  });

  it("should not allow deletion of plugin from different workflow (security test)", async () => {
    await flushDatabase(expect);

    // Create two different workflows with plugins
    const testData1 = await setupWorkflowWithPlugin(1);
    const testData2 = await setupWorkflowWithPlugin(2);

    // Try to delete plugin from workflow1 using workflow2's ID
    const res = await request(server)
      .delete(`/workflow/${testData2.workflowId}/plugin/${testData1.pluginId}`)
      .set("Authorization", `Bearer ${testData1.jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Plugin not found in this workflow");

    // Verify the plugin still exists in the original workflow
    const pluginStillExists = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: testData1.pluginId,
        workflowId: testData1.workflowId,
      },
    });
    expect(pluginStillExists).not.toBeNull();
  });

  it("should handle SQL injection attempts in path parameters", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const maliciousWorkflowId = "'; DROP TABLE workflowInstalledPlugins; --";
    const maliciousPluginId = "'; DELETE FROM workflows; --";

    const res = await request(server)
      .delete(
        `/workflow/${encodeURIComponent(maliciousWorkflowId)}/plugin/${encodeURIComponent(maliciousPluginId)}`
      )
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    // Verify database tables still exist and are intact
    const tableCheck = await db.workflowInstalledPlugins.findMany();
    expect(Array.isArray(tableCheck)).toBe(true);
  });
});
