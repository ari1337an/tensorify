import {
  initContract,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { ErrorResponse, JwtPayloadSchema, UUID } from "../schema";
import { tsr } from "@ts-rest/serverless/next";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";
import { InstalledPluginRecordSchema } from "@tensorify.io/contracts";

extendZodWithOpenApi(z);

const c = initContract();

// Response schema for installed plugin
const WorkflowInstalledPlugin = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  description: z.string().nullable(),
  pluginType: z.string(), // Added pluginType field
  manifest: z.record(z.unknown()).nullable(), // Changed to use unknown instead of any
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/workflow/:workflowId/plugins",
      pathParams: z.object({
        workflowId: UUID,
      }),
      responses: {
        200: z.object({
          status: z.literal("success"),
          data: z.array(WorkflowInstalledPlugin),
        }),
        400: ErrorResponse,
        401: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Workflow"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Get installed plugins for a workflow",
      description:
        "Retrieve all plugins that are currently installed in a specific workflow",
    },
  },
  { strictStatusCodes: true }
);

type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async ({ params }, { request }): Promise<ContractResponse> => {
      try {
        const userId = request.decodedJwt?.id;
        if (!userId) {
          throw new TsRestResponseError(contract, {
            status: 401,
            body: { status: "failed", message: "User not authenticated" },
          });
        }

        // Validate path parameters
        const parsedParams = z.object({ workflowId: UUID }).safeParse(params);
        if (!parsedParams.success) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: { status: "failed", message: "Invalid workflow ID format" },
          });
        }

        const { workflowId } = parsedParams.data;

        // Check if workflow exists
        const workflow = await db.workflow.findUnique({
          where: { id: workflowId },
        });

        if (!workflow) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: {
              status: "failed",
              message: "Workflow not found",
            },
          });
        }

        // Get all installed plugins for this workflow
        const installedPlugins = await db.workflowInstalledPlugins.findMany({
          where: {
            workflowId: workflowId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // Format the response
        const responseData = installedPlugins.map((plugin) =>
          InstalledPluginRecordSchema.parse({
            id: plugin.id,
            slug: plugin.slug,
            description: plugin.description,
            pluginType: plugin.pluginType,
            manifest: plugin.manifest as Record<string, unknown> | null,
            createdAt: plugin.createdAt.toISOString(),
            updatedAt: plugin.updatedAt.toISOString(),
          })
        );

        return {
          status: 200,
          body: {
            status: "success",
            data: responseData,
          },
        };
      } catch (error) {
        console.error(error);
        if (error instanceof TsRestResponseError) {
          throw error;
        }
        throw new TsRestResponseError(contract, {
          status: 500,
          body: { status: "failed", message: "Internal server error" },
        });
      }
    },
  }),
};
