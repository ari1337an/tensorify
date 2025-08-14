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

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/workflow/:workflowId/plugin/:pluginId/reset-manifest",
      pathParams: z.object({
        workflowId: UUID,
        pluginId: UUID,
      }),
      body: z.object({}),
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
      summary: "Reset an installed plugin's manifest from Backend",
      description:
        "Fetch the latest manifest via backend getManifest and persist it to this workflow's installed plugin record.",
    },
  },
  { strictStatusCodes: true }
);

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async (
      { params }: ContractRequest,
      { request }
    ): Promise<ContractResponse> => {
      try {
        const userId = request.decodedJwt?.id;
        if (!userId) {
          throw new TsRestResponseError(contract, {
            status: 401,
            body: { status: "failed", message: "User not authenticated" },
          });
        }

        const parsedParams = z
          .object({ workflowId: UUID, pluginId: UUID })
          .safeParse(params);
        if (!parsedParams.success) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: { status: "failed", message: "Invalid workflow/plugin ID" },
          });
        }
        const { workflowId, pluginId } = parsedParams.data;

        // Ensure workflow exists
        const workflow = await db.workflow.findUnique({
          where: { id: workflowId },
        });
        if (!workflow) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "Workflow not found" },
          });
        }

        // Find installed plugin
        const installed = await db.workflowInstalledPlugins.findFirst({
          where: { id: pluginId, workflowId },
        });
        if (!installed) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: {
              status: "failed",
              message: "Plugin not found in this workflow",
            },
          });
        }

        // Fetch manifest from backend API
        const isDevelopment = process.env.NODE_ENV === "development";
        const backendBaseUrl = isDevelopment
          ? "http://localhost:3001"
          : "https://backend.tensorify.io";

        const url = `${backendBaseUrl}/api/v1/plugin/getManifest?slug=${encodeURIComponent(
          installed.slug
        )}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: `Backend manifest fetch failed: ${res.status} ${res.statusText}`,
            },
          });
        }
        const json = await res.json().catch(() => ({}));
        const manifestData = json?.data ?? null;
        if (!manifestData || typeof manifestData !== "object") {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: "Backend returned empty/invalid manifest",
            },
          });
        }

        // Persist manifest
        await db.workflowInstalledPlugins.update({
          where: { id: pluginId },
          data: { manifest: manifestData as any },
        });

        return {
          status: 200,
          body: { message: `Manifest reset for ${installed.slug}` },
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) throw error;
        console.error("Reset workflow plugin manifest error:", error);
        throw new TsRestResponseError(contract, {
          status: 500,
          body: { status: "failed", message: "Internal server error" },
        });
      }
    },
  }),
};
