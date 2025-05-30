import { ServerInferRequest, ServerInferResponses } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema, USERID } from "../schema";
import { createClerkClient } from "@clerk/backend";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/account/getTestJwt/:userId",
      pathParams: z.object({
        userId: USERID.openapi({
          description: "The user's ID",
        }),
      }),
      responses: {
        200: z.object({
          jwt: z.string(),
        }),
      },
      metadata: {
        openApiTags: ["Account"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Retrieve a user's account information",
      description: "Retrieve a user's account information",
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
    middleware: [],
    handler: async ({
      params: { userId },
    }: ContractRequest): Promise<ContractResponse> => {
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const session = await clerkClient.sessions.createSession({
        // for testing only
        userId,
      });

      const jwtObj = await clerkClient.sessions.getToken(session.id, "jwt"); // make sure "jwt" is in clerk

      return {
        status: 200,
        body: {
          jwt: jwtObj.jwt,
        },
      };
    },
  }),
};
