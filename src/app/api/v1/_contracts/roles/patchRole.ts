import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import { secureByAuthentication } from "../auth-utils";
import { ErrorResponse, JwtPayloadSchema, Role } from "../schema";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

// Define UpdateRoleRequest schema
const UpdateRoleRequest = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().nullable().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field (name or description) must be provided",
  });

const c = initContract();

export const contract = c.router(
  {
    contract: {
      method: "PATCH",
      path: "/roles/:roleId",
      pathParams: z.object({
        roleId: z.string().uuid("Invalid role ID format"),
      }),
      body: UpdateRoleRequest,
      responses: {
        200: Role,
        400: ErrorResponse,
        404: ErrorResponse,
        401: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Roles"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Update role metadata",
      description: "Update the name and/or description of an existing role",
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
        const { roleId } = params;
        const { name, description } = body;

        // Check if role exists
        const existingRole = await db.role.findUnique({
          where: { id: roleId },
          include: { permissions: { include: { permission: true } } },
        });

        if (!existingRole) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "Role not found" },
          });
        }

        // Update role
        const updatedRole = await db.role.update({
          where: { id: roleId },
          data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
          },
          include: { permissions: { include: { permission: true } } },
        });

        // Format response to match Role schema
        const responseBody = {
          id: updatedRole.id,
          name: updatedRole.name,
          description: updatedRole.description || undefined,
          resourceType: updatedRole.resourceType as z.infer<
            typeof Role.shape.resourceType
          >,
          resourceId: updatedRole.resourceId || "",
          permissions: updatedRole.permissions.map((rp) => ({
            permissionId: rp.permission.id,
            type: rp.type as "ALLOW" | "DENY",
          })),
        };

        // Validate response body against schema
        const parsedResponse = Role.safeParse(responseBody);
        if (!parsedResponse.success) {
          console.error("Schema validation failed:", parsedResponse.error);
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: "Failed to parse response body",
            },
          });
        }

        return {
          status: 200,
          body: parsedResponse.data,
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
