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
import { CreateRoleRequest, Role, ResourceType, Permission } from "../schema";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("POST /roles", () => {
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

  async function getTestPermissions(): Promise<z.infer<typeof Permission>[]> {
    const permissionRecords = await db.permissionDefinition.findMany();
    return permissionRecords.map((p) => ({
      id: p.id,
      action: p.action,
    }));
  }

  it("should return 401 if no authentication token is provided", async () => {
    await flushDatabase(expect);
    const res = await request(server).post("/roles").send({});
    expect(res.status).toBe(401);
  });

  it("should return 401 with an invalid Bearer token", async () => {
    await flushDatabase(expect);
    const testPermissions = await getTestPermissions();
    const res = await request(server)
      .post("/roles")
      .set("Authorization", "Bearer invalid_token")
      .send({
        name: "Test Role",
        description: "Test role description",
        resourceType: ResourceType.enum.ORGANIZATION,
        resourceId: "123",
        permissions: [
          { permissionId: testPermissions[0].id, type: "ALLOW" as const },
        ],
      });
    expect(res.status).toBe(401);
  });

  it("should return 400 if the request body is empty", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send({});

    expect(res.status).toBe(400);

    await revokeSession(sessionId);
  }, 15000);

  it("should return 400 if required fields are missing", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const payload = {
      // name is missing
      description: "Test role description",
      resourceType: ResourceType.enum.ORGANIZATION,
      resourceId: orgId,
      permissions: [
        { permissionId: testPermissions[0].id, type: "ALLOW" as const },
      ],
    };

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(payload);

    expect(res.status).toBe(400);

    await revokeSession(sessionId);
  });

  it("should successfully create a new role with valid data and return 201", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    expect(testPermissions.length).toBeGreaterThan(0);

    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name: "Admin Role",
      description: "Role with administrative privileges for an organization",
      resourceType: ResourceType.enum.ORGANIZATION,
      resourceId: orgId,
      permissions: [
        { permissionId: testPermissions[0].id, type: "ALLOW" },
        ...(testPermissions.length > 1
          ? [{ permissionId: testPermissions[1].id, type: "DENY" as const }]
          : []),
      ],
    };

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createRolePayload);

    expect(res.status).toBe(201);

    const role = res.body as z.infer<typeof Role>;
    expect(role.id).toBeDefined();
    expect(role.name).toBe(createRolePayload.name);
    expect(role.description).toBe(createRolePayload.description);
    expect(role.resourceType).toBe(createRolePayload.resourceType);
    expect(role.resourceId).toBe(createRolePayload.resourceId);
    expect(role.permissions).toEqual(createRolePayload.permissions);

    // Verify in database
    const dbRole = await db.role.findUnique({
      where: { id: role.id },
    });

    expect(dbRole).toBeDefined();
    expect(dbRole?.name).toBe(createRolePayload.name);
    expect(dbRole?.resourceId).toBe(createRolePayload.resourceId);

    await revokeSession(sessionId);
  });

  it("should successfully create a role without description", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name: "Basic Role",
      resourceType: ResourceType.enum.ORGANIZATION,
      resourceId: orgId,
      permissions: [{ permissionId: testPermissions[0].id, type: "ALLOW" }],
    };

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createRolePayload);

    expect(res.status).toBe(201);

    const role = res.body as z.infer<typeof Role>;
    expect(role.name).toBe(createRolePayload.name);
    expect(role.description).toBeUndefined();

    await revokeSession(sessionId);
  });

  it("should return 400 if trying to link a non-existent permissionId", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

    const nonExistentPermissionId = "00000000-0000-0000-0000-000000000000";

    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name: "Role With Bad Permission",
      description: "Test role",
      resourceType: ResourceType.enum.ORGANIZATION,
      resourceId: orgId,
      permissions: [{ permissionId: nonExistentPermissionId, type: "ALLOW" }],
    };

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createRolePayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Permission(s) not found");

    await revokeSession(sessionId);
  });

  it("should return 400 with invalid resourceType", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const payload = {
      name: "Test Role",
      description: "Test description",
      resourceType: "INVALID_TYPE",
      resourceId: orgId,
      permissions: [{ permissionId: testPermissions[0].id, type: "ALLOW" }],
    };

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(payload);

    expect(res.status).toBe(400);

    await revokeSession(sessionId);
  });

  it("should return 400 with invalid UUID format for resourceId", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    const payload = {
      name: "Test Role",
      description: "Test description",
      resourceType: ResourceType.enum.ORGANIZATION,
      resourceId: "invalid-uuid",
      permissions: [{ permissionId: testPermissions[0].id, type: "ALLOW" }],
    };

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(payload);

    expect(res.status).toBe(400);

    await revokeSession(sessionId);
  });

  it("should create role with multiple permissions", async () => {
    await flushDatabase(expect);
    const { jwt, sessionId, orgId } = await setupUserAndOrg(1);
    const testPermissions = await getTestPermissions();

    expect(testPermissions.length).toBeGreaterThanOrEqual(3);

    const createRolePayload: z.infer<typeof CreateRoleRequest> = {
      name: "Multi-Permission Role",
      description: "Role with multiple permissions",
      resourceType: ResourceType.enum.ORGANIZATION,
      resourceId: orgId,
      permissions: [
        { permissionId: testPermissions[0].id, type: "ALLOW" },
        { permissionId: testPermissions[1].id, type: "DENY" },
        { permissionId: testPermissions[2].id, type: "ALLOW" },
      ],
    };

    const res = await request(server)
      .post("/roles")
      .set("Authorization", `Bearer ${jwt}`)
      .send(createRolePayload);

    expect(res.status).toBe(201);

    const role = res.body as z.infer<typeof Role>;
    expect(role.permissions).toHaveLength(3);
    expect(role.permissions).toEqual(createRolePayload.permissions);

    await revokeSession(sessionId);
  });
});
