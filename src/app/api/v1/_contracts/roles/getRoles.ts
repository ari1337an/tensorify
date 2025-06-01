import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import { secureByAuthentication } from "../auth-utils";
import { ErrorResponse, JwtPayloadSchema, Role, ResourceType } from "../schema";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

const c = initContract();

// Define hierarchical resource path validation
const ResourcePathValidator = z.string().refine((path) => {
  // Hierarchical format: org:id[/team:id[/project:id[/workflow:id]]]
  const hierarchyPattern =
    /^org:[a-zA-Z0-9-]+(?:\/team:[a-zA-Z0-9-]+(?:\/project:[a-zA-Z0-9-]+(?:\/workflow:[a-zA-Z0-9-]+)?)?)?$/;
  return hierarchyPattern.test(path);
}, "Invalid hierarchical resource path format. Expected: org:id[/team:id[/project:id[/workflow:id]]]");

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/roles",
      query: z.object({
        resourceType: ResourceType,
        resourcePath: ResourcePathValidator,
      }),
      responses: {
        200: z.array(Role),
        400: ErrorResponse,
        401: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Roles"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Search roles",
      description:
        "Retrieve roles for a specific resource using hierarchical paths (org:id/team:id/project:id/workflow:id)",
    },
  },
  {
    strictStatusCodes: true,
  }
);

type ContractResponse = ServerInferResponses<typeof contract.contract>;

// Helper function to parse hierarchical resource path
function parseResourcePath(resourcePath: string, expectedResourceType: string) {
  const segments = resourcePath.split("/");
  const pathData: Record<string, string> = {};

  // Parse each segment (format: type:id)
  for (const segment of segments) {
    const [type, id] = segment.split(":");
    if (!type || !id) {
      throw new Error(`Invalid segment format: ${segment}`);
    }
    pathData[type] = id;
  }

  // Map resource types to hierarchy names
  const resourceTypeMap: Record<string, string> = {
    ORGANIZATION: "org",
    TEAM: "team",
    PROJECT: "project",
    WORKFLOW: "workflow",
  };

  const expectedHierarchyType = resourceTypeMap[expectedResourceType];
  if (!expectedHierarchyType) {
    throw new Error(`Invalid resource type: ${expectedResourceType}`);
  }

  // Validate that the path contains the expected resource type
  const resourceHierarchy = ["org", "team", "project", "workflow"];
  const expectedIndex = resourceHierarchy.indexOf(expectedHierarchyType);

  if (expectedIndex === -1) {
    throw new Error(
      `Invalid resource hierarchy type: ${expectedHierarchyType}`
    );
  }

  // Validate that all required parent resources are present
  for (let i = 0; i <= expectedIndex; i++) {
    const requiredType = resourceHierarchy[i];
    if (!pathData[requiredType]) {
      throw new Error(
        `Missing required ${requiredType} in resource path for ${expectedResourceType}`
      );
    }
  }

  // Validate that the path doesn't contain extra hierarchy levels beyond what's expected
  const actualSegmentCount = segments.length;
  const expectedSegmentCount = expectedIndex + 1;
  if (actualSegmentCount !== expectedSegmentCount) {
    throw new Error(
      `Invalid path structure for ${expectedResourceType}. Expected ${expectedSegmentCount} segments, got ${actualSegmentCount}`
    );
  }

  // Get the target resource ID
  const targetResourceId = pathData[expectedHierarchyType];

  return {
    resourceId: targetResourceId,
    pathData,
    orgId: pathData.org,
    teamId: pathData.team,
    projectId: pathData.project,
    workflowId: pathData.workflow,
  };
}

// Helper function to validate resource hierarchy exists in database
async function validateResourceHierarchy(
  parsedPath: ReturnType<typeof parseResourcePath>
) {
  const { orgId, teamId, projectId, workflowId } = parsedPath;

  // Always validate organization exists
  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    throw new Error(`Organization ${orgId} not found`);
  }

  // Validate team if present
  if (teamId) {
    const team = await db.team.findUnique({ where: { id: teamId, orgId } });
    if (!team) {
      throw new Error(`Team ${teamId} not found in organization ${orgId}`);
    }
  }

  // Validate project if present
  if (projectId) {
    if (!teamId) {
      throw new Error("Project requires team in resource path");
    }
    const project = await db.project.findUnique({
      where: { id: projectId, teamId },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in team ${teamId}`);
    }
  }

  // Validate workflow if present
  if (workflowId) {
    if (!projectId) {
      throw new Error("Workflow requires project in resource path");
    }
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId, projectId },
    });
    if (!workflow) {
      throw new Error(
        `Workflow ${workflowId} not found in project ${projectId}`
      );
    }
  }
}

export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async ({ query }): Promise<ContractResponse> => {
      try {
        const { resourceType, resourcePath } = query;

        // Parse the hierarchical resource path
        const parsedPath = parseResourcePath(resourcePath, resourceType);

        // Validate that the resource hierarchy exists in the database
        await validateResourceHierarchy(parsedPath);

        // Query roles with associated permissions
        const roles = await db.role.findMany({
          where: {
            resourceType,
            resourceId: parsedPath.resourceId,
          },
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        });

        // Format response to match Role schema
        const responseBody = roles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description || undefined,
          resourceType: role.resourceType as z.infer<typeof ResourceType>,
          resourceId: role.resourceId || "",
          permissions: role.permissions.map((rp) => ({
            permissionId: rp.permission.id,
            type: rp.type as "ALLOW" | "DENY",
          })),
        }));

        // Validate response body against schema
        const parsedBody = z.array(Role).safeParse(responseBody);
        if (!parsedBody.success) {
          console.error("Schema validation failed:", parsedBody.error);
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
          body: parsedBody.data,
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) {
          throw error;
        }

        // Handle validation errors with 400 status
        if (
          error instanceof Error &&
          (error.message.includes("Invalid") ||
            error.message.includes("Missing") ||
            error.message.includes("not found"))
        ) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message: error.message,
            },
          });
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
