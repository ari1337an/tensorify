import request from "supertest";
import { createServer } from "http";
import { OnboardingVersion } from "../schema";
import { createApiTestServer, closeApiTestServer } from "../test-utils";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

it("/onboarding/questions should return 200", async () => {
  const res = await request(server).get("/onboarding/questions");
  
  // Check status code
  expect(res.status).toBe(200);

  // Full schema validation using Zod
  expect(() => OnboardingVersion.parse(res.body)).not.toThrow(); 

  // Check if we fetched the correct tag
  expect(res.body.tag).toBe(process.env.NEXT_PUBLIC_ONBOARDING_TAG);
}, 15000); // Add timeout for this specific test