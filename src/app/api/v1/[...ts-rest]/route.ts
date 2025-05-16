import { createNextHandler } from "@ts-rest/serverless/next";
import { contract } from "../_contracts";
import { appRouter } from "../_contracts/route";

const handler = createNextHandler(contract, appRouter, {
  basePath: "/api/v1",
  jsonQuery: true,
  responseValidation: true,
  handlerType: "app-router",
});

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};
