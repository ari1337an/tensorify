import { createServer, Server } from "http";
import { NextRequest } from "next/server";
import { GET, POST, PUT, PATCH, DELETE } from "../[...ts-rest]/route";
import version from "./version.json";

const API_PREFIX = `/api/${version.apiVersion}`;

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
      Object.defineProperty(nextReqWithBody, 'nextUrl', {
        get() {
          return new URL(fullUrl);
        }
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
    Object.defineProperty(nextReq, 'nextUrl', {
      get() {
        return new URL(fullUrl);
      }
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