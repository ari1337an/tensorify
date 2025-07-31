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
      method: "PUT",
      path: "/workflow/:workflowId/plugin/:pluginId",
      pathParams: z.object({
        workflowId: UUID,
        pluginId: UUID,
      }),
      body: InstallPluginRequest,
      responses: {
        200: Message,
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
      summary: "Update an installed plugin in a workflow",
      description:
        "Update an existing plugin installation in a workflow using slug format @username/plugin:version",
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
      const { workflowId, pluginId } = params;
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

        // Check if the plugin exists for this workflow
        const existingPlugin = await db.workflowInstalledPlugins.findFirst({
          where: {
            id: pluginId,
            workflowId: workflowId,
          },
        });

        if (!existingPlugin) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: {
              status: "failed",
              message: `Plugin not found in this workflow`,
            },
          });
        }

        // Check if the new slug already exists for another plugin in this workflow
        const conflictingPlugin = await db.workflowInstalledPlugins.findFirst({
          where: {
            workflowId: workflowId,
            slug: slug,
            id: { not: pluginId }, // Exclude the current plugin
          },
        });

        if (conflictingPlugin) {
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

          // Try to fetch manifest.json from backend API
          try {
            const isDevelopment = process.env.NODE_ENV === "development";
            const backendBaseUrl = isDevelopment
              ? "http://localhost:3001"
              : "https://backend.tensorify.io";

            const manifestResponse = await fetch(
              `${backendBaseUrl}/api/v1/plugin/getManifest?slug=${encodeURIComponent(slug)}`
            );

            if (manifestResponse.ok) {
              manifestData = (await manifestResponse.json()).data;
              if (!manifestData) {
                throw new TsRestResponseError(contract, {
                  status: 500,
                  body: {
                    status: "failed",
                    message:
                      "Plugin service is temporarily unavailable. Please try again later.",
                  },
                });
              }
            } else {
              console.warn(
                `Failed to fetch manifest for ${slug}:`,
                manifestResponse.status
              );
              throw new TsRestResponseError(contract, {
                status: 500,
                body: {
                  status: "failed",
                  message:
                    "Plugin service is temporarily unavailable. Please try again later.",
                },
              });
            }
          } catch (manifestError) {
            console.warn("Failed to fetch manifest.json:", manifestError);
            throw new TsRestResponseError(contract, {
              status: 500,
              body: {
                status: "failed",
                message:
                  "Plugin service is temporarily unavailable. Please try again later.",
              },
            });
          }
        } catch (error) {
          console.warn("Failed to fetch plugin metadata:", error);
          // Continue with update but use defaults
        }

        // Update the plugin atomically with new metadata
        await db.$transaction(async (tx) => {
          await tx.workflowInstalledPlugins.update({
            where: { id: pluginId },
            data: {
              slug,
              description: description || pluginMetadata?.description || null,
              pluginType: pluginMetadata?.pluginType || "CUSTOM",
              manifest: manifestData, // Use fetched manifest data
              updatedAt: new Date(),
            },
          });
        });

        return {
          status: 200,
          body: { message: "Plugin updated successfully." },
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) {
          throw error;
        }

        console.error("Failed to update plugin:", error);

        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to update plugin.",
          },
        });
      }
    },
  }),
};
