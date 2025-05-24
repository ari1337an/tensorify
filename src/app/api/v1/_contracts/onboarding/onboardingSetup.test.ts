import request from "supertest";
import { createServer } from "http";
import {
  createApiTestServer,
  closeApiTestServer,
  flushDatabase,
  signInTestAccount,
} from "../test-utils";
import {
  OnboardingAnswer,
  OnboardingQuestion,
  OnboardingSetupRequest,
  OnboardingSetupResponse,
} from "../schema";
import { z } from "zod";
import { generateMock } from "@anatine/zod-mock";
import db from "@/server/database/db";
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
    const res = await request(server)
      .post("/onboarding/setup")
      .send(requestBody)
      .set("Authorization", `Bearer ${clerkData.jwt}`);

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

    // Expect the user to be created
    const user = await db.user.findUnique({
      where: { id: clerkData.decoded.sub },
    });
    expect(user).toBeDefined();
    expect(user?.id).toBe(clerkData.decoded.sub);
    expect(user?.firstName).toBe(clerkData.decoded.firstName);
    expect(user?.lastName).toBe(clerkData.decoded.lastName);
    expect(user?.email).toBe(clerkData.decoded.email);

    // Expect the org to be created
    const org = await db.organization.findUnique({
      where: { id: parsedResponseBody.data.orgId },
    });
    expect(org).toBeDefined();
    expect(org?.name).toBe(parsedResponseBody.data.orgName);
    expect(org?.slug).toBe(parsedResponseBody.data.orgUrl);

    // Expect the team to be created
    const team = await db.team.findUnique({
      where: { id: parsedResponseBody.data.teamId },
    });
    expect(team).toBeDefined();
    expect(team?.name).toBe(
      `${clerkData.decoded.firstName.split(" ")[0]}'s Team`
    );
    expect(team?.orgId).toBe(parsedResponseBody.data.orgId);

    // Expect the project to be created
    const project = await db.project.findUnique({
      where: { id: parsedResponseBody.data.projectId },
    });
    expect(project).toBeDefined();
    expect(project?.name).toBe(
      `${clerkData.decoded.firstName.split(" ")[0]}'s Project`
    );
    expect(project?.teamId).toBe(parsedResponseBody.data.teamId);

    // Expect the workflow to be created
    const workflow = await db.workflow.findUnique({
      where: { id: parsedResponseBody.data.workflowId },
    });
    expect(workflow).toBeDefined();
    expect(workflow?.name).toBe(
      `${clerkData.decoded.firstName.split(" ")[0]}'s Workflow`
    );
    expect(workflow?.projectId).toBe(parsedResponseBody.data.projectId);

    // Check if the onboarding response is created
    const controlsOrgSizeBracketMapper = {
      // For the sake of testing, we need to map the org size bracket to the correct value
      LT_20: "<20",
      FROM_20_TO_99: "20-99",
      FROM_100_TO_499: "100-499",
      FROM_500_TO_999: "500-999",
      GTE_1000: "1000+",
      // For the sake of testing, we need to map the org size bracket to the correct value
      "<20": "LT_20",
      "20-99": "FROM_20_TO_99",
      "100-499": "FROM_100_TO_499",
      "500-999": "FROM_500_TO_999",
      "1000+": "GTE_1000",
    };
    const onboardingResponse = await fetch(
      `${process.env.CONTROLS_BASE_URL}/api/onboarding/responses/${parsedResponseBody.data.responseId}`
    );
    const onboardingResponseJson = await onboardingResponse.json();
    expect(onboardingResponseJson.response.id).toBe(
      parsedResponseBody.data.responseId
    );
    expect(onboardingResponseJson.response.userId).toBe(clerkData.decoded.sub);
    expect(onboardingResponseJson.response.email).toBe(clerkData.decoded.email);
    expect(onboardingResponseJson.response.clientFingerprint).toBe(
      requestBody.clientFingerprint
    );
    expect(onboardingResponseJson.response.intentTag).toBe(
      requestBody.usageSelection
    );
    expect(
      controlsOrgSizeBracketMapper[
        onboardingResponseJson.response
          .orgSizeBracket as keyof typeof controlsOrgSizeBracketMapper
      ]
    ).toBe(requestBody.orgSize);

    // check if the answers are correctly mapped individually
    const answers = requestBody.answers;
    expect(answers.length).toBe(requestBody.answers.length);
    for (const answer of answers) {
      const question = onboardingResponseJson.response.answers.find(
        (q: z.infer<typeof OnboardingAnswer>) =>
          q.questionId === answer.questionId
      );
      expect(question).toBeDefined();
    }
  });
});
