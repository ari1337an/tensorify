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

describe("GET /organization/:orgId/workflows", () => {
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

  async function createWorkflowsForProject(
    projectId: string,
    count: number = 3
  ) {
    const workflows = [];
    for (let i = 1; i <= count; i++) {
      const workflow = await db.workflow.create({
        data: {
          name: `Test Workflow ${i}`,
          description: `Description for workflow ${i}`,
          projectId: projectId,
        },
      });
      workflows.push(workflow);
    }
    return workflows;
  }

  async function createAdditionalProjectWithWorkflows(
    teamId: string,
    workflowCount: number = 2
  ) {
    const project = await db.project.create({
      data: {
        name: "Additional Project",
        description: "Another project for testing",
        teamId: teamId,
      },
    });

    const workflows = [];
    for (let i = 1; i <= workflowCount; i++) {
      const workflow = await db.workflow.create({
        data: {
          name: `Additional Workflow ${i}`,
          description: `Description for additional workflow ${i}`,
          projectId: project.id,
        },
      });
      workflows.push(workflow);
    }

    return { project, workflows };
  }

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const { orgId } = await setupUserAndOrg(1);

    const res = await request(server).get(`/organization/${orgId}/workflows`);
    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const { orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get(`/organization/${orgId}/workflows`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(401);
  });

  it("should return 400 if orgId is not a valid UUID", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get("/organization/invalid-uuid/workflows")
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should return 404 if organization does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Use a valid UUID format but non-existent organization
    const nonExistentOrgId = "12345678-1234-1234-1234-123456789012";

    const res = await request(server)
      .get(`/organization/${nonExistentOrgId}/workflows`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Organization not found");

    await revokeSession(sessionId);
  });

  it("should return 200 with default workflow for organization with no additional workflows", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const res = await request(server)
      .get(`/organization/${orgId}/workflows`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1); // Default workflow created during onboarding
    expect(res.body.meta).toEqual({
      totalCount: 1,
      page: 1,
      size: 20,
      totalPages: 1,
    });

    // Verify the default workflow structure
    const defaultWorkflow = res.body.items[0];
    expect(defaultWorkflow).toHaveProperty("id");
    expect(defaultWorkflow).toHaveProperty("name");
    expect(defaultWorkflow).toHaveProperty("description");
    expect(defaultWorkflow).toHaveProperty("projectId");
    expect(defaultWorkflow).toHaveProperty("projectName");
    expect(defaultWorkflow).toHaveProperty("teamId");
    expect(defaultWorkflow).toHaveProperty("teamName");
    expect(defaultWorkflow).toHaveProperty("organizationId");
    expect(defaultWorkflow).toHaveProperty("memberCount");
    expect(defaultWorkflow).toHaveProperty("createdAt");
    expect(defaultWorkflow.organizationId).toBe(orgId);

    await revokeSession(sessionId);
  });

  it("should return 200 with workflows list for organization with workflows", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, projectId } = await setupUserAndOrg(1);

    // Create test workflows
    await createWorkflowsForProject(projectId, 3);

    const res = await request(server)
      .get(`/organization/${orgId}/workflows`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(4); // 3 created + 1 default workflow
    expect(res.body.meta.totalCount).toBe(4);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.size).toBe(20);
    expect(res.body.meta.totalPages).toBe(1);

    // Verify workflow structure includes project and team info
    const firstWorkflow = res.body.items[0];
    expect(firstWorkflow).toHaveProperty("id");
    expect(firstWorkflow).toHaveProperty("name");
    expect(firstWorkflow).toHaveProperty("description");
    expect(firstWorkflow).toHaveProperty("projectId");
    expect(firstWorkflow).toHaveProperty("projectName");
    expect(firstWorkflow).toHaveProperty("teamId");
    expect(firstWorkflow).toHaveProperty("teamName");
    expect(firstWorkflow).toHaveProperty("organizationId");
    expect(firstWorkflow).toHaveProperty("memberCount");
    expect(firstWorkflow).toHaveProperty("createdAt");
    expect(firstWorkflow.organizationId).toBe(orgId);
    expect(typeof firstWorkflow.projectName).toBe("string");
    expect(typeof firstWorkflow.teamName).toBe("string");

    await revokeSession(sessionId);
  });

  it("should handle pagination correctly with page parameter", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, projectId } = await setupUserAndOrg(1);

    // Create 5 workflows (plus 1 default = 6 total)
    await createWorkflowsForProject(projectId, 5);

    // Test first page with limit 2
    const res1 = await request(server)
      .get(`/organization/${orgId}/workflows?page=1&limit=2`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res1.status).toBe(200);
    expect(res1.body.items).toHaveLength(2);
    expect(res1.body.meta).toEqual({
      totalCount: 6, // 5 created + 1 default workflow
      page: 1,
      size: 2,
      totalPages: 3,
    });

    // Test second page
    const res2 = await request(server)
      .get(`/organization/${orgId}/workflows?page=2&limit=2`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res2.status).toBe(200);
    expect(res2.body.items).toHaveLength(2);
    expect(res2.body.meta).toEqual({
      totalCount: 6,
      page: 2,
      size: 2,
      totalPages: 3,
    });

    // Verify different workflows are returned
    expect(res1.body.items[0].id).not.toBe(res2.body.items[0].id);

    await revokeSession(sessionId);
  });

  it("should handle invalid pagination parameters gracefully", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    // Test with negative page
    const res1 = await request(server)
      .get(`/organization/${orgId}/workflows?page=-1`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res1.status).toBe(400);
    expect(res1.body.message).toContain(
      "Number must be greater than or equal to 1"
    );

    // Test with zero limit
    const res2 = await request(server)
      .get(`/organization/${orgId}/workflows?limit=0`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res2.status).toBe(400);
    expect(res2.body.message).toContain(
      "Number must be greater than or equal to 1"
    );

    // Test with limit over 100
    const res3 = await request(server)
      .get(`/organization/${orgId}/workflows?limit=101`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res3.status).toBe(400);
    expect(res3.body.message).toContain(
      "Number must be less than or equal to 100"
    );

    await revokeSession(sessionId);
  });

  it("should not return workflows from other organizations", async () => {
    await flushDatabase(expect);

    // Setup two different organizations
    const user1 = await setupUserAndOrg(1);
    const user2 = await setupUserAndOrg(2);

    // Create workflows for each organization
    await createWorkflowsForProject(user1.projectId, 2);
    await createWorkflowsForProject(user2.projectId, 3);

    // User 1 should only see their org's workflows (2 created + 1 default)
    const res1 = await request(server)
      .get(`/organization/${user1.orgId}/workflows`)
      .set("Authorization", `Bearer ${user1.jwt}`);

    expect(res1.status).toBe(200);
    expect(res1.body.items).toHaveLength(3); // 2 created + 1 default
    expect(res1.body.meta.totalCount).toBe(3);
    res1.body.items.forEach((workflow: any) => {
      expect(workflow.organizationId).toBe(user1.orgId);
    });

    // User 2 should only see their org's workflows (3 created + 1 default)
    const res2 = await request(server)
      .get(`/organization/${user2.orgId}/workflows`)
      .set("Authorization", `Bearer ${user2.jwt}`);

    expect(res2.status).toBe(200);
    expect(res2.body.items).toHaveLength(4); // 3 created + 1 default
    expect(res2.body.meta.totalCount).toBe(4);
    res2.body.items.forEach((workflow: any) => {
      expect(workflow.organizationId).toBe(user2.orgId);
    });

    await revokeSession(user1.sessionId);
    await revokeSession(user2.sessionId);
  });

  it("should handle SQL injection attempts safely", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    // Attempt SQL injection in orgId parameter
    const maliciousOrgId = "'; DROP TABLE workflows; --";

    const res = await request(server)
      .get(`/organization/${encodeURIComponent(maliciousOrgId)}/workflows`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid UUID");

    await revokeSession(sessionId);
  });

  it("should handle extremely large page numbers", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, projectId } = await setupUserAndOrg(1);

    await createWorkflowsForProject(projectId, 2);

    const res = await request(server)
      .get(`/organization/${orgId}/workflows?page=999999`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.meta.page).toBe(999999);
    expect(res.body.meta.totalCount).toBe(3); // 2 created + 1 default

    await revokeSession(sessionId);
  });

  it("should return workflows ordered by creation date (newest first)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, projectId } = await setupUserAndOrg(1);

    // Create workflows with slight delay to ensure different creation times
    const workflow1 = await db.workflow.create({
      data: {
        name: "First Workflow",
        description: "Created first",
        projectId: projectId,
      },
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const workflow2 = await db.workflow.create({
      data: {
        name: "Second Workflow",
        description: "Created second",
        projectId: projectId,
      },
    });

    const res = await request(server)
      .get(`/organization/${orgId}/workflows`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(3); // 2 created + 1 default workflow

    // Should be ordered by creation date descending (newest first)
    // workflow2 should be first, then workflow1, then the default workflow created during onboarding
    expect(res.body.items[0].id).toBe(workflow2.id);
    expect(res.body.items[1].id).toBe(workflow1.id);

    await revokeSession(sessionId);
  });

  it("should include workflows from all projects within the organization", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId, projectId } =
      await setupUserAndOrg(1);

    // Create workflows in the default project
    await createWorkflowsForProject(projectId, 2);

    // Create another project and workflows
    const { project: additionalProject, workflows: additionalWorkflows } =
      await createAdditionalProjectWithWorkflows(teamId, 2);

    const res = await request(server)
      .get(`/organization/${orgId}/workflows`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5); // 2 + 2 created + 1 default workflow
    expect(res.body.meta.totalCount).toBe(5);

    // Verify workflows from both projects are included
    const projectNames = res.body.items.map(
      (workflow: any) => workflow.projectName
    );
    expect(projectNames).toContain(additionalProject.name);

    // Verify all workflows belong to the same organization
    res.body.items.forEach((workflow: any) => {
      expect(workflow.organizationId).toBe(orgId);
    });

    await revokeSession(sessionId);
  });

  it("should correctly count members for workflows", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, projectId } = await setupUserAndOrg(1);

    // Create a workflow
    const workflow = await db.workflow.create({
      data: {
        name: "Workflow with members",
        description: "Testing member count",
        projectId: projectId,
      },
    });

    // Create additional users and add them as workflow members
    const user1 = await db.user.create({
      data: {
        email: "workflowmember1@test.com",
        firstName: "Workflow",
        lastName: "Member1",
        imageUrl: "https://example.com/avatar1.jpg",
      },
    });

    const user2 = await db.user.create({
      data: {
        email: "workflowmember2@test.com",
        firstName: "Workflow",
        lastName: "Member2",
        imageUrl: "https://example.com/avatar2.jpg",
      },
    });

    // Add users to the workflow
    await db.workflow.update({
      where: { id: workflow.id },
      data: {
        members: {
          connect: [{ id: user1.id }, { id: user2.id }],
        },
      },
    });

    const res = await request(server)
      .get(`/organization/${orgId}/workflows`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);

    // Find our test workflow and verify member count
    const testWorkflow = res.body.items.find((w: any) => w.id === workflow.id);
    expect(testWorkflow).toBeDefined();
    expect(testWorkflow.memberCount).toBe(2);

    await revokeSession(sessionId);
  });
});
