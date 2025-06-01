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
import { z } from "zod";
import { CreateRoleRequest, ResourceType, Permission } from "../schema";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

// Define the expected response type matching the Role schema
const GetRoleResponse = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  resourceType: ResourceType,
  resourceId: z.string(),
  permissions: z.array(
    z.object({
      permissionId: z.string(),
      type: z.enum(["ALLOW", "DENY"]),
    })
  ),
});

type GetRoleResponseType = z.infer<typeof GetRoleResponse>;

describe("GET /roles - Hierarchical Resource Paths", () => {
  // Helper function to set up a complete resource hierarchy
  async function setupCompleteHierarchy(botNum: number = 1) {
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
        projectId: project.id,
      },
    });

    return {
      ...userData,
      orgId,
      teamId: team.id,
      projectId: project.id,
      workflowId: workflow.id,
    };
  }

  // Helper function to get test permissions
  async function getTestPermissions(): Promise<z.infer<typeof Permission>[]> {
    const permissionRecords = await db.permissionDefinition.findMany();
    return permissionRecords.map((p) => ({
      id: p.id,
      action: p.action,
    }));
  }

  // Helper function to create roles for different resource types
  async function createRoleForResource(
    jwt: string,
    resourceType: string,
    resourceId: string,
    permissions: z.infer<typeof Permission>[],
    name = "Test Role"
  ) {
    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name,
      resourceType: resourceType as z.infer<typeof ResourceType>,
      resourceId,
      permissions: [
        { permissionId: permissions[0].id, type: "ALLOW" as const },
        ...(permissions.length > 1
          ? [{ permissionId: permissions[1].id, type: "DENY" as const }]
          : []),
      ],
    };

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createRolePayload);

    expect(res.status).toBe(201);
    return res.body;
  }

  // === Authentication Tests ===
  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const res = await request(server).get("/roles");
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Unauthorized");
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const res = await request(server)
      .get("/roles?resourceType=ORGANIZATION&resourcePath=org:test-org")
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Unauthorized");
  });

  it("should return 401 with an invalid __session cookie", async () => {
    await flushDatabase(expect);
    const res = await request(server)
      .get("/roles?resourceType=ORGANIZATION&resourcePath=org:test-org")
      .set("Cookie", "__session=invalid_session");
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Unauthorized");
  });

  // === Query Parameter Validation ===
  it("should return 400 if resourceType is missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupCompleteHierarchy(1);

    const res = await request(server)
      .get("/roles?resourcePath=org:test-org")
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    // expect(res.body.message).toContain("Request validation failed");

    await revokeSession(sessionId);
  });

  it("should return 400 if resourcePath is missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupCompleteHierarchy(1);

    const res = await request(server)
      .get("/roles?resourceType=ORGANIZATION")
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    // expect(res.body.message).toContain("Request validation failed");

    await revokeSession(sessionId);
  });

  it("should return 400 with invalid resourceType enum", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupCompleteHierarchy(1);

    const res = await request(server)
      .get("/roles?resourceType=INVALID_TYPE&resourcePath=org:test-org")
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    // expect(res.body.message).toContain("Request validation failed");

    await revokeSession(sessionId);
  });

  // === Hierarchical Path Format Validation ===
  it("should return 400 with invalid hierarchical path format", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupCompleteHierarchy(1);

    const invalidPaths = [
      "invalid-format",
      "org/123", // Missing colon
      "org:123/invalid:456", // Invalid resource type
      "team:456", // Missing required org
      "org:123/project:789", // Missing required team for project
      "org:123/workflow:123", // Missing required team and project for workflow
    ];

    for (const invalidPath of invalidPaths) {
      const res = await request(server)
        .get(`/roles?resourceType=ORGANIZATION&resourcePath=${invalidPath}`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(400);
      // expect(res.body.message).toContain("Request validation failed");
    }

    await revokeSession(sessionId);
  });

  // === Resource Hierarchy Validation ===
  it("should return 400 when organization does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupCompleteHierarchy(1);

    const res = await request(server)
      .get("/roles?resourceType=ORGANIZATION&resourcePath=org:non-existent-org")
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Organization non-existent-org not found"
    );

    await revokeSession(sessionId);
  });

  it("should return 400 when team does not exist in organization", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupCompleteHierarchy(1);

    const res = await request(server)
      .get(
        `/roles?resourceType=TEAM&resourcePath=org:${orgId}/team:non-existent-team`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Team non-existent-team not found");

    await revokeSession(sessionId);
  });

  it("should return 400 when project does not exist in team", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupCompleteHierarchy(1);

    const res = await request(server)
      .get(
        `/roles?resourceType=PROJECT&resourcePath=org:${orgId}/team:${teamId}/project:non-existent-project`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Project non-existent-project not found"
    );

    await revokeSession(sessionId);
  });

  it("should return 400 when workflow does not exist in project", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId, projectId } =
      await setupCompleteHierarchy(1);

    const res = await request(server)
      .get(
        `/roles?resourceType=WORKFLOW&resourcePath=org:${orgId}/team:${teamId}/project:${projectId}/workflow:non-existent-workflow`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Workflow non-existent-workflow not found"
    );

    await revokeSession(sessionId);
  });

  // === ORGANIZATION Resource Type Tests ===
  it("should return 200 with empty array for ORGANIZATION when no roles exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupCompleteHierarchy(1);

    const res = await request(server)
      .get(`/roles?resourceType=ORGANIZATION&resourcePath=org:${orgId}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);

    const parsedRes = z.array(GetRoleResponse).safeParse(res.body);
    expect(parsedRes.success).toBe(true);

    await revokeSession(sessionId);
  });

  it("should return 200 with roles for ORGANIZATION", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupCompleteHierarchy(1);
    const testPermissions = await getTestPermissions();
    expect(testPermissions.length).toBeGreaterThan(0);

    // Create an organization role
    const createdRole = await createRoleForResource(
      jwt,
      "ORGANIZATION",
      orgId,
      testPermissions,
      "Org Admin"
    );

    // Fetch organization roles
    const res = await request(server)
      .get(`/roles?resourceType=ORGANIZATION&resourcePath=org:${orgId}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);

    const role = res.body[0] as GetRoleResponseType;
    expect(role.id).toBe(createdRole.id);
    expect(role.name).toBe("Org Admin");
    expect(role.resourceType).toBe("ORGANIZATION");
    expect(role.resourceId).toBe(orgId);
    expect(Array.isArray(role.permissions)).toBe(true);
    expect(role.permissions.length).toBeGreaterThan(0);

    await revokeSession(sessionId);
  });

  // === TEAM Resource Type Tests ===
  it("should return 200 with empty array for TEAM when no roles exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupCompleteHierarchy(1);

    const res = await request(server)
      .get(`/roles?resourceType=TEAM&resourcePath=org:${orgId}/team:${teamId}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);

    await revokeSession(sessionId);
  });

  it("should return 200 with roles for TEAM", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupCompleteHierarchy(1);
    const testPermissions = await getTestPermissions();

    // Create a team role
    await createRoleForResource(
      jwt,
      "TEAM",
      teamId,
      testPermissions,
      "Team Lead"
    );

    // Fetch team roles
    const res = await request(server)
      .get(`/roles?resourceType=TEAM&resourcePath=org:${orgId}/team:${teamId}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);

    const role = res.body[0] as GetRoleResponseType;
    expect(role.name).toBe("Team Lead");
    expect(role.resourceType).toBe("TEAM");
    expect(role.resourceId).toBe(teamId);

    await revokeSession(sessionId);
  });

  // === PROJECT Resource Type Tests ===
  it("should return 200 with empty array for PROJECT when no roles exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId, projectId } =
      await setupCompleteHierarchy(1);

    const res = await request(server)
      .get(
        `/roles?resourceType=PROJECT&resourcePath=org:${orgId}/team:${teamId}/project:${projectId}`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);

    await revokeSession(sessionId);
  });

  it("should return 200 with roles for PROJECT", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId, projectId } =
      await setupCompleteHierarchy(1);
    const testPermissions = await getTestPermissions();

    // Create a project role
    await createRoleForResource(
      jwt,
      "PROJECT",
      projectId,
      testPermissions,
      "Project Manager"
    );

    // Fetch project roles
    const res = await request(server)
      .get(
        `/roles?resourceType=PROJECT&resourcePath=org:${orgId}/team:${teamId}/project:${projectId}`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);

    const role = res.body[0] as GetRoleResponseType;
    expect(role.name).toBe("Project Manager");
    expect(role.resourceType).toBe("PROJECT");
    expect(role.resourceId).toBe(projectId);

    await revokeSession(sessionId);
  });

  // === WORKFLOW Resource Type Tests ===
  it("should return 200 with empty array for WORKFLOW when no roles exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId, projectId, workflowId } =
      await setupCompleteHierarchy(1);

    const res = await request(server)
      .get(
        `/roles?resourceType=WORKFLOW&resourcePath=org:${orgId}/team:${teamId}/project:${projectId}/workflow:${workflowId}`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);

    await revokeSession(sessionId);
  });

  it("should return 200 with roles for WORKFLOW", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId, projectId, workflowId } =
      await setupCompleteHierarchy(1);
    const testPermissions = await getTestPermissions();

    // Create a workflow role
    await createRoleForResource(
      jwt,
      "WORKFLOW",
      workflowId,
      testPermissions,
      "Workflow Owner"
    );

    // Fetch workflow roles
    const res = await request(server)
      .get(
        `/roles?resourceType=WORKFLOW&resourcePath=org:${orgId}/team:${teamId}/project:${projectId}/workflow:${workflowId}`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);

    const role = res.body[0] as GetRoleResponseType;
    expect(role.name).toBe("Workflow Owner");
    expect(role.resourceType).toBe("WORKFLOW");
    expect(role.resourceId).toBe(workflowId);

    await revokeSession(sessionId);
  });

  // === Multiple Roles and Mixed Scenarios ===
  it("should handle multiple roles for the same resource", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupCompleteHierarchy(1);
    const testPermissions = await getTestPermissions();

    // Create multiple team roles
    const role1 = await createRoleForResource(
      jwt,
      "TEAM",
      teamId,
      testPermissions,
      "Team Admin"
    );
    const role2 = await createRoleForResource(
      jwt,
      "TEAM",
      teamId,
      testPermissions,
      "Team Member"
    );

    // Fetch team roles
    const res = await request(server)
      .get(`/roles?resourceType=TEAM&resourcePath=org:${orgId}/team:${teamId}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const roleIds = res.body.map((role: GetRoleResponseType) => role.id);
    expect(roleIds).toContain(role1.id);
    expect(roleIds).toContain(role2.id);

    await revokeSession(sessionId);
  });

  it("should return roles only for the specified resource, not parent resources", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId, projectId } =
      await setupCompleteHierarchy(1);
    const testPermissions = await getTestPermissions();

    // Create roles at different levels
    await createRoleForResource(
      jwt,
      "ORGANIZATION",
      orgId,
      testPermissions,
      "Org Role"
    );
    await createRoleForResource(
      jwt,
      "TEAM",
      teamId,
      testPermissions,
      "Team Role"
    );
    const projectRole = await createRoleForResource(
      jwt,
      "PROJECT",
      projectId,
      testPermissions,
      "Project Role"
    );

    // Fetch only project roles
    const res = await request(server)
      .get(
        `/roles?resourceType=PROJECT&resourcePath=org:${orgId}/team:${teamId}/project:${projectId}`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(projectRole.id);
    expect(res.body[0].name).toBe("Project Role");
    expect(res.body[0].resourceType).toBe("PROJECT");

    await revokeSession(sessionId);
  });

  it("should handle roles with mixed permission types (ALLOW/DENY)", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupCompleteHierarchy(1);
    const testPermissions = await getTestPermissions();
    expect(testPermissions.length).toBeGreaterThanOrEqual(3);

    // Create role with mixed permissions
    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name: "Mixed Permissions Role",
      resourceType: "ORGANIZATION",
      resourceId: orgId,
      permissions: [
        { permissionId: testPermissions[0].id, type: "ALLOW" as const },
        { permissionId: testPermissions[1].id, type: "DENY" as const },
        { permissionId: testPermissions[2].id, type: "ALLOW" as const },
      ],
    };

    const createRes = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createRolePayload);

    expect(createRes.status).toBe(201);

    // Fetch the role
    const res = await request(server)
      .get(`/roles?resourceType=ORGANIZATION&resourcePath=org:${orgId}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);

    const role = res.body[0] as GetRoleResponseType;
    expect(role.permissions.length).toBe(3);

    const allowPermissions = role.permissions.filter((p) => p.type === "ALLOW");
    const denyPermissions = role.permissions.filter((p) => p.type === "DENY");

    expect(allowPermissions.length).toBe(2);
    expect(denyPermissions.length).toBe(1);

    await revokeSession(sessionId);
  });

  // === Edge Cases ===
  it("should handle roles without description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupCompleteHierarchy(1);
    const testPermissions = await getTestPermissions();

    // Create role without description by directly using the endpoint
    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name: "No Description Role",
      resourceType: "ORGANIZATION",
      resourceId: orgId,
      permissions: [
        { permissionId: testPermissions[0].id, type: "ALLOW" as const },
      ],
    };

    await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createRolePayload);

    const res = await request(server)
      .get(`/roles?resourceType=ORGANIZATION&resourcePath=org:${orgId}`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("No Description Role");
    expect(res.body[0].description).toBeUndefined();

    await revokeSession(sessionId);
  });

  it("should validate path hierarchy matches resourceType", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId, teamId } = await setupCompleteHierarchy(1);

    // Try to query ORGANIZATION with TEAM path - this should fail because
    // ORGANIZATION queries should only use org:id paths, not org:id/team:id paths
    const res = await request(server)
      .get(
        `/roles?resourceType=ORGANIZATION&resourcePath=org:${orgId}/team:${teamId}`
      )
      .set("Authorization", `Bearer ${jwt}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Invalid path structure for ORGANIZATION. Expected 1 segments, got 2"
    );

    await revokeSession(sessionId);
  });
});
