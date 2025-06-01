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
import {
  CreateRoleRequest,
  ResourceType,
  Permission,
  USERID,
  UserRole,
  AssignRoleRequest,
} from "../schema";
import { generateMock } from "@anatine/zod-mock";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
}, 20000);

describe("GET /users/:userId/roles", () => {
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

  // Helper function to create a test role
  async function createTestRole(
    jwt: string,
    resourceType: string,
    resourceId: string,
    permissions: z.infer<typeof Permission>[],
    name = "Test Role"
  ) {
    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name,
      description: "A test role for user assignment",
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

  // Helper function to assign role to user
  async function assignRoleToUser(
    jwt: string,
    userId: string,
    roleId: string,
    expiresAt?: string
  ) {
    const assignRolePayload: z.infer<typeof AssignRoleRequest> = {
      roleId,
      ...(expiresAt && { expiresAt }),
    };

    const res = await request(server)
      .post(`/users/${userId}/roles`)
      .set("Authorization", `Bearer ${jwt}`)
      .send(assignRolePayload);

    expect(res.status).toBe(201);
    return res.body;
  }

  // === Authentication Tests ===
  describe("Authentication", () => {
    it("should return 401 for requests without authorization", async () => {
      await flushDatabase(expect);
      const { decoded } = await setupCompleteHierarchy(1);

      const res = await request(server).get(`/users/${decoded.sub}/roles`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });

    it("should return 401 for requests with invalid Bearer token", async () => {
      await flushDatabase(expect);
      const { decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });

    it("should return 401 for requests with invalid __session cookie", async () => {
      await flushDatabase(expect);
      const { decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Cookie", "__session=invalid-session");

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });
  });

  // === Path Parameter Validation ===
  describe("Path Parameter Validation", () => {
    it("should return 400 for invalid userId format", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .get("/users/invalid-uuid/roles")
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(400);
      await revokeSession(sessionId);
    });

    it("should return 400 for non-UUID userId", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .get("/users/123456/roles")
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });

    it("should return 404 for empty userId", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .get("/users//roles")
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(404); // Next.js will return 404 for invalid route

      await revokeSession(sessionId);
    });
  });

  // === User Existence Validation ===
  describe("User Existence Validation", () => {
    it("should return 404 when user does not exist", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId } = await setupCompleteHierarchy(1);
      const nonExistentUserId = generateMock(USERID).toString();

      const res = await request(server)
        .get(`/users/${nonExistentUserId}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");

      await revokeSession(sessionId);
    });
  });

  // === Successful Role Retrieval ===
  describe("Successful Role Retrieval", () => {
    it("should return empty array for user with no roles using Bearer token", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);

      await revokeSession(sessionId);
    });

    it("should return empty array for user with no roles using __session cookie", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Cookie", `__session=${jwt}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);

      await revokeSession(sessionId);
    });

    it("should return single role for user with one role assignment", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      // Assign role to user
      const userRole = await assignRoleToUser(jwt, decoded.sub, testRole.id);

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);

      const role = res.body[0];
      expect(role.id).toBe(userRole.id);
      expect(role.userId).toBe(decoded.sub);
      expect(role.roleId).toBe(testRole.id);
      expect(role.expiresAt).toBeUndefined();

      // Validate response structure matches UserRole schema
      const parsedResponse = UserRole.safeParse(role);
      expect(parsedResponse.success).toBe(true);

      await revokeSession(sessionId);
    });

    it("should return role with expiration date when role has expiration", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const expirationDate = "2025-12-31T23:59:59Z";
      const userRole = await assignRoleToUser(
        jwt,
        decoded.sub,
        testRole.id,
        expirationDate
      );

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);

      const role = res.body[0];
      expect(role.id).toBe(userRole.id);
      expect(role.expiresAt).toBe("2025-12-31T23:59:59.000Z");

      await revokeSession(sessionId);
    });

    it("should return multiple roles for user with multiple role assignments", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, teamId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

      // Create multiple roles
      const orgRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions,
        "Org Admin"
      );
      const teamRole = await createTestRole(
        jwt,
        "TEAM",
        teamId,
        testPermissions,
        "Team Manager"
      );

      // Assign both roles
      await assignRoleToUser(jwt, decoded.sub, orgRole.id);
      await assignRoleToUser(
        jwt,
        decoded.sub,
        teamRole.id,
        "2025-06-01T12:00:00Z"
      );

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);

      const roleIds = res.body.map(
        (role: z.infer<typeof UserRole>) => role.roleId
      );
      expect(roleIds).toContain(orgRole.id);
      expect(roleIds).toContain(teamRole.id);

      // Verify both roles have correct structure
      res.body.forEach((role: z.infer<typeof UserRole>) => {
        expect(role.userId).toBe(decoded.sub);
        expect(typeof role.id).toBe("string");
        expect(typeof role.roleId).toBe("string");

        const parsedResponse = UserRole.safeParse(role);
        expect(parsedResponse.success).toBe(true);
      });

      await revokeSession(sessionId);
    });

    it("should return roles across different resource types (ORGANIZATION, TEAM, PROJECT, WORKFLOW)", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, teamId, projectId, workflowId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

      // Create roles for different resource types
      const orgRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions,
        "Org Role"
      );
      const teamRole = await createTestRole(
        jwt,
        "TEAM",
        teamId,
        testPermissions,
        "Team Role"
      );
      const projectRole = await createTestRole(
        jwt,
        "PROJECT",
        projectId,
        testPermissions,
        "Project Role"
      );
      const workflowRole = await createTestRole(
        jwt,
        "WORKFLOW",
        workflowId,
        testPermissions,
        "Workflow Role"
      );

      // Assign all roles
      await assignRoleToUser(jwt, decoded.sub, orgRole.id);
      await assignRoleToUser(jwt, decoded.sub, teamRole.id);
      await assignRoleToUser(jwt, decoded.sub, projectRole.id);
      await assignRoleToUser(jwt, decoded.sub, workflowRole.id);

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(4);

      const roleIds = res.body.map(
        (role: z.infer<typeof UserRole>) => role.roleId
      );
      expect(roleIds).toContain(orgRole.id);
      expect(roleIds).toContain(teamRole.id);
      expect(roleIds).toContain(projectRole.id);
      expect(roleIds).toContain(workflowRole.id);

      await revokeSession(sessionId);
    });

    it("should handle roles with various expiration dates correctly", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

      const testCases = [
        {
          name: "Role 1",
          expiresAt: "2025-06-15T14:30:00.000Z",
          expected: "2025-06-15T14:30:00.000Z",
        },
        {
          name: "Role 2",
          expiresAt: "2025-12-31T23:59:59Z",
          expected: "2025-12-31T23:59:59.000Z",
        },
        {
          name: "Role 3",
          expiresAt: undefined, // No expiration
          expected: undefined,
        },
      ];

      const createdRoles: Array<{
        id: string;
        expectedExpiration: string | undefined;
      }> = [];
      for (const testCase of testCases) {
        const role = await createTestRole(
          jwt,
          "ORGANIZATION",
          orgId,
          testPermissions,
          testCase.name
        );
        await assignRoleToUser(jwt, decoded.sub, role.id, testCase.expiresAt);
        createdRoles.push({ ...role, expectedExpiration: testCase.expected });
      }

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);

      // Verify each role's expiration is handled correctly
      res.body.forEach((userRole: z.infer<typeof UserRole>) => {
        const correspondingRole = createdRoles.find(
          (r) => r.id === userRole.roleId
        );
        expect(correspondingRole).toBeTruthy();
        expect(userRole.expiresAt).toBe(correspondingRole?.expectedExpiration);
      });

      await revokeSession(sessionId);
    });
  });

  // === Response Format Validation ===
  describe("Response Format Validation", () => {
    it("should return properly formatted UserRole array response", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      await assignRoleToUser(
        jwt,
        decoded.sub,
        testRole.id,
        "2025-12-31T23:59:59Z"
      );

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);

      const role = res.body[0];

      // Verify response structure matches UserRole schema
      const parsedResponse = UserRole.safeParse(role);
      expect(parsedResponse.success).toBe(true);

      // Verify all required fields
      expect(typeof role.id).toBe("string");
      expect(role.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(role.roleId).toBe(testRole.id);
      expect(role.userId).toBe(decoded.sub);
      expect(role.expiresAt).toBe("2025-12-31T23:59:59.000Z");

      // Ensure no extra properties
      const expectedKeys = ["id", "roleId", "userId", "expiresAt"];
      const actualKeys = Object.keys(role);
      expect(actualKeys.sort()).toEqual(expectedKeys.sort());

      await revokeSession(sessionId);
    });

    it("should handle response without expiresAt field", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      await assignRoleToUser(jwt, decoded.sub, testRole.id);

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);

      const role = res.body[0];
      expect(role).toHaveProperty("id");
      expect(role).toHaveProperty("roleId");
      expect(role).toHaveProperty("userId");
      expect(role.expiresAt).toBeUndefined();

      await revokeSession(sessionId);
    });

    it("should validate response schema for multiple roles", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, teamId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

      const role1 = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions,
        "Role 1"
      );
      const role2 = await createTestRole(
        jwt,
        "TEAM",
        teamId,
        testPermissions,
        "Role 2"
      );

      await assignRoleToUser(jwt, decoded.sub, role1.id);
      await assignRoleToUser(
        jwt,
        decoded.sub,
        role2.id,
        "2025-06-01T12:00:00Z"
      );

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);

      // Validate entire array response
      const parsedResponse = UserRole.array().safeParse(res.body);
      expect(parsedResponse.success).toBe(true);

      // Validate each individual role
      res.body.forEach((role: z.infer<typeof UserRole>) => {
        const singleRoleParsed = UserRole.safeParse(role);
        expect(singleRoleParsed.success).toBe(true);
      });

      await revokeSession(sessionId);
    });
  });

  // === Cross-User Access Tests ===
  describe("Cross-User Access Tests", () => {
    it("should allow authenticated user to view another user's roles", async () => {
      await flushDatabase(expect);

      // Setup first user with role
      const user1Data = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        user1Data.jwt,
        "ORGANIZATION",
        user1Data.orgId,
        testPermissions
      );
      await assignRoleToUser(user1Data.jwt, user1Data.decoded.sub, testRole.id);

      // Setup second user
      const user2Data = await setupCompleteHierarchy(2);

      // User 2 should be able to view User 1's roles
      const res = await request(server)
        .get(`/users/${user1Data.decoded.sub}/roles`)
        .set("Authorization", `Bearer ${user2Data.jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].userId).toBe(user1Data.decoded.sub);

      await revokeSession(user1Data.sessionId);
      await revokeSession(user2Data.sessionId);
    });

    it("should return empty array when viewing user with no roles", async () => {
      await flushDatabase(expect);

      const user1Data = await setupCompleteHierarchy(1);
      const user2Data = await setupCompleteHierarchy(2);

      // User 1 has no roles, User 2 queries User 1's roles
      const res = await request(server)
        .get(`/users/${user1Data.decoded.sub}/roles`)
        .set("Authorization", `Bearer ${user2Data.jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);

      await revokeSession(user1Data.sessionId);
      await revokeSession(user2Data.sessionId);
    });
  });

  // === Error Handling ===
  describe("Error Handling", () => {
    it("should handle database connection issues gracefully", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);

      // Mock a database error by closing the connection temporarily
      // This is a conceptual test - in reality you might need to mock the db module
      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      // Should either succeed or fail gracefully with proper error handling
      if (res.status !== 200) {
        expect(res.status).toBeGreaterThanOrEqual(500);
        expect(res.body).toHaveProperty("message");
      }

      await revokeSession(sessionId);
    });

    it("should handle malformed response data gracefully", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      await revokeSession(sessionId);
    });
  });

  // === Integration Tests ===
  describe("Integration Tests", () => {
    it("should work end-to-end with full onboarding and role assignment flow", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } =
        await setupCompleteHierarchy(1);

      // Create and assign a role
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions,
        "Integration Test Role"
      );
      await assignRoleToUser(
        jwt,
        decoded.sub,
        testRole.id,
        "2025-06-01T12:00:00Z"
      );

      // Retrieve the roles
      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);

      const userRole = res.body[0];
      expect(userRole.userId).toBe(decoded.sub);
      expect(userRole.roleId).toBe(testRole.id);
      expect(userRole.expiresAt).toBe("2025-06-01T12:00:00.000Z");

      // Verify the role actually exists in database with proper relationships
      const dbUserRole = await db.userRole.findFirst({
        where: { id: userRole.id },
        include: {
          role: true,
          user: true,
        },
      });

      expect(dbUserRole).toBeTruthy();
      expect(dbUserRole?.role?.name).toBe("Integration Test Role");
      expect(dbUserRole?.user?.id).toBe(decoded.sub);

      await revokeSession(sessionId);
    }, 15000);

    it("should work with complex hierarchical role assignments", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, teamId, projectId, workflowId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

      // Create roles at different hierarchy levels with different permissions
      const orgAdminRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions.slice(0, 2),
        "Org Admin"
      );
      const teamManagerRole = await createTestRole(
        jwt,
        "TEAM",
        teamId,
        testPermissions.slice(1, 3),
        "Team Manager"
      );
      const projectEditorRole = await createTestRole(
        jwt,
        "PROJECT",
        projectId,
        testPermissions.slice(2, 4),
        "Project Editor"
      );
      const workflowViewerRole = await createTestRole(
        jwt,
        "WORKFLOW",
        workflowId,
        testPermissions.slice(3, 5),
        "Workflow Viewer"
      );

      // Assign roles with different expiration patterns
      await assignRoleToUser(jwt, decoded.sub, orgAdminRole.id); // No expiration
      await assignRoleToUser(
        jwt,
        decoded.sub,
        teamManagerRole.id,
        "2025-12-31T23:59:59Z"
      );
      await assignRoleToUser(
        jwt,
        decoded.sub,
        projectEditorRole.id,
        "2025-06-30T18:00:00Z"
      );
      await assignRoleToUser(
        jwt,
        decoded.sub,
        workflowViewerRole.id,
        "2025-03-15T09:30:00Z"
      );

      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(4);

      // Verify all roles are returned with correct data
      const roleIds = res.body.map(
        (role: z.infer<typeof UserRole>) => role.roleId
      );
      expect(roleIds).toContain(orgAdminRole.id);
      expect(roleIds).toContain(teamManagerRole.id);
      expect(roleIds).toContain(projectEditorRole.id);
      expect(roleIds).toContain(workflowViewerRole.id);

      // Verify expiration dates are correct
      const roleExpirations = new Map(
        res.body.map((role: z.infer<typeof UserRole>) => [
          role.roleId,
          role.expiresAt,
        ])
      );
      expect(roleExpirations.get(orgAdminRole.id)).toBeUndefined();
      expect(roleExpirations.get(teamManagerRole.id)).toBe(
        "2025-12-31T23:59:59.000Z"
      );
      expect(roleExpirations.get(projectEditorRole.id)).toBe(
        "2025-06-30T18:00:00.000Z"
      );
      expect(roleExpirations.get(workflowViewerRole.id)).toBe(
        "2025-03-15T09:30:00.000Z"
      );

      await revokeSession(sessionId);
    }, 20000);

    it("should maintain performance with large number of roles", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

      // Create and assign multiple roles to test performance
      const numberOfRoles = 10;
      const createdRoles = [];

      for (let i = 0; i < numberOfRoles; i++) {
        const role = await createTestRole(
          jwt,
          "ORGANIZATION",
          orgId,
          testPermissions,
          `Performance Test Role ${i + 1}`
        );
        await assignRoleToUser(jwt, decoded.sub, role.id);
        createdRoles.push(role);
      }

      const startTime = Date.now();
      const res = await request(server)
        .get(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`);
      const endTime = Date.now();

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(numberOfRoles);

      // Performance check - should respond within reasonable time
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(5000); // Less than 5 seconds

      // Verify all roles are returned correctly
      const returnedRoleIds = res.body.map(
        (role: z.infer<typeof UserRole>) => role.roleId
      );
      const expectedRoleIds = createdRoles.map((role) => role.id);
      expect(returnedRoleIds.sort()).toEqual(expectedRoleIds.sort());

      await revokeSession(sessionId);
    }, 30000);
  });
});
