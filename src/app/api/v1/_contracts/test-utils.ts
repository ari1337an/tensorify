import { createServer, Server } from "http";
import { NextRequest } from "next/server";
import { GET, POST, PUT, PATCH, DELETE } from "../[...ts-rest]/route";
import version from "./version.json";
import db from "@/server/database/db";
import { createClerkClient } from "@clerk/backend";
const API_PREFIX = `/api/${version.apiVersion}`;
import jwt from "jsonwebtoken";

export async function createApiTestServer(): Promise<Server> {
  const server = createServer(async (req, res) => {
    // Extract path from the request URL
    const { headers, method } = req;
    const url = new URL(req.url || "", "http://localhost");

    // Construct a NextRequest with the right URL
    const fullUrl = `http://localhost${API_PREFIX}${url.pathname}${url.search}`;
    const nextReq = new NextRequest(fullUrl, {
      method,
      headers: headers as HeadersInit,
    });

    // For POST/PUT/PATCH requests, we need to handle the body
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve) => {
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", () => resolve());
      });

      const bodyBuffer = Buffer.concat(chunks);
      const nextReqWithBody = new NextRequest(fullUrl, {
        method,
        headers: headers as HeadersInit,
        body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
      });

      // In app router, params are accessed via context in handlers
      Object.defineProperty(nextReqWithBody, "nextUrl", {
        get() {
          return new URL(fullUrl);
        },
      });

      // Choose the appropriate handler based on the HTTP method
      let handlerResponse;
      switch (method) {
        case "POST":
          handlerResponse = await POST(nextReqWithBody);
          break;
        case "PUT":
          handlerResponse = await PUT(nextReqWithBody);
          break;
        case "PATCH":
          handlerResponse = await PATCH(nextReqWithBody);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      const body = await handlerResponse.text();
      res.statusCode = handlerResponse.status;
      handlerResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      res.end(body);
      return;
    }

    // For non-body requests (GET, DELETE)
    Object.defineProperty(nextReq, "nextUrl", {
      get() {
        return new URL(fullUrl);
      },
    });

    // Choose the appropriate handler based on the HTTP method
    let handlerResponse;
    switch (method) {
      case "GET":
        handlerResponse = await GET(nextReq);
        break;
      case "DELETE":
        handlerResponse = await DELETE(nextReq);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    const body = await handlerResponse.text();
    res.statusCode = handlerResponse.status;
    handlerResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.end(body);
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  return server;
}

export async function closeApiTestServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

/**
 * Flushes the database for the current test case.
 *
 * If the expect object is provided, the message will be printed to the console.
 * @param expect - The expect object from Jest.
 */
export async function flushDatabase(expect?: jest.Expect) {
  const tablenames = await db.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await db.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
    throw error;
  }

  const message = expect?.getState().currentTestName;
  if (message) {
    process.stdout.write(`Database flushed for ${message}\n`);
  } else {
    process.stdout.write(`Database flushed\n`);
  }
}

/**
 * Signs in a test account.
 * @param botNum - The number of the bot to sign in.
 * @param revoke - Whether to revoke the session after getting the JWT.
 * @param falseJwt - Whether to return a false JWT that would fail the auth check.
 * @returns The session ID and JWT.
 */
export async function signInTestAccount(
  botNum: number,
  revoke: boolean = true,
  falseJwt: boolean = false
) {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const botIds = ["user_2xLLWhUxEMd1EbDXsfAyfyCFXtE"]; // integration_test_bot1

  const session = await clerkClient.sessions.createSession({
    // for testing only
    userId: botIds[botNum - 1],
  });

  const jwtObj = await clerkClient.sessions.getToken(session.id, "jwt"); // make sure "jwt" is in clerk

  const decoded = jwt.verify(
    jwtObj.jwt,
    process.env.CLERK_PEM_PUBLIC_KEY as string,
    { algorithms: ["RS256"] }
  );

  const result = {
    sessionId: session.id,
    jwt: jwtObj.jwt,
    decoded: decoded as {
      sub: string;
      email: string;
      imageUrl: string;
      firstName: string;
      lastName: string;
    },
  };

  if (revoke) {
    await clerkClient.sessions.revokeSession(session.id);
  }

  if (falseJwt) {
    result.jwt = "false";
  }

  return result;
}
