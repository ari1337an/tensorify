import { initServer } from "@ts-rest/express";
import { initContract } from "@ts-rest/core";
import { contracts as v1Contracts, actions as v1Actions, openApiDocument as v1OpenApiDocument } from "./v1";

const s = initServer();
const c = initContract();

// Create the main contract router with proper versioning
export const contracts = c.router(
  {
    v1: v1Contracts,
  },
  {
    pathPrefix: "/api",
    strictStatusCodes: true,
  }
);

// Create the actions router that matches the contract structure
export const actions = s.router(contracts, {
  v1: v1Actions,
});

// Export openapi documents array
export const openapi = [
  { json: v1OpenApiDocument, name: "v1" },
];
