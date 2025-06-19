import {
  initContract,
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { Message, ErrorResponse, JwtPayloadSchema } from "../schema";
import { tsr } from "@ts-rest/serverless/next";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

const c = initContract();

const CreateProjectRequest = z.object({
  name: z
    .string()
    .min(2, { message: "Project name must be at least 2 characters." })
    .max(100, { message: "Project name must be less than 100 characters." }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters." })
    .optional(),
  teamId: z.string().uuid({ message: "Invalid team ID format." }),
});

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/project",
      body: CreateProjectRequest,
      responses: {
        201: Message,
        400: ErrorResponse,
        401: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Project"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Create a new project",
      description: "Create a new project within the specified team.",
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
      const { teamId } = body;

      try {
        // Verify the team exists
        const team = await db.team.findUnique({
          where: { id: teamId },
          include: {
            org: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!team) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: { status: "failed", message: "Team not found" },
          });
        }

        // Create the project
        await db.project.create({
          data: {
            name: body.name,
            description: body.description,
            teamId: teamId,
          },
        });

        return {
          status: 201,
          body: { message: "Project created successfully." },
        };
      } catch (error) {
        console.error("Failed to create project:", error);

        if (error instanceof TsRestResponseError) {
          throw error;
        }

        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to create project.",
          },
        });
      }
    },
  }),
};
