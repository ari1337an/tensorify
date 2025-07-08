import { initServer } from "@ts-rest/express";
import { initContract } from "@ts-rest/core";
import { contracts as v1Contracts, actions as v1Actions } from "./v1";
import { contracts as v2Contracts, actions as v2Actions } from "./v2";

const s = initServer();
const c = initContract();

// Create the main contract router with proper versioning
export const contracts = c.router(
  {
    v1: v1Contracts,
    v2: v2Contracts,
  },
  {
    pathPrefix: "/api",
    strictStatusCodes: true,
  }
);

// Create the actions router that matches the contract structure
export const actions = s.router(contracts, {
  v1: v1Actions,
  v2: v2Actions,
});
