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

// Schema for creating a new workflow version
const CreateWorkflowVersionRequest = z
  .object({
    summary: z
      .string()
      .min(1, { message: "Summary is required" })
      .max(100, { message: "Summary must be less than 100 characters" }),
    description: z
      .string()
      .max(500, { message: "Description must be less than 500 characters" })
      .optional(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, {
      message: "Version must follow semantic versioning format (e.g., 1.0.0)",
    }),
  })
  .strict();

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/workflow/:workflowId/version",
      pathParams: z.object({
        workflowId: UUID,
      }),
      body: CreateWorkflowVersionRequest,
      responses: {
        201: Message,
        400: ErrorResponse,
        401: ErrorResponse,
        403: ErrorResponse,
        404: ErrorResponse,
        409: ErrorResponse, // For version conflicts
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Workflow"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Create a new version of a workflow",
      description:
        "Create a new version of an existing workflow with the current workflow state.",
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
      const { summary, description, version } = body;

      try {
        // Verify the workflow exists and get current version data
        const workflow = await db.workflow.findUnique({
          where: { id: workflowId },
          include: {
            versions: {
              select: {
                version: true,
                code: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1, // Get the latest version for code copying
            },
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

        // Check if the version already exists for this workflow
        const existingVersion = await db.workflowVersion.findFirst({
          where: {
            workflowId: workflowId,
            version: version,
          },
        });

        if (existingVersion) {
          throw new TsRestResponseError(contract, {
            status: 409,
            body: {
              status: "failed",
              message: `Version ${version} already exists for this workflow`,
            },
          });
        }

        // Get the current latest version's code (if any) to copy it to the new version
        const latestVersionCode =
          workflow.versions.length > 0 ? workflow.versions[0].code : {};

        // Create the new version atomically
        await db.$transaction(async (tx) => {
          // Mark all existing versions as not latest
          await tx.workflowVersion.updateMany({
            where: { workflowId: workflowId },
            data: { updatedAt: new Date() }, // This ensures the new version is the latest by creation time
          });

          // Create the new version
          await tx.workflowVersion.create({
            data: {
              summary,
              description: description || workflow.description,
              version,
              code: latestVersionCode || {},
              workflowId: workflowId,
            },
          });
        });

        return {
          status: 201,
          body: { message: "Workflow version created successfully." },
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) {
          throw error;
        }

        console.error("Failed to create workflow version:", error);

        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to create workflow version.",
          },
        });
      }
    },
  }),
};
