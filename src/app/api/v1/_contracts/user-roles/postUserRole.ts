import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import {
  AssignRoleRequest,
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
      method: "POST",
      path: "/users/:userId/roles",
      pathParams: z.object({
        userId: USERID,
      }),
      body: AssignRoleRequest,
      responses: {
        201: UserRole,
        400: ErrorResponse,
        401: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["UserRoles"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Assign role to user",
      description: "Assign a role to a user with optional expiration date",
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
    handler: async ({ params, body }): Promise<ContractResponse> => {
      try {
        // Validate path parameters
        const parsedParams = z.object({ userId: USERID }).safeParse(params);
        if (!parsedParams.success) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: { status: "failed", message: "Invalid user ID" },
          });
        }

        // Validate request body
        const parsedBody = AssignRoleRequest.safeParse(body);
        if (!parsedBody.success) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: { status: "failed", message: "Invalid request body" },
          });
        }

        const { userId } = parsedParams.data;
        const { roleId, expiresAt } = parsedBody.data;

        // Check if user exists
        const userExists = await db.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (!userExists) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "User not found" },
          });
        }

        // Check if role exists
        const roleExists = await db.role.findUnique({
          where: { id: roleId },
          select: { id: true },
        });

        if (!roleExists) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "Role not found" },
          });
        }

        // Check if user already has this role
        const existingUserRole = await db.userRole.findFirst({
          where: {
            userId,
            roleId,
          },
        });

        if (existingUserRole) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: { status: "failed", message: "User already has this role" },
          });
        }

        // Create user role assignment
        const newUserRole = await db.userRole.create({
          data: {
            userId,
            roleId,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          },
        });

        // Construct response body
        const responseBody = {
          id: newUserRole.id,
          roleId: newUserRole.roleId,
          userId: newUserRole.userId,
          expiresAt: newUserRole.expiresAt?.toISOString(),
        };

        // Validate response body
        const parsedResponse = UserRole.safeParse(responseBody);
        if (!parsedResponse.success) {
          // console.log(parsedResponse.error);
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: "Failed to parse response body",
            },
          });
        }

        return {
          status: 201,
          body: responseBody,
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) {
          throw error;
        }
        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: `Internal server error: ${error}`,
          },
        });
      }
    },
  }),
};
