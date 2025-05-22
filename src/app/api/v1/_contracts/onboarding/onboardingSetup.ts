import { ServerInferRequest, ServerInferResponses } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { secureByAuthentication } from "../auth-utils";
import { tsr } from "@ts-rest/serverless/next";
import {
  ErrorResponse,
  JwtPayloadSchema,
  OnboardingSetupResponse,
} from "../schema";

import { OnboardingSetupRequest } from "../schema";
extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/onboarding/setup",
      responses: {
        201: OnboardingSetupResponse,
        401: ErrorResponse,
      },
      body: OnboardingSetupRequest,
      metadata: {
        openApiTags: ["Onboarding"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Submit onboarding & provision account",
      description: "Submit onboarding & provision account",
    },
  },
  {
    strictStatusCodes: true,
  }
);

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async (
      { body }: ContractRequest,
      { request }
    ): Promise<ContractResponse> => {
      return {
        status: 201,
        body: {
          orgId: "11942908-8ed3-44dc-925c-afd4eb283aa1",
          teamId: "11942908-8ed3-44dc-925c-afd4eb283aa1",
          projectId: "11942908-8ed3-44dc-925c-afd4eb283aa1",
          workflowId: "11942908-8ed3-44dc-925c-afd4eb283aa1",
          orgName: request.userId || body.orgName,
          orgUrl: "test",
        },
      };
    },
  }),
};
