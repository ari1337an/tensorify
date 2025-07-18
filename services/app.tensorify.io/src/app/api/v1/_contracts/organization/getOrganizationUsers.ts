import {
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import {
  ErrorResponse,
  JwtPayloadSchema,
  UUID,
  Page,
  Size,
  UserListResponse,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/organization/:orgId/users",
      pathParams: z.object({
        orgId: UUID,
      }),
      query: z.object({
        page: Page.optional(),
        limit: Size.optional(),
      }),
      responses: {
        200: UserListResponse,
        401: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Organization"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "List all users in an org",
      description: "List all users in an org with pagination.",
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
    handler: async ({
      params,
      query,
    }: ContractRequest): Promise<ContractResponse> => {
      const { orgId } = params;
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const org = await db.organization.findUnique({
        where: { id: orgId },
      });

      if (!org) {
        throw new TsRestResponseError(contract, {
          status: 404,
          body: { status: "failed", message: "Organization not found" },
        });
      }

      // Get all users associated with the organization (creators and members)
      // Use a single query to get the organization with both creator and members
      const orgWithUsers = await db.organization.findUnique({
        where: { id: orgId },
        include: {
          createdBy: {
            include: {
              userRoles: {
                include: {
                  role: {
                    include: {
                      permissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          members: {
            include: {
              user: {
                include: {
                  userRoles: {
                    include: {
                      role: {
                        include: {
                          permissions: {
                            include: {
                              permission: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!orgWithUsers) {
        throw new TsRestResponseError(contract, {
          status: 404,
          body: { status: "failed", message: "Organization not found" },
        });
      }

      // Collect all unique users with their roles
      const userMap = new Map<
        string,
        {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          imageUrl: string;
          userRoles: Array<{
            role: {
              id: string;
              name: string;
              resourceType: string;
              permissions: Array<{
                permission: {
                  action: string;
                };
              }>;
            };
          }>;
        }
      >();

      // Add members
      if (orgWithUsers.members) {
        orgWithUsers.members.forEach((membership) => {
          userMap.set(membership.user.id, membership.user);
        });
      }

      // Add creator
      if (orgWithUsers.createdBy) {
        userMap.set(orgWithUsers.createdBy.id, {
          ...orgWithUsers.createdBy,
          userRoles: [
            ...orgWithUsers.createdBy.userRoles,
            {
              role: {
                id: "98ef4090-9bc0-4554-a025-1ec7e830f28b",
                name: "Super Admin",
                resourceType: "ORGANIZATION", // Assuming it's an organization-level role
                permissions: [], // No specific permissions for this hardcoded role, adjust if needed
              },
            },
          ],
        });
      }

      const totalCount = userMap.size;

      // Convert map to array and apply pagination
      const allUsers = Array.from(userMap.values());
      const paginatedUsers = allUsers.slice(skip, skip + limit);

      // Transform users to match the expected response format
      const items = paginatedUsers.map((user) => ({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        roles: user.userRoles.map((userRole) => ({
          id: userRole.role.id,
          name: userRole.role.name,
          permissions: userRole.role.permissions.map((rolePermission) => ({
            action: rolePermission.permission.action,
            resourceType: userRole.role.resourceType,
          })),
        })),
        status: "active" as const,
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return {
        status: 200,
        body: {
          items,
          meta: {
            totalCount,
            page,
            size: limit,
            totalPages,
          },
        },
      };
    },
  }),
};
