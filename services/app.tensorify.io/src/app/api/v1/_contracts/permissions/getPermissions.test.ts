import request from "supertest";
import { createServer } from "http";
import {
  createApiTestServer,
  closeApiTestServer,
  flushDatabase,
} from "../test-utils";
import { z } from "zod";
import { Permission } from "../schema";
import permissionsJson from "@/server/database/prisma/permissions.json";

let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = await createApiTestServer();
});

afterAll(async () => {
  await closeApiTestServer(server);
});

describe("GET /permissions", () => {
  it("should return all permissions and the seed to be correct", async () => {
    await flushDatabase(expect);

    const res = await request(server).get("/permissions");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(permissionsJson.length);

    const parsedRes = z.array(Permission).safeParse(res.body);

    expect(parsedRes.success).toBe(true);

    const resPermsButOnlyActions = parsedRes.data?.map((p) => p.action);
    const seedPermsButOnlyActions = permissionsJson.map((p) => p.action);

    expect(resPermsButOnlyActions).toEqual(seedPermsButOnlyActions);
  });
});
