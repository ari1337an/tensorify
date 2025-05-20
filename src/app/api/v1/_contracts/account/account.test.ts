import request from "supertest";
import { createServer } from "http";
import { createApiTestServer, closeApiTestServer } from "../test-utils";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

it("/account should return 201", async () => {
  const res = await request(server).post("/account").send({ name: "John Doe" });

  expect(res.status).toBe(201);
  expect(res.body.message).toBe("Hello, John Doe!");
}, 15000);
