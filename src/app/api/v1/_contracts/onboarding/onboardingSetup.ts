import {
  ServerInferRequest,
  ServerInferResponses,
} from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import {
  ErrorResponse,
  OnboardingSetupRequest,
  OnboardingSetupResponse,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import { NextRequest } from "next/server";

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
  contract: async (
    { body }: ContractRequest,
    { request }: { request: NextRequest }
  ): Promise<ContractResponse> => {
    await secureByAuthentication(request, contract);
    return {
      status: 201,
      body: {
        orgId: "123",
        teamId: "456",
        projectId: "789",
        workflowId: "101",
        orgName: body.orgName,
        orgUrl: body.orgUrl,
      },
    };
  },
};
