import {
  initContract,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { Message, ErrorResponse, JwtPayloadSchema, UUID } from "../schema";
import { tsr } from "@ts-rest/serverless/next";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

const c = initContract();

// Contract Definition
export const contract = c.router(
  {
    contract: {
      method: "DELETE",
      path: "/workflow/:workflowId/plugin/:pluginId",
      pathParams: z.object({
        workflowId: UUID,
        pluginId: UUID,
      }),
      responses: {
        200: Message,
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
      summary: "Uninstall a plugin from a workflow",
      description: "Remove an installed plugin from a specific workflow",
    },
  },
  { strictStatusCodes: true }
);

// Type Inference
type ContractResponse = ServerInferResponses<typeof contract.contract>;

// Action with Handler
export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async ({ params }, { request }): Promise<ContractResponse> => {
      try {
        // Authentication Handling
        const userId = request.decodedJwt?.id;
        if (!userId) {
          throw new TsRestResponseError(contract, {
            status: 401,
            body: { status: "failed", message: "User not authenticated" },
          });
        }

        // Input Validation
        const pathParamsSchema = z.object({
          workflowId: UUID,
          pluginId: UUID,
        });
        const parsedParams = pathParamsSchema.safeParse(params);
        if (!parsedParams.success) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message: "Invalid workflow ID or plugin ID format",
            },
          });
        }

        const { workflowId, pluginId } = parsedParams.data;

        // Business Logic - Check if workflow exists
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

        // Check if plugin exists in the workflow
        const installedPlugin = await db.workflowInstalledPlugins.findFirst({
          where: {
            id: pluginId,
            workflowId: workflowId,
          },
        });

        if (!installedPlugin) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: {
              status: "failed",
              message: "Plugin not found in this workflow",
            },
          });
        }

        // Delete the plugin
        await db.workflowInstalledPlugins.delete({
          where: {
            id: pluginId,
          },
        });

        // Response construction
        const responseBody = {
          message: `Plugin ${installedPlugin.slug} uninstalled successfully`,
        };

        // Response Validation
        const validatedResponse = Message.safeParse(responseBody);
        if (!validatedResponse.success) {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: { status: "failed", message: "Invalid response data" },
          });
        }

        // Successful Response
        return { status: 200, body: responseBody };
      } catch (error) {
        // Error Handling
        console.error("Delete workflow plugin error:", error);
        if (error instanceof TsRestResponseError) {
          throw error;
        }
        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Internal server error",
          },
        });
      }
    },
  }),
};
