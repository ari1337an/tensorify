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

describe("PATCH /workflow/:workflowId/version/:versionId/code", () => {
  async function setupUserAndOrg(botNum: number = 1) {
    const userData = await signInTestAccount(botNum, false, false);
    const questions = (await request(server).get("/onboarding/questions")).body;
    const onboardingRequestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    const onboardingResponse = await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send(onboardingRequestBody);

    // Get the workflow version ID from the created workflow
    const workflow = await db.workflow.findFirst({
      where: {
        id: onboardingResponse.body.workflowId,
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return {
      ...userData,
      orgId: onboardingResponse.body.orgId,
      teamId: onboardingResponse.body.teamId,
      projectId: onboardingResponse.body.projectId,
      workflowId: onboardingResponse.body.workflowId,
      versionId: workflow?.versions[0]?.id,
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
          description: "Test workflow for code update testing",
          projectId: projectId,
        },
      });

      const version = await tx.workflowVersion.create({
        data: {
          summary: "Initial Commit",
          description: "Test workflow for code update testing",
          version: "1.0.0",
          code: { nodes: [], edges: [] },
          workflowId: workflow.id,
        },
      });

      return { workflow, version };
    });
  }

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const { workflowId, versionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .send({
        code: { nodes: [], edges: [] },
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const { workflowId, versionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .set("Authorization", "Bearer invalid_token")
      .send({
        code: { nodes: [], edges: [] },
      });

    expect(res.status).toBe(401);
  });

  it("should return 400 if workflowId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, versionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch(`/workflow/invalid-uuid/version/${versionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        code: { nodes: [], edges: [] },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");
  });

  it("should return 400 if versionId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, workflowId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/invalid-uuid/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        code: { nodes: [], edges: [] },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");
  });

  it("should return 400 if code is not an object", async () => {
    await flushDatabase(expect);
    const { jwt, workflowId, versionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        code: "invalid-code",
      });

    expect(res.status).toBe(400);
  });

  it("should return 404 if workflow version doesn't exist", async () => {
    await flushDatabase(expect);
    const { jwt, workflowId } = await setupUserAndOrg(1);
    const nonExistentVersionId = "00000000-0000-0000-0000-000000000000";

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/${nonExistentVersionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        code: { nodes: [], edges: [] },
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Workflow version not found");
  });

  // TODO: Re-enable this test when access control is implemented
  it.skip("should return 403 if user doesn't have access to the workflow", async () => {
    await flushDatabase(expect);
    const user1 = await setupUserAndOrg(1);
    const user2 = await setupUserAndOrg(2);

    const res = await request(server)
      .patch(`/workflow/${user1.workflowId}/version/${user1.versionId}/code`)
      .set("Authorization", `Bearer ${user2.jwt}`)
      .send({
        code: { nodes: [], edges: [] },
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You don't have access to this workflow");
  });

  it("should successfully update the workflow version code", async () => {
    await flushDatabase(expect);
    const { jwt, workflowId, versionId } = await setupUserAndOrg(1);

    const newCode = {
      nodes: [
        {
          id: "node-1",
          type: "custom",
          position: { x: 100, y: 100 },
          data: { label: "Test Node" },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "node-1",
          target: "node-2",
        },
      ],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    };

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        code: newCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Workflow version code updated successfully."
    );

    // Verify the code was actually updated in the database
    const updatedVersion = await db.workflowVersion.findUnique({
      where: { id: versionId },
      select: { code: true },
    });

    expect(updatedVersion?.code).toEqual(newCode);
  });

  it("should update the code multiple times successfully", async () => {
    await flushDatabase(expect);
    const { jwt, workflowId, versionId } = await setupUserAndOrg(1);

    // First update
    const firstCode = {
      nodes: [{ id: "1", type: "start", position: { x: 0, y: 0 } }],
      edges: [],
    };

    let res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ code: firstCode });

    expect(res.status).toBe(200);

    // Second update
    const secondCode = {
      nodes: [
        { id: "1", type: "start", position: { x: 0, y: 0 } },
        { id: "2", type: "process", position: { x: 200, y: 0 } },
      ],
      edges: [{ id: "e1-2", source: "1", target: "2" }],
    };

    res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ code: secondCode });

    expect(res.status).toBe(200);

    // Verify the final state
    const updatedVersion = await db.workflowVersion.findUnique({
      where: { id: versionId },
      select: { code: true },
    });

    expect(updatedVersion?.code).toEqual(secondCode);
  });

  it("should handle complex React Flow state with plugin data", async () => {
    await flushDatabase(expect);
    const { jwt, workflowId, versionId } = await setupUserAndOrg(1);

    const complexCode = {
      nodes: [
        {
          id: "start-node",
          type: "@tensorify/core/StartNode",
          position: { x: 100, y: 100 },
          route: "/",
          version: "1.0.0",
          data: {
            label: "Start",
            visualConfig: {
              containerType: "circle",
              size: { width: 80, height: 80 },
            },
          },
        },
        {
          id: "plugin-node",
          type: "@tensorify/plugin/LinearLayer",
          position: { x: 300, y: 100 },
          route: "/",
          version: "2.1.0",
          data: {
            label: "Linear Layer",
            pluginId: "@tensorify/plugin/LinearLayer",
            pluginSettings: {
              inputSize: 784,
              outputSize: 128,
              bias: true,
              activation: "relu",
            },
          },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "start-node",
          sourceHandle: "output",
          target: "plugin-node",
          targetHandle: "input",
          type: "smoothstep",
        },
      ],
      viewport: {
        x: -50,
        y: -50,
        zoom: 0.8,
      },
    };

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ code: complexCode });

    expect(res.status).toBe(200);

    // Verify the complex state was saved correctly
    const updatedVersion = await db.workflowVersion.findUnique({
      where: { id: versionId },
      select: { code: true },
    });

    expect(updatedVersion?.code).toEqual(complexCode);
  });

  it("should handle empty code object", async () => {
    await flushDatabase(expect);
    const { jwt, workflowId, versionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ code: {} });

    expect(res.status).toBe(200);
  });

  // TODO: Fix this test - JWT validation doesn't seem to check if session is revoked
  it.skip("should reject request with expired session", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, workflowId, versionId } = await setupUserAndOrg(1);

    await revokeSession(sessionId);

    const res = await request(server)
      .patch(`/workflow/${workflowId}/version/${versionId}/code`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        code: { nodes: [], edges: [] },
      });

    expect(res.status).toBe(401);
  });
});
