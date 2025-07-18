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

// Helper function to compare semantic versions (e.g., "1.0.0", "2.1.0", "10.0.0")
function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;

    if (aPart > bPart) return -1; // a is greater (newer)
    if (aPart < bPart) return 1; // b is greater (newer)
  }

  return 0; // versions are equal
}

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
        version: z.string().optional(), // Optional version filter for specific version
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
        "List all workflows in an organization with pagination, including project information and workflow versions. Use 'version' query parameter to filter for a specific version, otherwise returns the latest version.",
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
      const { version } = query;
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

      // Get workflows with project and team information, member count, and version(s)
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
              // Always get all versions to determine isLatest properly
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
        let selectedVersion = null;
        let isLatest = false;

        if (workflow.versions.length > 0) {
          // Find the latest version by semantic version number
          const latestVersion = workflow.versions.sort((a, b) =>
            compareVersions(a.version, b.version)
          )[0];

          if (version) {
            // If specific version requested, find it in the versions array
            selectedVersion =
              workflow.versions.find((v) => v.version === version) || null;
            // Check if the requested version is the latest
            isLatest = selectedVersion
              ? selectedVersion.version === latestVersion.version
              : false;
          } else {
            // No specific version requested, use the latest
            selectedVersion = latestVersion;
            isLatest = true; // This is by definition the latest version
          }
        }

        // Create allVersions array with limited fields
        const allVersions = workflow.versions
          .sort((a, b) => compareVersions(a.version, b.version))
          .map((v) => ({
            id: v.id,
            summary: v.summary,
            version: v.version,
            isLatest:
              v.version ===
              (workflow.versions.length > 0
                ? workflow.versions.sort((a, b) =>
                    compareVersions(a.version, b.version)
                  )[0].version
                : false),
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
          }));

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
          version: selectedVersion
            ? {
                id: selectedVersion.id,
                summary: selectedVersion.summary,
                description: selectedVersion.description,
                version: selectedVersion.version,
                code: (selectedVersion.code as Record<string, unknown>) || {},
                isLatest: isLatest,
                createdAt: selectedVersion.createdAt.toISOString(),
                updatedAt: selectedVersion.updatedAt.toISOString(),
              }
            : null,
          allVersions: allVersions,
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
