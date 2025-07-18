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

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("/account/:userId", () => {
  it("/account/:userId should return 401 with no auth", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1, true, false);
    const questions = (await request(server).get("/onboarding/questions")).body
    const requestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(
        questions
      );

    await request(server)
      .post("/onboarding/setup")
      .send(requestBody);

    const res = await request(server)
      .get(`/account/${userData.decoded.sub}`)

    expect(res.status).toBe(401);
  });

  it("/account should return 200", async () => {
    await flushDatabase(expect);

    const userData = await signInTestAccount(1, false, false);
    const questions = (await request(server).get("/onboarding/questions")).body
    const requestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(
        questions
      );

    await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData.jwt}`)
      .send(requestBody);

    const res = await request(server)
      .get(`/account/${userData.decoded.sub}`)
      .set("Authorization", `Bearer ${userData.jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userData.decoded.sub);
    expect(res.body.firstName).toBe(userData.decoded.firstName);
    expect(res.body.lastName).toBe(userData.decoded.lastName);
    expect(res.body.email).toBe(userData.decoded.email);
    expect(res.body.sessions).toBeDefined();
    expect(res.body.sessions.length).toBeGreaterThanOrEqual(1);

    await revokeSession(userData.sessionId);
  }, 15000);

  it("/account should return 200 but no sessions", async () => {
    await flushDatabase(expect);

    const userData1 = await signInTestAccount(1, false, false);
    const userData2 = await signInTestAccount(2, false, false);
    const questions = (await request(server).get("/onboarding/questions")).body;
    const requestBody =
      await generateRequestBodyFromClerkDataForOnboardingSetup(
        questions
      );

    await request(server)
      .post("/onboarding/setup")
      .set("Authorization", `Bearer ${userData1.jwt}`)
      .send(requestBody);

    const res = await request(server)
      .get(`/account/${userData1.decoded.sub}`)
      .set("Authorization", `Bearer ${userData2.jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userData1.decoded.sub);
    expect(res.body.firstName).toBe(userData1.decoded.firstName);
    expect(res.body.lastName).toBe(userData1.decoded.lastName);
    expect(res.body.email).toBe(userData1.decoded.email);
    expect(res.body.sessions).toBeDefined();
    expect(res.body.sessions.length).toBe(0);

    await revokeSession(userData1.sessionId);
    await revokeSession(userData2.sessionId);
  }, 15000);
});
