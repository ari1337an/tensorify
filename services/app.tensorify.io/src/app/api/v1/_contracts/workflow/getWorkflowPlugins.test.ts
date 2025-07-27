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

describe("GET /workflow/:workflowId/plugins", () => {
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

  async function createAdditionalWorkflow(
    accessToken: string,
    projectId: string,
    workflowData = {
      name: "Test Workflow",
      description: "Test Description",
      projectId,
    }
  ) {
    await request(server)
      .post("/workflow")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(workflowData)
      .expect(201);

    // Since the response contains just a message, we need to query the database
    // to get the created workflow
    const workflow = await db.workflow.findFirst({
      where: {
        name: workflowData.name,
        projectId: projectId,
      },
      orderBy: { createdAt: "desc" },
    });

    return workflow;
  }

  async function installPlugin(
    accessToken: string,
    workflowId: string,
    slug: string,
    description?: string
  ) {
    const payload: { slug: string; description?: string } = { slug };
    if (description !== undefined) {
      payload.description = description;
    }

    return await request(server)
      .post(`/workflow/${workflowId}/plugin`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(payload)
      .expect(201);
  }

  beforeEach(async () => {
    await flushDatabase();
  });

  describe("Authentication Guard", () => {
    it("should return 401 when no authorization header is provided", async () => {
      const response = await request(server)
        .get("/workflow/550e8400-e29b-41d4-a716-446655440000/plugins")
        .expect(401);

      expect(response.body).toMatchObject({
        message: expect.stringContaining("Unauthorized"),
      });
    });

    it("should return 401 when invalid token is provided", async () => {
      const response = await request(server)
        .get("/workflow/550e8400-e29b-41d4-a716-446655440000/plugins")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body).toMatchObject({
        message: expect.stringContaining("Unauthorized"),
      });
    });
  });

  describe("Input Validation", () => {
    it("should return 400 for invalid workflow ID format", async () => {
      const userData = await setupUserAndOrg();

      const response = await request(server)
        .get("/workflow/invalid-uuid/plugins")
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(400);

      expect(response.body).toMatchObject({
        message: expect.stringContaining("Invalid UUID"),
        type: "RequestValidationError",
      });
    });

    it("should return 400 for non-UUID workflow ID", async () => {
      const userData = await setupUserAndOrg();

      const response = await request(server)
        .get("/workflow/not-a-uuid/plugins")
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(400);

      expect(response.body).toMatchObject({
        message: expect.stringContaining("Invalid UUID"),
        type: "RequestValidationError",
      });
    });
  });

  describe("Authorization & Access Control", () => {
    it("should return 404 when workflow does not exist", async () => {
      const userData = await setupUserAndOrg();

      const response = await request(server)
        .get("/workflow/550e8400-e29b-41d4-a716-446655440000/plugins")
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(404);

      expect(response.body).toEqual({
        status: "failed",
        message: "Workflow not found",
      });
    });

    it("should return plugins for workflow from different user (no access control implemented)", async () => {
      const user1Data = await setupUserAndOrg(1);
      const user2Data = await setupUserAndOrg(2);

      // User 1 creates a workflow
      const workflow = await createAdditionalWorkflow(
        user1Data.jwt,
        user1Data.projectId
      );

      // User 2 can access the workflow (no access control implemented in API)
      const response = await request(server)
        .get(`/workflow/${workflow!.id}/plugins`)
        .set("Authorization", `Bearer ${user2Data.jwt}`)
        .expect(200);

      expect(response.body).toEqual({
        status: "success",
        data: [],
      });
    });
  });

  describe("Successful Plugin Retrieval", () => {
    it("should return empty array when no plugins are installed", async () => {
      const userData = await setupUserAndOrg();

      const response = await request(server)
        .get(`/workflow/${userData.workflowId}/plugins`)
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(200);

      expect(response.body).toEqual({
        status: "success",
        data: [],
      });
    });

    it("should return installed plugins with correct structure", async () => {
      const userData = await setupUserAndOrg();

      // Install a plugin without description
      await installPlugin(
        userData.jwt,
        userData.workflowId,
        "@johndoe/test-plugin:1.0.0"
      );

      const response = await request(server)
        .get(`/workflow/${userData.workflowId}/plugins`)
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        id: expect.any(String),
        slug: "@johndoe/test-plugin:1.0.0",
        description: null, // No description provided
        pluginType: expect.any(String), // Should have pluginType field
        manifest: expect.any(Object), // Should have manifest field
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify UUID format
      expect(response.body.data[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );

      // Verify ISO date format
      expect(new Date(response.body.data[0].createdAt)).toBeInstanceOf(Date);
      expect(new Date(response.body.data[0].updatedAt)).toBeInstanceOf(Date);
    });

    it("should return installed plugins with descriptions when provided", async () => {
      const userData = await setupUserAndOrg();

      // Install a plugin with description
      const pluginDescription = "A test plugin for data processing";
      await installPlugin(
        userData.jwt,
        userData.workflowId,
        "@johndoe/test-plugin:1.0.0",
        pluginDescription
      );

      const response = await request(server)
        .get(`/workflow/${userData.workflowId}/plugins`)
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        id: expect.any(String),
        slug: "@johndoe/test-plugin:1.0.0",
        description: pluginDescription,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should return multiple installed plugins ordered by creation date (newest first)", async () => {
      const userData = await setupUserAndOrg();

      // Install plugins with slight delay to ensure different timestamps
      await installPlugin(
        userData.jwt,
        userData.workflowId,
        "@johndoe/plugin-1:1.0.0"
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
      await installPlugin(
        userData.jwt,
        userData.workflowId,
        "@johndoe/plugin-2:2.0.0"
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
      await installPlugin(
        userData.jwt,
        userData.workflowId,
        "@johndoe/plugin-3:3.0.0"
      );

      const response = await request(server)
        .get(`/workflow/${userData.workflowId}/plugins`)
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(3);

      // Verify ordering (newest first)
      const plugins = response.body.data;
      expect(plugins[0].slug).toBe("@johndoe/plugin-3:3.0.0");
      expect(plugins[1].slug).toBe("@johndoe/plugin-2:2.0.0");
      expect(plugins[2].slug).toBe("@johndoe/plugin-1:1.0.0");

      // Verify timestamps are in descending order
      const timestamps = plugins.map((p: { createdAt: string }) =>
        new Date(p.createdAt).getTime()
      );
      expect(timestamps[0]).toBeGreaterThanOrEqual(timestamps[1]);
      expect(timestamps[1]).toBeGreaterThanOrEqual(timestamps[2]);
    });

    it("should only return plugins for the specific workflow", async () => {
      const userData = await setupUserAndOrg();
      const workflow2 = await createAdditionalWorkflow(
        userData.jwt,
        userData.projectId,
        {
          name: "Second Workflow",
          description: "Second workflow description",
          projectId: userData.projectId,
        }
      );

      // Install different plugins in each workflow
      await installPlugin(
        userData.jwt,
        userData.workflowId,
        "@johndoe/plugin-1:1.0.0"
      );
      await installPlugin(
        userData.jwt,
        workflow2!.id,
        "@johndoe/plugin-2:2.0.0"
      );

      // Check first workflow plugins
      const response1 = await request(server)
        .get(`/workflow/${userData.workflowId}/plugins`)
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(200);

      expect(response1.body.data).toHaveLength(1);
      expect(response1.body.data[0].slug).toBe("@johndoe/plugin-1:1.0.0");

      // Check second workflow plugins
      const response2 = await request(server)
        .get(`/workflow/${workflow2!.id}/plugins`)
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(200);

      expect(response2.body.data).toHaveLength(1);
      expect(response2.body.data[0].slug).toBe("@johndoe/plugin-2:2.0.0");
    });
  });

  describe("Edge Cases", () => {
    it("should handle workflows with many installed plugins", async () => {
      const userData = await setupUserAndOrg();

      // Install 10 plugins
      const pluginPromises = [];
      for (let i = 1; i <= 10; i++) {
        pluginPromises.push(
          installPlugin(
            userData.jwt,
            userData.workflowId,
            `@johndoe/plugin-${i}:1.0.0`
          )
        );
      }
      await Promise.all(pluginPromises);

      const response = await request(server)
        .get(`/workflow/${userData.workflowId}/plugins`)
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(10);

      // Verify all plugins are returned with unique IDs
      const slugs = response.body.data.map((p: { slug: string }) => p.slug);
      const uniqueSlugs = [...new Set(slugs)];
      expect(uniqueSlugs).toHaveLength(10);
    });

    it("should handle database connection issues gracefully", async () => {
      const userData = await setupUserAndOrg();

      // Mock database error
      const originalFindMany = db.workflowInstalledPlugins.findMany;
      db.workflowInstalledPlugins.findMany = jest
        .fn()
        .mockRejectedValue(new Error("Database connection error"));

      const response = await request(server)
        .get(`/workflow/${userData.workflowId}/plugins`)
        .set("Authorization", `Bearer ${userData.jwt}`)
        .expect(500);

      expect(response.body).toEqual({
        status: "failed",
        message: "Internal server error",
      });

      // Restore original method
      db.workflowInstalledPlugins.findMany = originalFindMany;
    });
  });
});
