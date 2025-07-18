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
  CreateWorkflowRequest,
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
      path: "/workflow",
      body: CreateWorkflowRequest,
      responses: {
        201: Message,
        400: ErrorResponse,
        401: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Workflow"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Create a new workflow",
      description: "Create a new workflow within the specified project.",
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
    handler: async ({ body }: ContractRequest): Promise<ContractResponse> => {
      const { projectId } = body;

      try {
        // Verify the project exists
        const project = await db.project.findUnique({
          where: { id: projectId },
          include: {
            team: {
              include: {
                org: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });

        if (!project) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "Project not found" },
          });
        }

        // Create the workflow and its initial version atomically
        await db.$transaction(async (tx) => {
          // 1️⃣ create the workflow
          const workflow = await tx.workflow.create({
            data: {
              name: body.name,
              description: body.description,
              projectId,
            },
          });

          // 2️⃣ create the initial version
          await tx.workflowVersion.create({
            data: {
              summary: "Initial Commit",
              description: body.description,
              version: "1.0.0",
              code: {}, // empty JSON object
              workflowId: workflow.id,
            },
          });
        });

        return {
          status: 201,
          body: { message: "Workflow created successfully." },
        };
      } catch (error) {
        // console.error("Failed to create workflow:", error);

        if (error instanceof TsRestResponseError) {
          throw error;
        }

        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to create workflow.",
          },
        });
      }
    },
  }),
};
