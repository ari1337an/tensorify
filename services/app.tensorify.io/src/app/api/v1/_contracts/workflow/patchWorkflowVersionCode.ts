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
import { InputJsonValue } from "@/server/database/prisma/generated/client/runtime/library";

extendZodWithOpenApi(z);

const c = initContract();

// Schema for updating workflow version code
const UpdateWorkflowVersionCodeRequest = z
  .object({
    code: z
      .record(z.unknown())
      .describe("React Flow canvas state including nodes, edges, and viewport"),
  })
  .strict();

export const contract = c.router(
  {
    contract: {
      method: "PATCH",
      path: "/workflow/:workflowId/version/:versionId/code",
      pathParams: z.object({
        workflowId: UUID,
        versionId: UUID,
      }),
      body: UpdateWorkflowVersionCodeRequest,
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
      summary: "Update workflow version code",
      description:
        "Update the React Flow canvas state (nodes, edges, viewport) for a specific workflow version.",
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
    handler: async (
      { params, body }: ContractRequest,
      { request }
    ): Promise<ContractResponse> => {
      const { workflowId, versionId } = params;
      const { code } = body;
      const userId = request.decodedJwt?.id;

      try {
        // Verify the workflow version exists
        const workflowVersion = await db.workflowVersion.findFirst({
          where: {
            id: versionId,
            workflowId: workflowId,
          },
          include: {
            workflow: {
              include: {
                project: {
                  include: {
                    team: true,
                  },
                },
              },
            },
          },
        });

        if (!workflowVersion) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "Workflow version not found" },
          });
        }

        // TODO: Implement proper access control
        // For now, we're allowing access if the workflow exists
        // This matches the behavior in getWorkflowPlugins.ts

        // Update the workflow version code
        await db.workflowVersion.update({
          where: {
            id: versionId,
          },
          data: {
            code: code === null ? {} : (code as InputJsonValue),
            updatedAt: new Date(),
          },
        });

        return {
          status: 200,
          body: { message: "Workflow version code updated successfully." },
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) {
          throw error;
        }

        console.error("Failed to update workflow version code:", error);

        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to update workflow version code.",
          },
        });
      }
    },
  }),
};
