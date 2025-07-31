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

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("PUT /workflow/:workflowId/plugin/:pluginId/manifest", () => {
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

    // Install a plugin with initial manifest
    const initialManifest = {
      name: "Conv2D",
      version: "5.0.2",
      description: "A 2D convolution plugin for neural networks",
      visual: {
        size: { width: 200, height: 100 },
        styling: { borderRadius: 4, borderColor: "#e5e7eb" },
      },
    };

    const installedPlugin = await db.workflowInstalledPlugins.create({
      data: {
        slug: "@johndoe/conv2d:5.0.2",
        description: "A 2D convolution plugin for neural networks",
        workflowId: workflow.id,
        pluginType: "miscellaneous",
        manifest: initialManifest,
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
      initialManifest,
    };
  }

  it("should return 401 when no Authorization header is provided", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .send({
        manifest: { name: "Updated Plugin" },
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 when invalid JWT token is provided", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", "Bearer invalid-token")
      .send({
        manifest: { name: "Updated Plugin" },
      });

    expect(res.status).toBe(401);
  });

  it("should return 400 when workflowId is not a valid UUID", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server)
      .put(`/workflow/invalid-uuid/plugin/${testData.pluginId}/manifest`)
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        manifest: { name: "Updated Plugin" },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");
  });

  it("should return 400 when pluginId is not a valid UUID", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server)
      .put(`/workflow/${testData.workflowId}/plugin/invalid-uuid/manifest`)
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        manifest: { name: "Updated Plugin" },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");
  });

  it("should return 400 when manifest is not provided", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const testData = await setupWorkflowWithPlugin(1);

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("should return 400 when manifest is not a valid JSON object", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const testData = await setupWorkflowWithPlugin(1);

    // Test with array
    const res1 = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        manifest: ["not", "an", "object"],
      });

    expect(res1.status).toBe(400);
    expect(res1.body.message).toContain("Expected object");

    // Test with null
    const res2 = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        manifest: null,
      });

    expect(res2.status).toBe(400);
    expect(res2.body.message).toContain("Expected object");
  });

  it("should return 404 when workflow does not exist", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const nonExistentWorkflowId = "550e8400-e29b-41d4-a716-446655440000";
    const nonExistentPluginId = "550e8400-e29b-41d4-a716-446655440001";

    const res = await request(server)
      .put(
        `/workflow/${nonExistentWorkflowId}/plugin/${nonExistentPluginId}/manifest`
      )
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        manifest: { name: "Updated Plugin" },
      });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Workflow not found");
  });

  it("should return 404 when plugin does not exist in the workflow", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);
    const nonExistentPluginId = "550e8400-e29b-41d4-a716-446655440001";

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${nonExistentPluginId}/manifest`
      )
      .set("Authorization", `Bearer ${testData.jwt}`)
      .send({
        manifest: { name: "Updated Plugin" },
      });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Plugin not found in this workflow");
  });

  it("should successfully update plugin manifest", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    const updatedManifest = {
      name: "Enhanced Conv2D",
      version: "5.1.0",
      description: "Enhanced 2D convolution plugin with better performance",
      visual: {
        size: { width: 250, height: 150 },
        styling: { borderRadius: 8, borderColor: "#3b82f6" },
        icons: { primaryType: "lucide", primaryValue: "layers" },
      },
      settings: {
        fields: [
          { name: "filters", type: "number", default: 32 },
          {
            name: "kernelSize",
            type: "select",
            options: [3, 5, 7],
            default: 3,
          },
        ],
      },
    };

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${testData.jwt}`)
      .send({
        manifest: updatedManifest,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("@johndoe/conv2d:5.0.2");
    expect(res.body.message).toContain("updated successfully");

    // Verify manifest is actually updated in database
    const pluginAfter = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: testData.pluginId,
        workflowId: testData.workflowId,
      },
    });

    expect(pluginAfter).not.toBeNull();
    expect(pluginAfter!.manifest).toEqual(updatedManifest);
  });

  it("should handle partial manifest updates", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    // Update only visual configuration
    const partialManifest = {
      visual: {
        size: { width: 300, height: 200 },
        styling: { borderRadius: 12, borderColor: "#ef4444" },
      },
    };

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${testData.jwt}`)
      .send({
        manifest: partialManifest,
      });

    expect(res.status).toBe(200);

    // Verify only visual config is updated, original manifest is replaced
    const pluginAfter = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: testData.pluginId,
        workflowId: testData.workflowId,
      },
    });

    expect(pluginAfter!.manifest).toEqual(partialManifest);
  });

  it("should handle complex nested manifest structures", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    const complexManifest = {
      name: "Complex Plugin",
      version: "2.0.0",
      author: { name: "John Doe", email: "john@example.com" },
      dependencies: ["tensorflow", "numpy"],
      visual: {
        containerType: "left-round",
        size: {
          width: 280,
          height: 180,
          minWidth: 200,
          maxWidth: 400,
        },
        styling: {
          borderRadius: 16,
          borderColor: "#8b5cf6",
          backgroundColor: "#f3f4f6",
          shadowLevel: 2,
        },
        icons: {
          primaryType: "fontawesome",
          primaryValue: "fa-cog",
          iconSize: "large",
          showIconBackground: true,
        },
        labels: {
          title: "Advanced Processor",
          titleDescription: "Processes data with advanced algorithms",
          showLabels: true,
          labelPosition: "top",
        },
      },
      settings: {
        groups: [
          {
            name: "Basic Settings",
            fields: ["input_size", "output_size"],
          },
          {
            name: "Advanced Settings",
            fields: ["learning_rate", "batch_size", "epochs"],
          },
        ],
        fields: [
          {
            name: "input_size",
            type: "number",
            label: "Input Size",
            default: 224,
            min: 32,
            max: 512,
            step: 32,
          },
          {
            name: "learning_rate",
            type: "slider",
            label: "Learning Rate",
            default: 0.001,
            min: 0.0001,
            max: 0.1,
            step: 0.0001,
          },
        ],
      },
    };

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${testData.jwt}`)
      .send({
        manifest: complexManifest,
      });

    expect(res.status).toBe(200);

    // Verify complex structure is preserved
    const pluginAfter = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: testData.pluginId,
        workflowId: testData.workflowId,
      },
    });

    expect(pluginAfter!.manifest).toEqual(complexManifest);
  });

  it("should handle race condition - attempting to update already deleted plugin", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    // Delete the plugin first
    await db.workflowInstalledPlugins.delete({
      where: { id: testData.pluginId },
    });

    // Attempt to update manifest
    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${testData.jwt}`)
      .send({
        manifest: { name: "Updated Plugin" },
      });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Plugin not found in this workflow");
  });

  it("should not allow updating plugin manifest from different workflow (security test)", async () => {
    await flushDatabase(expect);

    // Create two different workflows with plugins
    const testData1 = await setupWorkflowWithPlugin(1);
    const testData2 = await setupWorkflowWithPlugin(2);

    // Try to update plugin from workflow1 using workflow2's ID
    const res = await request(server)
      .put(
        `/workflow/${testData2.workflowId}/plugin/${testData1.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${testData1.jwt}`)
      .send({
        manifest: { name: "Malicious Update" },
      });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Plugin not found in this workflow");

    // Verify the plugin manifest in the original workflow is unchanged
    const pluginStillUnchanged = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: testData1.pluginId,
        workflowId: testData1.workflowId,
      },
    });
    expect(pluginStillUnchanged!.manifest).toEqual(testData1.initialManifest);
  });

  it("should handle SQL injection attempts in path parameters", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1);
    const maliciousWorkflowId = "'; DROP TABLE workflowInstalledPlugins; --";
    const maliciousPluginId = "'; DELETE FROM workflows; --";

    const res = await request(server)
      .put(
        `/workflow/${encodeURIComponent(maliciousWorkflowId)}/plugin/${encodeURIComponent(maliciousPluginId)}/manifest`
      )
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        manifest: { name: "Injection Test" },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    // Verify database tables still exist and are intact
    const tableCheck = await db.workflowInstalledPlugins.findMany();
    expect(Array.isArray(tableCheck)).toBe(true);
  });

  it("should handle malicious content in manifest JSON", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    const maliciousManifest = {
      name: "<script>alert('xss')</script>",
      description: "'; DROP TABLE workflows; --",
      visual: {
        title: "<img src=x onerror=alert('xss')>",
        backgroundColor: "javascript:alert('xss')",
      },
    };

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${testData.jwt}`)
      .send({
        manifest: maliciousManifest,
      });

    expect(res.status).toBe(200);

    // Verify malicious content is stored as-is (but should be escaped when rendered)
    const pluginAfter = await db.workflowInstalledPlugins.findFirst({
      where: {
        id: testData.pluginId,
        workflowId: testData.workflowId,
      },
    });

    expect(pluginAfter!.manifest).toEqual(maliciousManifest);
  });

  it("should preserve manifest update timestamps", async () => {
    await flushDatabase(expect);

    const testData = await setupWorkflowWithPlugin(1);

    // Get original timestamps
    const pluginBefore = await db.workflowInstalledPlugins.findFirst({
      where: { id: testData.pluginId },
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const updatedManifest = {
      name: "Timestamp Test Plugin",
      version: "1.0.1",
    };

    const res = await request(server)
      .put(
        `/workflow/${testData.workflowId}/plugin/${testData.pluginId}/manifest`
      )
      .set("Authorization", `Bearer ${testData.jwt}`)
      .send({
        manifest: updatedManifest,
      });

    expect(res.status).toBe(200);

    // Verify updatedAt timestamp changed but createdAt didn't
    const pluginAfter = await db.workflowInstalledPlugins.findFirst({
      where: { id: testData.pluginId },
    });

    expect(pluginAfter!.createdAt).toEqual(pluginBefore!.createdAt);
    expect(pluginAfter!.updatedAt.getTime()).toBeGreaterThan(
      pluginBefore!.updatedAt.getTime()
    );
  });
});
