import { initContract } from "@ts-rest/core";
import { generateOpenApi } from '@ts-rest/open-api';
import {
  contract as userGetUserContract,
  action as userGetUserAction,
} from "./user/getUser";

const c = initContract();

const unprefixedContracts = {
    userGetUser: userGetUserContract,
};

const composedUnprefixedContracts = c.router(
  unprefixedContracts,
  {
    strictStatusCodes: true,
  }
);

export const contracts = c.router(
  unprefixedContracts,
  {
    pathPrefix: "/v1",
    strictStatusCodes: true,
  }
);

export const actions = {
  userGetUser: userGetUserAction,
};

export const openApiDocument = generateOpenApi(
  composedUnprefixedContracts,
  {
    info: {
      title: 'API Service',
      version: 'v1.0.0',
    },
    servers: process.env.NODE_ENV === 'production'
      ? [
          {
            url: "https://backend.tensorify.io/api/v1",
            description: "Production server",
          },
        ]
      : [
          {
            url: "http://localhost:3001/api/v1",
            description: "Local server",
          },
        ],
  }
);
