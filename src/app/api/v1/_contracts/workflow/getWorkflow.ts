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
  WorkflowListResponse,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/organization/:orgId/workflows",
      pathParams: z.object({
        orgId: UUID,
      }),
      query: z.object({
        page: Page.optional(),
        limit: Size.optional(),
      }),
      responses: {
        200: WorkflowListResponse,
        401: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Workflow"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "List all workflows in an organization",
      description:
        "List all workflows in an organization with pagination, including project information.",
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

      // Get workflows with project and team information, member count, and latest version
      const [workflows, totalCount] = await Promise.all([
        db.workflow.findMany({
          where: {
            project: {
              team: {
                orgId: orgId,
              },
            },
          },
          include: {
            project: {
              include: {
                team: {
                  select: {
                    id: true,
                    name: true,
                    orgId: true,
                  },
                },
              },
            },
            versions: {
              orderBy: { createdAt: "desc" },
              take: 1, // Get only the latest version
            },
            _count: {
              select: { members: true },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.workflow.count({
          where: {
            project: {
              team: {
                orgId: orgId,
              },
            },
          },
        }),
      ]);

      const items = workflows.map((workflow) => {
        const latestVersion = workflow.versions[0] || null;
        return {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          projectId: workflow.projectId,
          projectName: workflow.project.name,
          teamId: workflow.project.teamId,
          teamName: workflow.project.team.name,
          organizationId: workflow.project.team.orgId,
          memberCount: workflow._count.members,
          createdAt: workflow.createdAt.toISOString(),
          latestVersion: latestVersion
            ? {
                id: latestVersion.id,
                summary: latestVersion.summary,
                description: latestVersion.description,
                version: latestVersion.version,
                code: (latestVersion.code as Record<string, unknown>) || {},
                createdAt: latestVersion.createdAt.toISOString(),
                updatedAt: latestVersion.updatedAt.toISOString(),
              }
            : null,
        };
      });

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
