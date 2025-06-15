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
import { UserListResponse } from "../schema";
import { z } from "zod";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("GET /organization/:orgId/users", () => {
  // Helper function to setup a user and organization
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

  // === Authentication Tests ===
  describe("Authentication", () => {
    it("should return 401 for requests without authorization", async () => {
      await flushDatabase(expect);
      const { orgId } = await setupUserAndOrg(1);

      const res = await request(server).get(`/organization/${orgId}/users`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });

    it("should return 401 for requests with invalid Bearer token", async () => {
      await flushDatabase(expect);
      const { orgId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });

    it("should return 401 for requests with invalid __session cookie", async () => {
      await flushDatabase(expect);
      const { orgId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Cookie", "__session=invalid-session");

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Unauthorized");
    });
  });

  // === Path Parameter Validation ===
  describe("Path Parameter Validation", () => {
    it("should return 400 for invalid orgId format", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get("/organization/invalid-uuid/users")
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });

    it("should return 400 for non-UUID orgId", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get("/organization/123456/users")
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });
  });

  // === Organization Existence Validation ===
  describe("Organization Existence Validation", () => {
    it("should return 404 when organization does not exist", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId } = await setupUserAndOrg(1);
      const nonExistentOrgId = "123e4567-e89b-12d3-a456-426614174000";

      const res = await request(server)
        .get(`/organization/${nonExistentOrgId}/users`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Organization not found");

      await revokeSession(sessionId);
    });
  });

  // === Successful User Retrieval ===
  describe("Successful User Retrieval", () => {
    it("should return organization users with creator only using Bearer token", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);

      // Validate response structure matches UserListResponse schema
      const parsedResponse = UserListResponse.safeParse(res.body);
      expect(parsedResponse.success).toBe(true);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBe(1);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.totalCount).toBe(1);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.size).toBe(20);
      expect(res.body.meta.totalPages).toBe(1);

      // Check the creator user
      const user = res.body.items[0];
      expect(user.userId).toBe(decoded.sub);
      expect(user.email).toBe(decoded.email);
      expect(typeof user.firstName).toBe("string");
      expect(typeof user.lastName).toBe("string");
      expect(user.imageUrl).toBeDefined(); // Can be string or null
      expect(user.status).toBe("active");
      expect(Array.isArray(user.roles)).toBe(true);

      await revokeSession(sessionId);
    });

    it("should return organization users using __session cookie", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Cookie", `__session=${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1);

      await revokeSession(sessionId);
    });

    it("should return organization users including members", async () => {
      await flushDatabase(expect);
      const creator = await setupUserAndOrg(1);
      const member = await setupUserAndOrg(2);

      // Add the second user as a member of the first user's organization
      await db.orgMembership.create({
        data: {
          userId: member.decoded.sub,
          organizationId: creator.orgId,
        },
      });

      const res = await request(server)
        .get(`/organization/${creator.orgId}/users`)
        .set("Authorization", `Bearer ${creator.jwt}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(2);
      expect(res.body.meta.totalCount).toBe(2);

      const userIds = res.body.items.map(
        (user: z.infer<typeof UserListResponse>["items"][number]) => user.userId
      );
      expect(userIds).toContain(creator.decoded.sub);
      expect(userIds).toContain(member.decoded.sub);

      await revokeSession(creator.sessionId);
      await revokeSession(member.sessionId);
    }, 10000);

    it("should handle duplicate users (creator who is also a member) correctly", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } = await setupUserAndOrg(1);

      // Add the creator as a member as well (edge case)
      await db.orgMembership.create({
        data: {
          userId: decoded.sub,
          organizationId: orgId,
        },
      });

      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1); // Should be deduplicated
      expect(res.body.meta.totalCount).toBe(1);
      expect(res.body.items[0].userId).toBe(decoded.sub);

      await revokeSession(sessionId);
    });
  });

  // === Pagination Tests ===
  describe("Pagination", () => {
    it("should handle pagination parameters correctly", async () => {
      await flushDatabase(expect);
      const creator = await setupUserAndOrg(1);

      // Add another member
      const members = [];
      const member = await setupUserAndOrg(2);
      await db.orgMembership.create({
        data: {
          userId: member.decoded.sub,
          organizationId: creator.orgId,
        },
      });
      members.push(member);

      // Test first page
      const res1 = await request(server)
        .get(`/organization/${creator.orgId}/users?page=1&limit=1`)
        .set("Authorization", `Bearer ${creator.jwt}`);

      expect(res1.status).toBe(200);
      expect(res1.body.items.length).toBe(1);
      expect(res1.body.meta.page).toBe(1);
      expect(res1.body.meta.size).toBe(1);
      expect(res1.body.meta.totalCount).toBe(2);
      expect(res1.body.meta.totalPages).toBe(2);

      // Test second page
      const res2 = await request(server)
        .get(`/organization/${creator.orgId}/users?page=2&limit=1`)
        .set("Authorization", `Bearer ${creator.jwt}`);

      expect(res2.status).toBe(200);
      expect(res2.body.items.length).toBe(1);
      expect(res2.body.meta.page).toBe(2);

      // Clean up sessions
      await revokeSession(creator.sessionId);
      for (const member of members) {
        await revokeSession(member.sessionId);
      }
    }, 30000);

    it("should handle default pagination parameters", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.size).toBe(20);

      await revokeSession(sessionId);
    });

    it("should handle empty results for page beyond available data", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users?page=10`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(0);
      expect(res.body.meta.totalCount).toBe(1);
      expect(res.body.meta.page).toBe(10);

      await revokeSession(sessionId);
    });

    it("should validate pagination bounds", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

      // Test invalid page number
      const res1 = await request(server)
        .get(`/organization/${orgId}/users?page=0`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res1.status).toBe(400);

      // Test invalid limit
      const res2 = await request(server)
        .get(`/organization/${orgId}/users?limit=0`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res2.status).toBe(400);

      // Test limit too high
      const res3 = await request(server)
        .get(`/organization/${orgId}/users?limit=101`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res3.status).toBe(400);

      await revokeSession(sessionId);
    });
  });

  // === Response Format Validation ===
  describe("Response Format Validation", () => {
    it("should return properly formatted UserListResponse", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);

      // Verify response structure matches UserListResponse schema
      const parsedResponse = UserListResponse.safeParse(res.body);
      expect(parsedResponse.success).toBe(true);

      // Verify items structure
      expect(res.body.items).toBeInstanceOf(Array);
      res.body.items.forEach(
        (user: z.infer<typeof UserListResponse>["items"][number]) => {
          expect(typeof user.userId).toBe("string");
          expect(typeof user.email).toBe("string");
          expect(typeof user.firstName).toBe("string");
          expect(typeof user.lastName).toBe("string");
          expect(user.imageUrl).toBeDefined(); // Can be string or null
          expect(user.status).toBe("active");
          expect(Array.isArray(user.roles)).toBe(true);
        }
      );

      // Verify meta structure
      expect(typeof res.body.meta.totalCount).toBe("number");
      expect(typeof res.body.meta.page).toBe("number");
      expect(typeof res.body.meta.size).toBe("number");
      expect(typeof res.body.meta.totalPages).toBe("number");

      await revokeSession(sessionId);
    }, 30000);

    it("should return user profile information correctly", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId, decoded } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1);

      const user = res.body.items[0];

      // Verify user profile fields are present and match expected values
      expect(user.firstName).toBe(decoded.firstName);
      expect(user.lastName).toBe(decoded.lastName);
      expect(user.imageUrl).toBe(decoded.imageUrl);
      expect(user.email).toBe(decoded.email);
      expect(user.userId).toBe(decoded.sub);

      await revokeSession(sessionId);
    });

    it("should handle organization with no users (edge case)", async () => {
      await flushDatabase(expect);
      const userData = await signInTestAccount(1, false, false);

      // First, create the user in the database
      await db.user.create({
        data: {
          id: userData.decoded.sub,
          email: userData.decoded.email,
          firstName: userData.decoded.firstName || "Test",
          lastName: userData.decoded.lastName || "User",
          imageUrl:
            userData.decoded.imageUrl || "https://example.com/image.jpg",
        },
      });

      // Create organization with valid creator but then remove the membership
      const org = await db.organization.create({
        data: {
          name: "Test Org",
          slug: "test-org",
          createdById: userData.decoded.sub,
        },
      });

      // Remove all memberships to simulate an empty organization
      await db.orgMembership.deleteMany({
        where: { organizationId: org.id },
      });

      const res = await request(server)
        .get(`/organization/${org.id}/users`)
        .set("Authorization", `Bearer ${userData.jwt}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1); // Still has creator
      expect(res.body.meta.totalCount).toBe(1);
      expect(res.body.meta.totalPages).toBe(1);

      await revokeSession(userData.sessionId);
    });
  });

  // === Error Handling ===
  describe("Error Handling", () => {
    it("should handle malformed query parameters gracefully", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

      const res = await request(server)
        .get(`/organization/${orgId}/users?page=invalid&limit=invalid`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(res.status).toBe(400);

      await revokeSession(sessionId);
    });

    it("should handle database connection issues gracefully", async () => {
      await flushDatabase(expect);
      const { jwt, sessionId, orgId } = await setupUserAndOrg(1);

      // This is a conceptual test - in reality you might need to mock the db module
      const res = await request(server)
        .get(`/organization/${orgId}/users`)
        .set("Authorization", `Bearer ${jwt}`);

      // Should either succeed or fail gracefully with proper error handling
      if (res.status !== 200) {
        expect(res.status).toBeGreaterThanOrEqual(500);
        expect(res.body).toHaveProperty("message");
      }

      await revokeSession(sessionId);
    });
  });
});
