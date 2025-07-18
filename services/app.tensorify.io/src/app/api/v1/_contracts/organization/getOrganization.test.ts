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
import { Organization } from "../schema";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("GET /organization", () => {
  // Helper function to setup a user
  async function setupUser(botNum: number = 1, revokeSession: boolean = false) {
    const userData = await signInTestAccount(botNum, revokeSession, false);
    const questions = (await request(server).get("/onboarding/questions")).body;
    const requestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send(requestBody);

    return userData;
  }

  it("should return 401 with no authentication", async () => {
    const res = await request(server).get("/organization");

    expect(res.status).toBe(401);
  });

  it("should return 401 with invalid Bearer token", async () => {
    const res = await request(server)
      .get("/organization")
      .set("Authorization", "Bearer invalid_token");

    expect(res.status).toBe(401);
  });

  it("should return 401 with invalid __session cookie", async () => {
    const res = await request(server)
      .get("/organization")
      .set("Cookie", "__session=invalid_session");

    expect(res.status).toBe(401);
  });

  it("should return 404 if user does not exist in database", async () => {
    await flushDatabase(expect);

    // Sign in but don't onboard (so user won't exist in database)
    const userData = await signInTestAccount(1, false, false);

    const res = await request(server)
      .get("/organization")
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("User is not onboarded");

    await revokeSession(userData.sessionId);
  });

  it("should return 404 if user has no organizations", async () => {
    await flushDatabase(expect);

    // Create a user directly in the database without organizations
    const userData = await signInTestAccount(1, false, false);

    await db.user.create({
      data: {
        id: userData.decoded.sub,
        firstName: userData.decoded.firstName,
        lastName: userData.decoded.lastName,
        email: userData.decoded.email,
        imageUrl: userData.decoded.imageUrl || "",
      },
    });

    const res = await request(server)
      .get("/organization")
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("User has no organizations");

    await revokeSession(userData.sessionId);
  });

  it("should return 200 with organization data using Bearer token", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .get("/organization")
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);

    // Verify organization data structure
    const org = res.body[0] as z.infer<typeof Organization>;
    expect(org).toHaveProperty("id");
    expect(org).toHaveProperty("name");
    expect(org).toHaveProperty("slug");
    expect(typeof org.id).toBe("string");
    expect(typeof org.name).toBe("string");
    expect(typeof org.slug).toBe("string");

    await revokeSession(userData.sessionId);
  });

  it("should return correct organization data from database", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .get("/organization")
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(200);

    // Verify the organization data matches what's in the database
    const dbUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
      include: { createdOrgs: true },
    });

    expect(dbUser).toBeDefined();
    expect(dbUser?.createdOrgs.length).toBe(res.body.length);

    // Verify each organization in the response matches the database
    const organizations = res.body as z.infer<typeof Organization>[];
    organizations.forEach((org, index) => {
      const dbOrg = dbUser?.createdOrgs[index];
      expect(org.id).toBe(dbOrg?.id);
      expect(org.name).toBe(dbOrg?.name);
      expect(org.slug).toBe(dbOrg?.slug);
    });

    await revokeSession(userData.sessionId);
  });

  it("should return multiple organizations if user has created multiple", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    // Create additional organization for the same user
    const secondOrg = await db.organization.create({
      data: {
        name: "Second Test Organization",
        slug: "second-test-org",
        createdById: userData.decoded.sub,
      },
    });

    const res = await request(server)
      .get("/organization")
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    // Verify both organizations are returned
    const organizations = res.body as z.infer<typeof Organization>[];
    const orgIds = organizations.map((org) => org.id);
    expect(orgIds).toContain(secondOrg.id);

    await revokeSession(userData.sessionId);
  });

  it("should only return organizations created by the authenticated user", async () => {
    await flushDatabase(expect);

    // Setup two different users
    const userData1 = await setupUser(1, false);
    const userData2 = await setupUser(2, false);

    // Create an additional organization for user 1
    await db.organization.create({
      data: {
        name: "User 1 Additional Org",
        slug: "user1-additional-org",
        createdById: userData1.decoded.sub,
      },
    });

    // Request organizations for user 1
    const res1 = await request(server)
      .get("/organization")
      .set("Authorization", `Bearer ${userData1.jwt}`);

    // Request organizations for user 2
    const res2 = await request(server)
      .get("/organization")
      .set("Authorization", `Bearer ${userData2.jwt}`);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // User 1 should have 2 organizations (1 from onboarding + 1 additional)
    expect(res1.body.length).toBe(2);

    // User 2 should have 1 organization (only from onboarding)
    expect(res2.body.length).toBe(1);

    // Verify that user 1's organizations don't appear in user 2's response
    const user1Organizations = res1.body as z.infer<typeof Organization>[];
    const user2Organizations = res2.body as z.infer<typeof Organization>[];

    const user1OrgIds = user1Organizations.map((org) => org.id);
    const user2OrgIds = user2Organizations.map((org) => org.id);

    user1OrgIds.forEach((orgId) => {
      expect(user2OrgIds).not.toContain(orgId);
    });

    await revokeSession(userData1.sessionId);
    await revokeSession(userData2.sessionId);
  }, 20000);

  it("should return organizations that the user is a member of", async () => {
    await flushDatabase(expect);

    const userData1 = await setupUser(1, false);
    const userData2 = await setupUser(2, false);

    // Create an additional organization for user 2
    const org = await db.organization.create({
      data: {
        name: "User 2 Org additional",
        slug: "user2-org-additional",
        createdById: userData2.decoded.sub,
      },
    });

    // Add user 1 as a member of the organization
    await db.orgMembership.create({
      data: {
        userId: userData1.decoded.sub,
        organizationId: org.id,
      },
    });

    const res = await request(server)
      .get("/organization")
      .set("Authorization", `Bearer ${userData1.jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    await revokeSession(userData1.sessionId);
    await revokeSession(userData2.sessionId);
  }, 20000);
});
