import { ServerInferRequest, ServerInferResponses } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/account",
      responses: {
        201: z.object({
          message: z.string(),
        }),
      },
      body: z.object({
        name: z.string(),
      }),
      metadata: {
        openApiTags: ["account"],
        // openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Create a new account",
      description: "Create a new account",
    },
  },
  {
    strictStatusCodes: true,
  }
);

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: async ({ body }: ContractRequest): Promise<ContractResponse> => {
    return {
      status: 201,
      body: {
        message: `Hello, ${body.name}!`,
      },
    };
  },
};
