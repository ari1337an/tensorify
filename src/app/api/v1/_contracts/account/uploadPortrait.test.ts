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
import { readFileSync } from "fs";
import { join } from "path";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("POST /account/portrait", () => {
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

  // Helper function to get test avatar file buffer
  function getTestAvatarBuffer() {
    const avatarPath = join(__dirname, "test_avatar.jpeg");
    return readFileSync(avatarPath);
  }

  it("should return 401 with no authentication", async () => {
    await flushDatabase(expect);

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .attach("portrait", avatarBuffer, "test_avatar.jpeg");

    expect(res.status).toBe(401);
  });

  it("should return 401 with invalid Bearer token", async () => {
    await flushDatabase(expect);

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", "Bearer invalid_token")
      .attach("portrait", avatarBuffer, "test_avatar.jpeg");

    expect(res.status).toBe(401);
  });

  it("should return 401 with invalid __session cookie", async () => {
    await flushDatabase(expect);

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Cookie", "__session=invalid_session")
      .attach("portrait", avatarBuffer, "test_avatar.jpeg");

    expect(res.status).toBe(401);
  });

  it("should return 404 if user does not exist in database", async () => {
    await flushDatabase(expect);

    // Sign in but don't onboard (so user won't exist in database)
    const userData = await signInTestAccount(1, false, false);
    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, "test_avatar.jpeg");

    expect(res.status).toBe(404);

    await revokeSession(userData.sessionId);
  });

  it("should return 400 with no file provided", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Invalid form data.");

    await revokeSession(userData.sessionId);
  });

  it("should return 400 with empty file", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", Buffer.alloc(0), "empty.jpeg");

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("No portrait file provided");

    await revokeSession(userData.sessionId);
  });

  it("should return 400 with invalid file type", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const textFile = Buffer.from("This is a text file", "utf-8");

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", textFile, "test.txt");

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
    );

    await revokeSession(userData.sessionId);
  });

  it("should return 400 with file too large", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    // Create a buffer larger than 10MB (10 * 1024 * 1024 + 1)
    const largeFile = Buffer.alloc(10 * 1024 * 1024 + 1); // size = 10MB + 1 byte

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", largeFile, "large.jpeg");

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("File too large. Maximum size is 10MB.");

    await revokeSession(userData.sessionId);
  });

  it("should successfully upload portrait with Bearer token authentication", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    // Get initial user data to compare imageUrl
    const initialUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, "test_avatar.jpeg");

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBeDefined();
    expect(typeof res.body.imageUrl).toBe("string");
    expect(res.body.imageUrl).toMatch(/^https?:\/\//); // Should be a valid URL

    // Verify the imageUrl is updated in the database
    const updatedUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(updatedUser?.imageUrl).toBe(res.body.imageUrl);
    expect(updatedUser?.imageUrl).not.toBe(initialUser?.imageUrl);

    await revokeSession(userData.sessionId);
  }, 30000);

  it("should successfully upload portrait with cookie authentication", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    // Get initial user data to compare imageUrl
    const initialUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Cookie", `__session=${userData.jwt}`)
      .attach("portrait", avatarBuffer, "test_avatar.jpeg");

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBeDefined();
    expect(typeof res.body.imageUrl).toBe("string");
    expect(res.body.imageUrl).toMatch(/^https?:\/\//); // Should be a valid URL

    // Verify the imageUrl is updated in the database
    const updatedUser = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(updatedUser?.imageUrl).toBe(res.body.imageUrl);
    expect(updatedUser?.imageUrl).not.toBe(initialUser?.imageUrl);

    await revokeSession(userData.sessionId);
  }, 30000);

  it("should accept JPEG files", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, {
        filename: "test.jpeg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);

    await revokeSession(userData.sessionId);
  }, 15000);

  it("should accept PNG files", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, {
        filename: "test.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);

    await revokeSession(userData.sessionId);
  }, 15000);

  it("should accept GIF files", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, {
        filename: "test.gif",
        contentType: "image/gif",
      });

    expect(res.status).toBe(200);

    await revokeSession(userData.sessionId);
  }, 15000);

  it("should accept WebP files", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, {
        filename: "test.webp",
        contentType: "image/webp",
      });

    expect(res.status).toBe(200);

    await revokeSession(userData.sessionId);
  }, 15000);

  it("should update imageUrl when uploading a new portrait", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const avatarBuffer = getTestAvatarBuffer();

    // First upload
    const firstRes = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, "first_avatar.jpeg");

    expect(firstRes.status).toBe(200);
    const firstImageUrl = firstRes.body.imageUrl;

    // Get user data after first upload
    const userAfterFirst = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(userAfterFirst?.imageUrl).toBe(firstImageUrl);

    // Second upload (should update the imageUrl)
    const secondRes = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, "second_avatar.jpeg");

    expect(secondRes.status).toBe(200);
    const secondImageUrl = secondRes.body.imageUrl;

    // Verify the imageUrl has changed
    expect(secondImageUrl).not.toBe(firstImageUrl);

    // Verify the database is updated with the new imageUrl
    const userAfterSecond = await db.user.findUnique({
      where: { id: userData.decoded.sub },
    });
    expect(userAfterSecond?.imageUrl).toBe(secondImageUrl);
    expect(userAfterSecond?.imageUrl).not.toBe(firstImageUrl);

    await revokeSession(userData.sessionId);
  }, 30000);

  it("should reject unsupported image formats", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    const avatarBuffer = getTestAvatarBuffer();

    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .attach("portrait", avatarBuffer, {
        filename: "test.bmp",
        contentType: "image/bmp",
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
    );

    await revokeSession(userData.sessionId);
  });

  it("should handle errors gracefully", async () => {
    await flushDatabase(expect);
    const userData = await setupUser(1, false);

    // Test with malformed request that should trigger error handling
    const res = await request(server)
      .post("/account/portrait")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .field("notPortrait", "invalid");

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("No portrait file provided");

    await revokeSession(userData.sessionId);
  });
});
