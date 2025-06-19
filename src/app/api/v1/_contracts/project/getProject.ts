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
  ProjectListResponse,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/organization/:orgId/projects",
      pathParams: z.object({
        orgId: UUID,
      }),
      query: z.object({
        page: Page.optional(),
        limit: Size.optional(),
      }),
      responses: {
        200: ProjectListResponse,
        401: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Project"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "List all projects in an organization",
      description:
        "List all projects in an organization with pagination, including team information.",
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

      // Get projects with team information and member count
      const [projects, totalCount] = await Promise.all([
        db.project.findMany({
          where: {
            team: {
              orgId: orgId,
            },
          },
          include: {
            team: {
              select: {
                id: true,
                name: true,
                orgId: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.project.count({
          where: {
            team: {
              orgId: orgId,
            },
          },
        }),
      ]);

      const items = projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        teamId: project.teamId,
        teamName: project.team.name,
        organizationId: project.team.orgId,
        memberCount: project._count.members,
        createdAt: project.createdAt.toISOString(),
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
