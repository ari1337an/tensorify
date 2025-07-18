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

describe("GET /onboarding/questions", () => {
  it("should return 200 OK", async () => {
    const res = await request(server).get("/onboarding/questions");
    expect(res.status).toBe(200);
  });

  it("should match the OnboardingVersion schema", async () => {
    const res = await request(server).get("/onboarding/questions");
    expect(() => OnboardingVersion.parse(res.body)).not.toThrow();
  });

  it("should return correct tag from environment", async () => {
    const res = await request(server).get("/onboarding/questions");
    expect(res.body.tag).toBe(process.env.NEXT_PUBLIC_ONBOARDING_TAG);
  });
}); 
