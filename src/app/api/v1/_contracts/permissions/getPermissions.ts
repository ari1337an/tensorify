import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import { ErrorResponse, JwtPayloadSchema, Permission } from "../schema";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/permissions",
      responses: {
        200: z.array(Permission),
        401: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Permissions"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "List all system permissions",
      description: "List all system permissions",
    },
  },
  {
    strictStatusCodes: true,
  }
);

type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [],
    handler: async (): Promise<ContractResponse> => {
      const permissions = await db.permissionDefinition.findMany();

      const responseBody = permissions.map((permission) => ({
        id: permission.id,
        action: permission.action,
      }));

      const parsedBody = z.array(Permission).safeParse(responseBody);

      if (!parsedBody.success) {
        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to parse permissions",
          },
        });
      }

      return {
        status: 200,
        body: parsedBody.data,
      };
    },
  }),
};
