import {
  initContract,
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import {
  Message,
  ErrorResponse,
  JwtPayloadSchema,
  UUID,
  InstallPluginRequest,
} from "../schema";
import { tsr } from "@ts-rest/serverless/next";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

const c = initContract();

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/workflow/:workflowId/plugin",
      pathParams: z.object({
        workflowId: UUID,
      }),
      body: InstallPluginRequest,
      responses: {
        201: Message,
        400: ErrorResponse,
        401: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        409: ErrorResponse, // For plugin conflicts
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Workflow"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Install a plugin in a workflow",
      description:
        "Install a plugin in an existing workflow using slug format @username/plugin:version",
    },
  },
  { strictStatusCodes: true }
);

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    {
      decodedJwt: z.infer<typeof JwtPayloadSchema>;
    },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async ({
      params,
      body,
    }: ContractRequest): Promise<ContractResponse> => {
      const { workflowId } = params;
      const { slug, description } = body;

      try {
        // Verify the workflow exists
        const workflow = await db.workflow.findUnique({
          where: { id: workflowId },
          include: {
            project: {
              include: {
                team: {
                  select: {
                    orgId: true,
                  },
                },
              },
            },
          },
        });

        if (!workflow) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "Workflow not found" },
          });
        }

        // Check if the plugin is already installed for this workflow
        const existingPlugin = await db.workflowInstalledPlugins.findFirst({
          where: {
            workflowId: workflowId,
            slug: slug,
          },
        });

        if (existingPlugin) {
          throw new TsRestResponseError(contract, {
            status: 409,
            body: {
              status: "failed",
              message: `Plugin ${slug} is already installed in this workflow`,
            },
          });
        }

        // Fetch plugin metadata from plugins.tensorify.io
        let pluginMetadata = null;
        let manifestData = {};
        try {
          // Parse slug to extract plugin name and author for search
          const slugMatch = slug.match(/^@([^/]+)\/([^:]+):(.+)$/);
          if (!slugMatch) {
            throw new TsRestResponseError(contract, {
              status: 400,
              body: {
                status: "failed",
                message: "Invalid plugin slug format",
              },
            });
          }

          const [, authorName, pluginName, version] = slugMatch;

          // Fetch plugin metadata from plugins.tensorify.io
          const isDevelopment = process.env.NODE_ENV === "development";
          const baseUrl = isDevelopment
            ? "http://localhost:3004"
            : "https://plugins.tensorify.io";

          const searchResponse = await fetch(
            `${baseUrl}/api/plugins/search?q=${encodeURIComponent(pluginName)}`
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            pluginMetadata = searchData.plugins?.find(
              (p: { name: string; authorName: string }) =>
                p.name === pluginName && p.authorName === authorName
            );
          }

          // Try to fetch manifest.json from S3 if available
          try {
            // TODO: Implement proper manifest fetching via API endpoint
            // For now, use basic manifest structure with available data
            manifestData = {
              name: pluginName,
              version: version,
              pluginType: pluginMetadata?.pluginType || "CUSTOM",
              entrypointClassName: "TensorifyPlugin", // Default value
              description: pluginMetadata?.description,
              author: authorName,
            };
          } catch (manifestError) {
            console.warn("Failed to fetch manifest.json:", manifestError);
            // Continue with empty manifest
          }
        } catch (error) {
          console.warn("Failed to fetch plugin metadata:", error);
          // Continue with installation but use defaults
        }

        // Install the plugin atomically with metadata
        await db.$transaction(async (tx) => {
          await tx.workflowInstalledPlugins.create({
            data: {
              slug,
              description: description || pluginMetadata?.description || null,
              pluginType: pluginMetadata?.pluginType || "CUSTOM",
              manifest: manifestData, // Use fetched manifest data
              workflowId: workflowId,
            },
          });
        });

        return {
          status: 201,
          body: { message: "Plugin installed successfully." },
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) {
          throw error;
        }

        console.error("Failed to install plugin:", error);

        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to install plugin.",
          },
        });
      }
    },
  }),
};
