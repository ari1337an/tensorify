import { ServerInferResponses } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/account",
      responses: {
        200: z.object({
          message: z.string(),
        }),
      },
      metadata: {
        openApiTags: ["account"],
        // openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "another test",
      description: "Test desc",
    },
  },
  {
    strictStatusCodes: true,
  }
);

// type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: async (): Promise<ContractResponse> => {
    return {
      status: 200,
      body: {
        message: "Hello, world!",
      },
    };
  },
};
