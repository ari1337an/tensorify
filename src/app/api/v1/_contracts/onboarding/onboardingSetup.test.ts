import request from "supertest";
import { createServer } from "http";
import {
  createApiTestServer,
  closeApiTestServer,
  flushDatabase,
  signInTestAccount,
} from "../test-utils";
import {
  OnboardingQuestion,
  OnboardingSetupRequest,
  OnboardingSetupResponse,
} from "../schema";
import { z } from "zod";
import { generateMock } from "@anatine/zod-mock";
let server: ReturnType<typeof createServer>;

async function generateRequestBodyFromClerkData(clerkData: {
  jwt: string;
  decoded: {
    sub: string;
    email: string;
    imageUrl: string;
    firstName: string;
    lastName: string;
  };
}) {
  // Get onboarding questions
  const questions = (await request(server).get("/onboarding/questions")).body
    .questions;

  const requestBody = {
    userId: clerkData.decoded.sub,
    email: clerkData.decoded?.email,
    imageUrl: clerkData.decoded?.imageUrl,
    firstName: clerkData.decoded?.firstName,
    lastName: clerkData.decoded?.lastName,
    orgUrl: "test-org-url",
    orgName: "test org name",
    answers: questions.map((question: z.infer<typeof OnboardingQuestion>) => {
      if (question.type === "single_choice") {
        return {
          questionId: question.id,
          selectedOptionIds: [question.options[0].id],
        };
      } else if (question.type === "multi_choice") {
        return {
          questionId: question.id,
          selectedOptionIds: [question.options[0].id, question.options[1].id],
        };
      } else {
        throw new Error(`Unsupported question type: ${question.type}`);
      }
    }),
    usageSelection: "WILL_PAY_HOBBY",
    orgSize: "<20",
    clientFingerprint: "1234567890",
  } as z.infer<typeof OnboardingSetupRequest>;
  const parsedRequestBody = OnboardingSetupRequest.safeParse(requestBody);
  if (!parsedRequestBody.success) {
    throw new Error(`Invalid request body: ${parsedRequestBody.error}`);
  }

  return parsedRequestBody.data;
}

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("POST /onboarding/setup", () => {
  it("should return 201 OK with Correct Bearer Token", async () => {
    // Clear database beforehand
    await flushDatabase(expect);

    // Sign in test account
    const clerkData = await signInTestAccount(1);

    // Prepare request body
    const requestBody = await generateRequestBodyFromClerkData(clerkData);

    // Initiate
    const res = await request(server)
      .post("/onboarding/setup")
      .send(requestBody)
      .set("Authorization", `Bearer ${clerkData.jwt}`);

    // Expect all goes well
    expect(res.status).toBe(201);
  });

  it("should return 201 OK with correct __session cookie", async () => {
    // Clear database beforehand
    await flushDatabase(expect);

    // Sign in test account
    const clerkData = await signInTestAccount(1);

    // Prepare request body
    const requestBody = await generateRequestBodyFromClerkData(clerkData);

    // Initiate
    const res = await request(server)
      .post("/onboarding/setup")
      .send(requestBody)
      .set("Cookie", `__session=${clerkData.jwt}`);

    // Expect all goes well
    expect(res.status).toBe(201);
  });

  it("should return 401 Unauthorized with incorrect Bearer Token", async () => {
    // Sign in test account
    const falseJWT = await signInTestAccount(1, true, true); // get false JWT

    // Prepare mock request body
    const requestBody = generateMock(OnboardingSetupRequest);

    // Initiate request with false JWT
    const res = await request(server)
      .post("/onboarding/setup")
      .send(requestBody)
      .set("Authorization", `Bearer ${falseJWT.jwt}`);

    // Expect 401 Unauthorized
    expect(res.status).toBe(401);
  });

  it("should return 401 Unauthorized with incorrect __session cookie", async () => {
    // Sign in test account
    const falseJWT = await signInTestAccount(1, true, true); // get false JWT

    // Prepare mock request body
    const requestBody = generateMock(OnboardingSetupRequest);

    // Initiate request with false JWT
    const res = await request(server)
      .post("/onboarding/setup")
      .send(requestBody)
      .set("Cookie", `__session=${falseJWT.jwt}`);

    // Expect 401 Unauthorized
    expect(res.status).toBe(401);
  });

  it("should provision a new org, team, project, and workflow", async () => {
    // Clear database beforehand
    await flushDatabase(expect);

    // Sign in test account
    const clerkData = await signInTestAccount(1);

    // Prepare request body
    const requestBody = await generateRequestBodyFromClerkData(clerkData);

    // Initiate request with no Bearer Token
    const res = await request(server).post("/onboarding/setup").send(requestBody).set("Authorization", `Bearer ${clerkData.jwt}`);

    // Expect all goes well
    expect(res.status).toBe(201);

    // Expect the response body to be a valid OnboardingSetupResponse
    const parsedResponseBody = OnboardingSetupResponse.safeParse(res.body);
    if (!parsedResponseBody.success) {
      throw new Error(`Invalid response body: ${parsedResponseBody.error}`);
    }

    // Expect the response body to have a message
    expect(parsedResponseBody.data.orgId).toBeDefined();
    expect(parsedResponseBody.data.teamId).toBeDefined();
    expect(parsedResponseBody.data.projectId).toBeDefined();
    expect(parsedResponseBody.data.workflowId).toBeDefined();
    expect(parsedResponseBody.data.orgName).toBeDefined();
    expect(parsedResponseBody.data.orgUrl).toBeDefined();
  });
});
