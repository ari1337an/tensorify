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
import db from "@/server/database/db"; // Import Prisma client

extendZodWithOpenApi(z);

const c = initContract();

const CreateTeamRequest = z.object({
  name: z
    .string()
    .min(2, { message: "Team name must be at least 2 characters." })
    .max(100, { message: "Team name must be less than 100 characters." }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters." })
    .optional(),
  orgId: z.string().uuid({ message: "Invalid organization ID format." }),
});

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/team",
      body: CreateTeamRequest,
      responses: {
        201: Message,
        400: ErrorResponse,
        401: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Team"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Create a new team",
      description:
        "Create a new team within the authenticated user's organization.",
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
      const orgId = body.orgId;

      try {
        await db.team.create({
          data: {
            name: body.name,
            description: body.description,
            orgId: orgId,
          },
        });

        return {
          status: 201,
          body: { message: "Team created successfully." },
        };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // console.error("Failed to create team:", error);
        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to create team.",
          },
        });
      }
    },
  }),
};
