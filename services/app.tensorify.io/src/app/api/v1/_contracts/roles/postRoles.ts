import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import {
  CreateRoleRequest,
  ErrorResponse,
  JwtPayloadSchema,
  Role,
  ResourceType,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/roles",
      body: CreateRoleRequest,
      responses: {
        201: Role,
        400: ErrorResponse,
        401: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Roles"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Create role with permissions",
      description:
        "Create a new role with associated permissions for a specific resource",
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
    handler: async ({ body }): Promise<ContractResponse> => {
      try {
        // Validate request body
        const parsedBody = CreateRoleRequest.safeParse(body);
        if (!parsedBody.success) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: { status: "failed", message: "Invalid request body" },
          });
        }

        const { name, description, resourceType, resourceId, permissions } =
          parsedBody.data;

        // Extract permission IDs
        const permissionIds = permissions.map((p) => p.permissionId);

        // Validate permission IDs exist, fetching only IDs for efficiency
        const existingPermissionIds = await db.permissionDefinition.findMany({
          where: {
            id: {
              in: permissionIds,
            },
          },
          select: {
            id: true,
          },
        }).then(results => results.map(r => r.id));

        if (existingPermissionIds.length !== permissionIds.length) {
          const missingIds = permissionIds.filter(
            id => !existingPermissionIds.includes(id)
          );
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message: `Permission(s) not found: ${missingIds.join(", ")}`,
            },
          });
        }

        // Map resourceType to corresponding relation field
        const resourceTypeToField: Record<z.infer<typeof ResourceType>, string> = {
          ORGANIZATION: 'organizationId',
          TEAM: 'teamId',
          PROJECT: 'projectId',
          WORKFLOW: 'workflowId',
        };

        // Create role with nested permissions in one database call
        const relationField = { [resourceTypeToField[resourceType]]: resourceId };
        const newRole = await db.role.create({
          data: {
            name,
            description,
            resourceType,
            resourceId,
            ...relationField,
            permissions: {
              create: permissions.map(perm => ({
                permissionId: perm.permissionId,
                type: perm.type,
              })),
            },
          },
        });

        // Construct response body
        const responseBody = {
          id: newRole.id,
          name: newRole.name,
          description: newRole.description || undefined,
          resourceType: newRole.resourceType as z.infer<typeof ResourceType>,
          resourceId: newRole.resourceId || "",
          permissions: permissions,
        };

        // Validate response body
        const parsedResponse = Role.safeParse(responseBody);
        if (!parsedResponse.success) {
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
