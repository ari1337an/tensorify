import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import {
  ErrorResponse,
  JwtPayloadSchema,
  USERID,
  UserRole,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/users/:userId/roles",
      pathParams: z.object({
        userId: USERID,
      }),
      responses: {
        200: z.array(UserRole),
        400: ErrorResponse,
        401: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["UserRoles"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Get user roles",
      description: "Get all roles assigned to a user",
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
    middleware: [secureByAuthentication],
    handler: async ({ params }): Promise<ContractResponse> => {
      try {
        const parsedParams = z.object({ userId: USERID }).safeParse(params);
        if (!parsedParams.success) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: { status: "failed", message: "Invalid user ID" },
          });
        }

        const user = await db.user.findUnique({
          where: {
            id: parsedParams.data.userId,
          },
        });
        if (!user) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "User not found" },
          });
        }

        const roles = await db.userRole.findMany({
          where: {
            userId: parsedParams.data.userId,
          },
          select: {
            id: true,
            expiresAt: true,
            userId: true,
            roleId: true,
          },
        });

        const parseAbleRoles = roles.map((role) => ({
          id: role.id,
          expiresAt: role.expiresAt?.toISOString(),
          userId: role.userId,
          roleId: role.roleId,
        }));

        const parsedRoles = UserRole.array().safeParse(parseAbleRoles);
        if (!parsedRoles.success) {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: { status: "failed", message: "Response validation failed" },
          });
        }

        return {
          status: 200,
          body: parsedRoles.data,
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) {
          throw error;
        } else {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: { status: "failed", message: "Internal server error" },
          });
        }
      }
    },
  }),
};
