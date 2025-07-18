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
  TeamListResponse,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/organization/:orgId/teams",
      pathParams: z.object({
        orgId: UUID,
      }),
      query: z.object({
        page: Page.optional(),
        limit: Size.optional(),
      }),
      responses: {
        200: TeamListResponse,
        401: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Team"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "List all teams in an organization",
      description: "List all teams in an organization with pagination.",
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

      // Verify the organization exists
      const org = await db.organization.findUnique({
        where: { id: orgId },
      });

      if (!org) {
        throw new TsRestResponseError(contract, {
          status: 404,
          body: { status: "failed", message: "Organization not found" },
        });
      }

      // Get teams with member count
      const [teams, totalCount] = await Promise.all([
        db.team.findMany({
          where: { orgId },
          include: {
            _count: {
              select: { members: true },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.team.count({
          where: { orgId },
        }),
      ]);

      const items = teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        organizationId: team.orgId,
        memberCount: team._count.members,
        createdAt: team.createdAt.toISOString(),
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
