import {
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import {
  AccountInfo,
  ErrorResponse,
  JwtPayloadSchema,
  USERID,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";
import { createClerkClient } from "@clerk/backend";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "GET",
      path: "/account/:userId",
      pathParams: z.object({
        userId: USERID.openapi({
          description: "The user's ID",
        }),
      }),
      responses: {
        200: AccountInfo,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Account"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Retrieve a user's account information",
      description: "Retrieve a user's account information",
    },
  },
  {
    strictStatusCodes: true,
  }
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
      { params: { userId } }: ContractRequest,
      { request }
    ): Promise<ContractResponse> => {
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new TsRestResponseError(contract, {
          status: 404,
          body: {
            status: "failed",
            message: "User not found.",
          },
        });
      }

      if (request.decodedJwt.id === userId) {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
        });

        const response = await clerkClient.sessions.getSessionList({
          userId: userId,
          status: "active",
        });

        if (!response.data) {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: "Failed to fetch sessions.",
            },
          });
        }

        const sessions = response.data.map((session) => ({
          sessionId: session.id || "Unknown",
          deviceType: session.latestActivity?.deviceType || "Unknown",
          browserName: session.latestActivity?.browserName || "Unknown",
          browserVersion: session.latestActivity?.browserVersion || "Unknown",
          ipAddress: session.latestActivity?.ipAddress || "Unknown",
          location:
            session.latestActivity?.city +
              ", " +
              session.latestActivity?.country || "Unknown",
          lastActiveAt: session.lastActiveAt.toString() || "Unknown",
        }));

        const parsedSessions = AccountInfo.shape.sessions.safeParse(sessions);
        if (!parsedSessions.success) {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: "Failed to parse sessions.",
            },
          });
        }

        const body = {
          userId: user.id,
          portraitUrl: user.imageUrl,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          sessions: parsedSessions.data,
        };

        const parsedBody = AccountInfo.safeParse(body);
        if (!parsedBody.success) {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: "Failed to parse body.",
            },
          });
        }

        return {
          status: 200,
          body,
        };
      } else {
        const body = {
          userId: user.id,
          portraitUrl: user.imageUrl,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          sessions: [],
        };

        const parsedBody = AccountInfo.safeParse(body);
        if (!parsedBody.success) {
          throw new TsRestResponseError(contract, {
            status: 500,
            body: {
              status: "failed",
              message: "Failed to parse body.",
            },
          });
        }

        return {
          status: 200,
          body,
        };
      }
    },
  }),
};
