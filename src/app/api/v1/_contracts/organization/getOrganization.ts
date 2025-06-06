import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import { ErrorResponse, JwtPayloadSchema, OrgInfo } from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/organization",
      responses: {
        200: OrgInfo,
        401: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Organization"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Retrieve user's organization info",
      description: "Retrieve user's organization info",
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
    handler: async (_, { request }): Promise<ContractResponse> => {
      const userId = request.decodedJwt.id;

      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          createdOrgs: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          memberships: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TsRestResponseError(contract, {
          status: 404,
          body: {
            status: "failed",
            message: "User not found in database",
          },
        });
      }

      if (user.createdOrgs.length === 0 && user.memberships.length === 0) {
        throw new TsRestResponseError(contract, {
          status: 404,
          body: {
            status: "failed",
            message: "User has no organizations",
          },
        });
      }

      const responseBody = [...user.createdOrgs, ...user.memberships].map((org) => {
        if ("organization" in org) {
          return {
            id: org.organization.id,
            name: org.organization.name,
            slug: org.organization.slug,
          };
        } else {
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
          };
        }
      });

      const parsedBody = OrgInfo.safeParse(responseBody);

      if (!parsedBody.success) {
        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to parse organization info",
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
