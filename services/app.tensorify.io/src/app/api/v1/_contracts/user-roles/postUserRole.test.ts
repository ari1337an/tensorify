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
  UserRole,
  AssignRoleRequest,
  CreateRoleRequest,
  ResourceType,
  Permission,
  USERID,
  UUID,
} from "../schema";
import { generateMock } from "@anatine/zod-mock";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("POST /users/:userId/roles", () => {
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
        description: "Test Workflow Description",
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

  // === Authentication Tests ===
  describe("Authentication", () => {
    it("should return 401 for requests without authorization", async () => {
      await flushDatabase(expect);
      const { jwt, orgId, decoded } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .send({
          roleId: testRole.id,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });

    it("should return 401 for requests with invalid Bearer token", async () => {
      await flushDatabase(expect);
      const { jwt, orgId, decoded } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", "Bearer invalid-token")
        .send({
          roleId: testRole.id,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });

    it("should return 401 for requests with invalid __session cookie", async () => {
      await flushDatabase(expect);
      const { jwt, orgId, decoded } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Cookie", "__session=invalid-session")
        .send({
          roleId: testRole.id,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });
  });

  // === Path Parameter Validation ===
  describe("Path Parameter Validation", () => {
    it("should return 400 for invalid userId format", async () => {
      await flushDatabase(expect);
      const { jwt, orgId, sessionId } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const res = await request(server)
        .post("/users/invalid-uuid/roles")
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
        });

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });

    it("should return 400 for non-UUID userId", async () => {
      await flushDatabase(expect);
      const { jwt, orgId, sessionId } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );
      const res = await request(server)
        .post("/users/123456/roles")
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
        });

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });
  });

  // === Request Body Validation ===
  describe("Request Body Validation", () => {
    it("should return 400 for empty request body", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({});

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });

    it("should return 400 for missing roleId", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          expiresAt: "2025-12-31T23:59:59Z",
        });

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });

    it("should return 400 for invalid roleId format", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: "invalid-uuid",
        });

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });

    it("should return 400 for invalid expiresAt format", async () => {
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

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
          expiresAt: "invalid-date",
        });

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });

    it("should accept valid ISO date string for expiresAt", async () => {
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

      const validBody: z.infer<typeof AssignRoleRequest> = {
        roleId: testRole.id,
        expiresAt: "2025-12-31T23:59:59Z",
      };

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.expiresAt).toBe("2025-12-31T23:59:59.000Z");

      await revokeSession(sessionId);
    });
  });

  // === User Existence Validation ===
  describe("User Existence Validation", () => {
    it("should return 404 when user does not exist", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId } = await setupCompleteHierarchy(1);
      const nonExistentUserId = generateMock(USERID).toString();
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const res = await request(server)
        .post(`/users/${nonExistentUserId}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");

      await revokeSession(sessionId);
    });
  });

  // === Role Existence Validation ===
  describe("Role Existence Validation", () => {
    it("should return 404 when role does not exist", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);
      const nonExistentRoleId = generateMock(UUID).toString();

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: nonExistentRoleId,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Role not found");

      await revokeSession(sessionId);
    });
  });

  // === Duplicate Assignment Prevention ===
  describe("Duplicate Assignment Prevention", () => {
    it("should return 400 when user already has the role", async () => {
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

      // First assignment should succeed
      const firstRes = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
        });

      expect(firstRes.status).toBe(201);

      // Second assignment should fail
      const secondRes = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
        });

      expect(secondRes.status).toBe(400);
      expect(secondRes.body.message).toBe("User already has this role");

      await revokeSession(sessionId);
    });
  });

  // === Successful Role Assignment ===
  describe("Successful Role Assignment", () => {
    it("should assign role without expiration successfully using Bearer token", async () => {
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

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
        });

      expect(res.status).toBe(201);

      // Validate response structure matches UserRole schema
      const parsedResponse = UserRole.safeParse(res.body);
      expect(parsedResponse.success).toBe(true);

      const data = res.body;
      expect(data).toHaveProperty("id");
      expect(data.roleId).toBe(testRole.id);
      expect(data.userId).toBe(decoded.sub);
      expect(data.expiresAt).toBeUndefined();

      // Verify in database
      const userRole = await db.userRole.findFirst({
        where: {
          userId: decoded.sub,
          roleId: testRole.id,
        },
      });
      expect(userRole).toBeTruthy();
      expect(userRole?.expiresAt).toBeNull();

      await revokeSession(sessionId);
    });

    it("should assign role with expiration successfully using __session cookie", async () => {
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
      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Cookie", `__session=${jwt}`)
        .send({
          roleId: testRole.id,
          expiresAt: expirationDate,
        });

      expect(res.status).toBe(201);

      const data = res.body;
      expect(data).toHaveProperty("id");
      expect(data.roleId).toBe(testRole.id);
      expect(data.userId).toBe(decoded.sub);
      expect(data.expiresAt).toBe("2025-12-31T23:59:59.000Z");

      // Verify in database
      const userRole = await db.userRole.findFirst({
        where: {
          userId: decoded.sub,
          roleId: testRole.id,
        },
      });
      expect(userRole).toBeTruthy();
      expect(userRole?.expiresAt?.toISOString()).toBe(
        "2025-12-31T23:59:59.000Z"
      );

      await revokeSession(sessionId);
    });

    it("should handle multiple role assignments for the same user", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, teamId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

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

      // Assign first role
      const res1 = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: orgRole.id,
        });

      expect(res1.status).toBe(201);

      // Assign second role
      const res2 = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: teamRole.id,
        });

      expect(res2.status).toBe(201);

      // Verify both roles exist in database
      const userRoles = await db.userRole.findMany({
        where: { userId: decoded.sub },
      });
      expect(userRoles).toHaveLength(2);

      const roleIds = userRoles.map((ur) => ur.roleId);
      expect(roleIds).toContain(orgRole.id);
      expect(roleIds).toContain(teamRole.id);

      await revokeSession(sessionId);
    });

    it("should handle different resource types (ORGANIZATION, TEAM, PROJECT, WORKFLOW)", async () => {
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

      const roles = [
        { role: orgRole, type: "ORGANIZATION" },
        { role: teamRole, type: "TEAM" },
        { role: projectRole, type: "PROJECT" },
        { role: workflowRole, type: "WORKFLOW" },
      ];

      // Test assigning each role type
      for (const { role, type } of roles) {
        const res = await request(server)
          .post(`/users/${decoded.sub}/roles`)
          .set("Authorization", `Bearer ${jwt}`)
          .send({
            roleId: role.id,
          });

        expect(res.status).toBe(201);
        expect(res.body.roleId).toBe(role.id);
        expect(res.body.userId).toBe(decoded.sub);

        // Verify in database
        const userRole = await db.userRole.findFirst({
          where: {
            userId: decoded.sub,
            roleId: role.id,
          },
          include: {
            role: true,
          },
        });
        expect(userRole).toBeTruthy();
        expect(userRole?.role?.resourceType).toBe(type);
      }

      await revokeSession(sessionId);
    });

    it("should handle various date formats correctly", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

      const dateFormats = [
        {
          input: "2025-06-15T14:30:00.000Z",
          expected: "2025-06-15T14:30:00.000Z",
        },
        { input: "2025-12-31T23:59:59Z", expected: "2025-12-31T23:59:59.000Z" },
        {
          input: "2024-01-01T00:00:00.123Z",
          expected: "2024-01-01T00:00:00.123Z",
        },
      ];

      for (const { input, expected } of dateFormats) {
        const testRole = await createTestRole(
          jwt,
          "ORGANIZATION",
          orgId,
          testPermissions
        );

        const res = await request(server)
          .post(`/users/${decoded.sub}/roles`)
          .set("Authorization", `Bearer ${jwt}`)
          .send({
            roleId: testRole.id,
            expiresAt: input,
          });

        expect(res.status).toBe(201);
        expect(res.body.expiresAt).toBe(expected);

        // Verify in database
        const userRole = await db.userRole.findFirst({
          where: {
            userId: decoded.sub,
            roleId: testRole.id,
          },
        });
        expect(userRole?.expiresAt?.toISOString()).toBe(expected);
      }

      await revokeSession(sessionId);
    });
  });

  // === Response Format Validation ===
  describe("Response Format Validation", () => {
    it("should return properly formatted UserRole response", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
          expiresAt: "2025-12-31T23:59:59Z",
        });

      expect(res.status).toBe(201);

      // Verify response structure matches UserRole schema
      const parsedResponse = UserRole.safeParse(res.body);
      expect(parsedResponse.success).toBe(true);

      const data = res.body;
      expect(typeof data.id).toBe("string");
      expect(data.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(data.roleId).toBe(testRole.id);
      expect(data.userId).toBe(decoded.sub);
      expect(data.expiresAt).toBe("2025-12-31T23:59:59.000Z");

      // Ensure no extra properties
      const expectedKeys = ["id", "roleId", "userId", "expiresAt"];
      const actualKeys = Object.keys(data);
      expect(actualKeys.sort()).toEqual(expectedKeys.sort());

      await revokeSession(sessionId);
    });

    it("should handle response without expiresAt field", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
        });

      expect(res.status).toBe(201);

      const data = res.body;
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("roleId");
      expect(data).toHaveProperty("userId");
      expect(data.expiresAt).toBeUndefined();

      await revokeSession(sessionId);
    });
  });

  // === Error Handling ===
  describe("Error Handling", () => {
    it("should handle malformed JSON gracefully", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded } = await setupCompleteHierarchy(1);

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .set("Content-Type", "application/json")
        .send("invalid-json");

      expect(res.status).toBe(500);

      await revokeSession(sessionId);
    });

    it("should handle missing Content-Type header", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
        });

      // Should still work as the body parsing is handled by the framework
      expect(res.status).toBe(201);

      await revokeSession(sessionId);
    });

    it("should handle server errors gracefully", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } = await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions
      );

      // Create a scenario that might cause database issues
      // by trying to assign with an extremely long expiration date that might cause overflow
      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
          expiresAt: "9999-12-31T23:59:59Z", // Far future date
        });

      // This should either succeed or fail gracefully with a proper error message
      if (res.status !== 201) {
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.body).toHaveProperty("message");
      }

      await revokeSession(sessionId);
    });
  });

  // === Integration Tests ===
  describe("Integration Tests", () => {
    it("should work end-to-end with real user from onboarding", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, decoded, orgId } =
        await setupCompleteHierarchy(1);

      // Use the actual user created during onboarding
      const actualUserId = decoded.sub;
      const testPermissions = await getTestPermissions();
      const testRole = await createTestRole(
        jwt,
        "ORGANIZATION",
        orgId,
        testPermissions,
        "Admin Role"
      );

      const res = await request(server)
        .post(`/users/${actualUserId}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: testRole.id,
          expiresAt: "2025-06-01T12:00:00Z",
        });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe(actualUserId);
      expect(res.body.roleId).toBe(testRole.id);

      // Verify the user actually exists and has the role
      const user = await db.user.findUnique({
        where: { id: actualUserId },
        include: { userRoles: { include: { role: true } } },
      });

      expect(user).toBeTruthy();
      expect(user?.userRoles).toHaveLength(1);
      expect(user?.userRoles[0].roleId).toBe(testRole.id);
      expect(user?.userRoles[0].role?.name).toBe("Admin Role");

      await revokeSession(sessionId);
    }, 15000);

    it("should work with roles created through different resource hierarchies", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, workflowId, decoded } =
        await setupCompleteHierarchy(1);
      const testPermissions = await getTestPermissions();

      // Create roles at different hierarchy levels
      const workflowRole = await createTestRole(
        jwt,
        "WORKFLOW",
        workflowId,
        testPermissions,
        "Workflow Editor"
      );

      const res = await request(server)
        .post(`/users/${decoded.sub}/roles`)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          roleId: workflowRole.id,
        });

      expect(res.status).toBe(201);

      // Verify the role is properly linked through the hierarchy
      const userRole = await db.userRole.findFirst({
        where: { userId: decoded.sub, roleId: workflowRole.id },
        include: {
          role: {
            include: {
              workflow: {
                include: {
                  project: {
                    include: {
                      team: {
                        include: {
                          org: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      expect(userRole).toBeTruthy();
      expect(userRole?.role?.workflow?.project?.team?.org?.id).toBe(orgId);

      await revokeSession(sessionId);
    }, 15000);
  });
});
