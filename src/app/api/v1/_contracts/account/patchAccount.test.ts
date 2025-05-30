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
import { createClerkClient } from "@clerk/backend";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("PATCH /account", () => {
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
    await flushDatabase(expect);

    const res = await request(server).patch("/account").send({
      firstName: "NewFirstName",
    });

    expect(res.status).toBe(401);
  });

  it("should return 401 with invalid Bearer token", async () => {
    await flushDatabase(expect);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", "Bearer invalid_token")
      .send({
        firstName: "NewFirstName",
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 with invalid __session cookie", async () => {
    await flushDatabase(expect);

    const res = await request(server)
      .patch("/account")
      .set("Cookie", "__session=invalid_session")
      .send({
        firstName: "NewFirstName",
      });

    expect(res.status).toBe(401);
  });

  it("should return 404 if user does not exist in database", async () => {
    await flushDatabase(expect);

    // Sign in but don't onboard (so user won't exist in database)
    const userData = await signInTestAccount(1, false, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        firstName: "NewFirstName",
      });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("User not found.");

    await revokeSession(userData.sessionId);
  });

  it("should return 400 with invalid request body structure", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        invalidField: "invalid",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Request validation failed");

    await revokeSession(userData.sessionId);
  });

  it("should return 400 with empty request body", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Request validation failed");

    await revokeSession(userData.sessionId);
  });

  it("should accept valid request body with only firstName", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        firstName: "UpdatedFirstName",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    await revokeSession(userData.sessionId);
  });

  it("should accept valid request body with only firstName but with cookie authentication", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Cookie", `__session=${userData.jwt}`)
      .send({
        firstName: "UpdatedFirstName",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    await revokeSession(userData.sessionId);
  });

  it("should accept valid request body with only lastName", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        lastName: "UpdatedLastName",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    await revokeSession(userData.sessionId);
  });

  it("should accept valid request body with only sessionId", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        sessionId: [userData.sessionId],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    await revokeSession(userData.sessionId);
  });

  it("should successfully update firstName", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const newFirstName = "UpdatedFirstName";
    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        firstName: newFirstName,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Verify the update in the database
    const updatedUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(updatedUser?.firstName).toBe(newFirstName);
    expect(updatedUser?.lastName).toBe(userData.decoded.lastName); // Should remain unchanged

    await revokeSession(userData.sessionId);
  });

  it("should successfully update lastName", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const newLastName = "UpdatedLastName";
    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        lastName: newLastName,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Verify the update in the database
    const updatedUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(updatedUser?.lastName).toBe(newLastName);
    expect(updatedUser?.firstName).toBe(userData.decoded.firstName); // Should remain unchanged

    await revokeSession(userData.sessionId);
  });

  it("should successfully update both firstName and lastName", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const newFirstName = "UpdatedFirstName";
    const newLastName = "UpdatedLastName";
    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        firstName: newFirstName,
        lastName: newLastName,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Verify the update in the database
    const updatedUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(updatedUser?.firstName).toBe(newFirstName);
    expect(updatedUser?.lastName).toBe(newLastName);

    await revokeSession(userData.sessionId);
  });

  it("should successfully revoke other sessions when sessionId is provided", async () => {
    await flushDatabase(expect);

    // Create multiple sessions for the same user
    const userData1 = await signInTestAccount(1, false, false);
    const _userData2 = await signInTestAccount(1, false, false); // Same user, different session
    void _userData2; // Mark as intentionally unused

    // Setup user
    const questions = (await request(server).get("/onboarding/questions")).body;
    const requestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData1.jwt}`)
      .send(requestBody);

    // Use session 1 to revoke session 2
    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData1.jwt}`)
      .send({
        sessionId: [userData1.sessionId], // Keep session 1, revoke others
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Check if session 2 is revoked
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const sessionsResponse = await clerkClient.sessions.getSessionList({
      userId: userData1.decoded.sub,
      status: "active",
    });
    expect(sessionsResponse.data.length).toBe(1);
    expect(sessionsResponse.data[0].id).toBe(userData1.sessionId);

    // Clean up remaining session
    await revokeSession(userData1.sessionId);
  }, 15000);

  it("should return 404 when provided sessionId does not exist", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        sessionId: ["non_existent_session_id"],
      });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Session not found.");

    await revokeSession(userData.sessionId);
  });

  it("should handle empty sessionId array", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        sessionId: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    await revokeSession(userData.sessionId);
  });

  it("should successfully update profile and manage sessions simultaneously", async () => {
    await flushDatabase(expect);

    // Create multiple sessions
    const userData1 = await signInTestAccount(1, false, false);
    const _userData2 = await signInTestAccount(1, false, false); // Same user, different session
    void _userData2; // Mark as intentionally unused

    // Setup user
    const questions = (await request(server).get("/onboarding/questions")).body;
    const requestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData1.jwt}`)
      .send(requestBody);

    const newFirstName = "CombinedUpdateName";
    const newLastName = "CombinedUpdateLastName";

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData1.jwt}`)
      .send({
        firstName: newFirstName,
        lastName: newLastName,
        sessionId: [userData1.sessionId], // Keep session 1, revoke session 2
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Verify profile update
    const updatedUser = await db.user.findUnique({
      where: { id: userData1.decoded.sub },
    });
    expect(updatedUser?.firstName).toBe(newFirstName);
    expect(updatedUser?.lastName).toBe(newLastName);

    // Check if session 2 is revoked
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const sessionsResponse = await clerkClient.sessions.getSessionList({
      userId: userData1.decoded.sub,
      status: "active",
    });
    expect(sessionsResponse.data.length).toBe(1);
    expect(sessionsResponse.data[0].id).toBe(userData1.sessionId);

    await revokeSession(userData1.sessionId);
  }, 15000);

  it("should handle undefined values gracefully", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        firstName: undefined,
        lastName: "ValidLastName",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Verify only lastName was updated
    const updatedUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(updatedUser?.lastName).toBe("ValidLastName");
    expect(updatedUser?.firstName).toBe(userData.decoded.firstName); // Should remain unchanged

    await revokeSession(userData.sessionId);
  });

  it("should handle empty strings", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        firstName: "",
        lastName: "",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Verify the update
    const updatedUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(updatedUser?.firstName).toBe("");
    expect(updatedUser?.lastName).toBe("");

    await revokeSession(userData.sessionId);
  });

  it("should handle special characters in names", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const specialFirstName = "José-María";
    const specialLastName = "O'Connor-Smith";

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send({
        firstName: specialFirstName,
        lastName: specialLastName,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Verify the update
    const updatedUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(updatedUser?.firstName).toBe(specialFirstName);
    expect(updatedUser?.lastName).toBe(specialLastName);

    await revokeSession(userData.sessionId);
  });

  it("should handle multiple sessionIds", async () => {
    await flushDatabase(expect);

    // Create multiple sessions
    const userData1 = await signInTestAccount(1, false, false);
    const userData2 = await signInTestAccount(1, false, false);
    const userData3 = await signInTestAccount(1, false, false);

    // Setup user
    const questions = (await request(server).get("/onboarding/questions")).body;
    const requestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(questions);

    await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData1.jwt}`)
      .send(requestBody);

    const res = await request(server)
      .patch("/account")
      .set("Authorization", `Bearer ${userData1.jwt}`)
      .send({
        sessionId: [userData1.sessionId, userData2.sessionId], // Keep these, revoke userData3's session
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account updated successfully.");

    // Check if session 3 is revoked
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const sessionsResponse = await clerkClient.sessions.getSessionList({
      userId: userData1.decoded.sub,
      status: "active",
    });
    expect(sessionsResponse.data.length).toBe(2);

    // Check if session 3 is revoked
    expect(sessionsResponse.data[0].id).not.toBe(userData3.sessionId);
    expect(sessionsResponse.data[1].id).not.toBe(userData3.sessionId);

    // Clean up remaining sessions
    await revokeSession(userData1.sessionId);
    await revokeSession(userData2.sessionId);
    await revokeSession(userData3.sessionId);
  }, 15000);
});
