import {
  initContract,
  ServerInferRequest,
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

// Request body schema for updating plugin manifest
const UpdateManifestRequest = z.object({
  manifest: z.record(z.unknown()).openapi({
    description: "Updated plugin manifest JSON object",
    example: {
      name: "Enhanced Plugin",
      version: "1.2.0",
      visual: {
        size: { width: 250, height: 150 },
        styling: { borderRadius: 8, borderColor: "#3b82f6" },
      },
    },
  }),
});

// Contract Definition
export const contract = c.router(
  {
    contract: {
      method: "PUT",
      path: "/workflow/:workflowId/plugin/:pluginId/manifest",
      pathParams: z.object({
        workflowId: UUID,
        pluginId: UUID,
      }),
      body: UpdateManifestRequest,
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
      summary: "Update plugin manifest for a workflow",
      description:
        "Update the manifest JSON for an installed plugin in a specific workflow. This allows persisting visual configurations and other plugin settings.",
    },
  },
  { strictStatusCodes: true }
);

// Type Inference
type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

// Action with Handler
export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async (
      { params, body },
      { request }
    ): Promise<ContractResponse> => {
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
        const { manifest } = body;

        // Validate manifest is a valid JSON object
        if (
          !manifest ||
          typeof manifest !== "object" ||
          Array.isArray(manifest)
        ) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message: "Manifest must be a valid JSON object",
            },
          });
        }

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

        // Update the plugin manifest
        const updatedPlugin = await db.workflowInstalledPlugins.update({
          where: {
            id: pluginId,
          },
          data: {
            manifest: manifest,
          },
        });

        // Response construction
        const responseBody = {
          message: `Plugin manifest for ${installedPlugin.slug} updated successfully`,
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
        console.error("Update workflow plugin manifest error:", error);
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
