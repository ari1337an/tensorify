import { createNextHandler } from "@ts-rest/serverless/next";
import { contract } from "../_contracts";
import { appRouter } from "../_contracts";
import { middlewareCustom } from "../_contracts/auth-utils";

const handler = createNextHandler(contract, appRouter, {
  basePath: "/api/v1",
  jsonQuery: true,
  responseValidation: true,
  handlerType: "app-router",
  requestMiddleware: [middlewareCustom],
});

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};
