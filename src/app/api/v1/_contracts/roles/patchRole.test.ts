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
const PatchRoleResponse = z.object({
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

type PatchRoleResponseType = z.infer<typeof PatchRoleResponse>;

describe("PATCH /roles/:roleId", () => {
  // Helper function to set up a user and organization
  async function setupUserAndOrg(botNum: number = 1) {
    const userData = await signInTestAccount(botNum, false, false);
    const questions = (await request(server).get("/onboarding/questions")).body;
    const onboardingRequestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    const onboardingResponse = await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send(onboardingRequestBody);

    return { ...userData, orgId: onboardingResponse.body.orgId };
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
    orgId: string,
    permissions: z.infer<typeof Permission>[],
    name = "Test Role",
    description?: string
  ) {
    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name,
      description,
      resourceType: ResourceType.enum.ORGANIZATION,
      resourceId: orgId,
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
    const res = await request(server)
      .patch("/roles/123e4567-e89b-12d3-a456-426614174000")
      .send({ name: "Updated Role" });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Unauthorized");
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const res = await request(server)
      .patch("/roles/123e4567-e89b-12d3-a456-426614174000")
      .set("Authorization", "Bearer invalid_token")
      .send({ name: "Updated Role" });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Unauthorized");
  });

  it("should return 401 with an invalid __session cookie", async () => {
    await flushDatabase(expect);
    const res = await request(server)
      .patch("/roles/123e4567-e89b-12d3-a456-426614174000")
      .set("Cookie", "__session=invalid_session")
      .send({ name: "Updated Role" });
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Unauthorized");
  });

  // === Path Parameter Validation ===
  it("should return 400 with invalid UUID format for roleId", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch("/roles/invalid-uuid")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ name: "Updated Role" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Request validation failed");

    await revokeSession(sessionId);
  });

  // === Request Body Validation ===
  it("should return 400 if request body is empty", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch("/roles/123e4567-e89b-12d3-a456-426614174000")
      .set("Authorization", `Bearer ${jwt}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Request validation failed"
    );

    await revokeSession(sessionId);
  });

  it("should return 400 if name is empty string", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .patch("/roles/123e4567-e89b-12d3-a456-426614174000")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Request validation failed");

    await revokeSession(sessionId);
  });

  it("should accept valid request body with only name", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();
    const createdRole = await createTestRole(jwt, orgId, testPermissions);

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ name: "Updated Role Name" });

    expect(res.status).toBe(200);

    await revokeSession(sessionId);
  });

  it("should accept valid request body with only description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();
    const createdRole = await createTestRole(jwt, orgId, testPermissions);

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ description: "Updated description" });

    expect(res.status).toBe(200);

    await revokeSession(sessionId);
  });

  it("should accept null description to clear it", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();
    const createdRole = await createTestRole(
      jwt,
      orgId,
      testPermissions,
      "Test Role",
      "Initial description"
    );

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ description: null });

    expect(res.status).toBe(200);
    expect(res.body.description).toBeUndefined();

    await revokeSession(sessionId);
  });

  // === Role Not Found Tests ===
  it("should return 404 when role does not exist", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const nonExistentRoleId = "123e4567-e89b-12d3-a456-426614174000";
    const res = await request(server)
      .patch(`/roles/${nonExistentRoleId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ name: "Updated Role" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Role not found");

    await revokeSession(sessionId);
  });

  // === Successful Update Tests ===
  it("should successfully update role name", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();
    expect(testPermissions.length).toBeGreaterThan(0);

    const createdRole = await createTestRole(
      jwt,
      orgId,
      testPermissions,
      "Original Name",
      "Original description"
    );

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ name: "Updated Role Name" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(false);

    const parsedRes = PatchRoleResponse.safeParse(res.body);
    expect(parsedRes.success).toBe(true);

    const role = res.body as PatchRoleResponseType;
    expect(role.id).toBe(createdRole.id);
    expect(role.name).toBe("Updated Role Name");
    expect(role.description).toBe("Original description"); // Should remain unchanged
    expect(role.resourceType).toBe("ORGANIZATION");
    expect(role.resourceId).toBe(orgId);
    expect(Array.isArray(role.permissions)).toBe(true);
    expect(role.permissions.length).toBeGreaterThan(0);

    // Verify in database
    const dbRole = await db.role.findUnique({ where: { id: role.id } });
    expect(dbRole?.name).toBe("Updated Role Name");
    expect(dbRole?.description).toBe("Original description");

    await revokeSession(sessionId);
  });

  it("should successfully update role description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const createdRole = await createTestRole(
      jwt,
      orgId,
      testPermissions,
      "Original Name",
      "Original description"
    );

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ description: "Updated description" });

    expect(res.status).toBe(200);

    const role = res.body as PatchRoleResponseType;
    expect(role.id).toBe(createdRole.id);
    expect(role.name).toBe("Original Name"); // Should remain unchanged
    expect(role.description).toBe("Updated description");

    // Verify in database
    const dbRole = await db.role.findUnique({ where: { id: role.id } });
    expect(dbRole?.name).toBe("Original Name");
    expect(dbRole?.description).toBe("Updated description");

    await revokeSession(sessionId);
  });

  it("should successfully update both name and description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const createdRole = await createTestRole(
      jwt,
      orgId,
      testPermissions,
      "Original Name",
      "Original description"
    );

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: "Updated Role Name",
        description: "Updated description",
      });

    expect(res.status).toBe(200);

    const role = res.body as PatchRoleResponseType;
    expect(role.id).toBe(createdRole.id);
    expect(role.name).toBe("Updated Role Name");
    expect(role.description).toBe("Updated description");

    // Verify in database
    const dbRole = await db.role.findUnique({ where: { id: role.id } });
    expect(dbRole?.name).toBe("Updated Role Name");
    expect(dbRole?.description).toBe("Updated description");

    await revokeSession(sessionId);
  });

  it("should preserve permissions when updating metadata", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();
    expect(testPermissions.length).toBeGreaterThanOrEqual(2);

    // Create role with multiple permissions
    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name: "Multi-Permission Role",
      description: "Role with multiple permissions",
      resourceType: ResourceType.enum.ORGANIZATION,
      resourceId: orgId,
      permissions: [
        { permissionId: testPermissions[0].id, type: "ALLOW" as const },
        { permissionId: testPermissions[1].id, type: "DENY" as const },
      ],
    };

    const createRes = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createRolePayload);

    expect(createRes.status).toBe(201);
    const createdRole = createRes.body;

    // Update the role metadata
    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ name: "Updated Multi-Permission Role" });

    expect(res.status).toBe(200);

    const role = res.body as PatchRoleResponseType;
    expect(role.permissions.length).toBe(2);

    const allowPermissions = role.permissions.filter((p) => p.type === "ALLOW");
    const denyPermissions = role.permissions.filter((p) => p.type === "DENY");

    expect(allowPermissions.length).toBe(1);
    expect(denyPermissions.length).toBe(1);
    expect(allowPermissions[0].permissionId).toBe(testPermissions[0].id);
    expect(denyPermissions[0].permissionId).toBe(testPermissions[1].id);

    await revokeSession(sessionId);
  });

  it("should handle special characters in name and description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const createdRole = await createTestRole(jwt, orgId, testPermissions);

    const specialName = "Role with émojis 🚀 & símb@ls!";
    const specialDescription = "Spéciál chäractërs and ñümbers 123";

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: specialName,
        description: specialDescription,
      });

    expect(res.status).toBe(200);

    const role = res.body as PatchRoleResponseType;
    expect(role.name).toBe(specialName);
    expect(role.description).toBe(specialDescription);

    await revokeSession(sessionId);
  });

  it("should handle very long name and description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const createdRole = await createTestRole(jwt, orgId, testPermissions);

    const longName = "A".repeat(100);
    const longDescription = "B".repeat(500);

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        name: longName,
        description: longDescription,
      });

    expect(res.status).toBe(200);

    const role = res.body as PatchRoleResponseType;
    expect(role.name).toBe(longName);
    expect(role.description).toBe(longDescription);

    await revokeSession(sessionId);
  });

  it("should clear description when set to null", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const createdRole = await createTestRole(
      jwt,
      orgId,
      testPermissions,
      "Test Role",
      "Initial description"
    );

    const res = await request(server)
      .patch(`/roles/${createdRole.id}`)
      .set("Authorization", `Bearer ${jwt}`)
      .send({ description: null });

    expect(res.status).toBe(200);

    const role = res.body as PatchRoleResponseType;
    expect(role.description).toBeUndefined();

    // Verify in database
    const dbRole = await db.role.findUnique({ where: { id: role.id } });
    expect(dbRole?.description).toBeNull();

    await revokeSession(sessionId);
  });
});
