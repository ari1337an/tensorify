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
  AccountUpdate,
  ErrorResponse,
  JwtPayloadSchema,
  Message,
} from "../schema";
import { secureByAuthentication } from "../auth-utils";
import db from "@/server/database/db";
import { createClerkClient } from "@clerk/backend";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "PATCH",
      path: "/account",
      body: AccountUpdate,
      responses: {
        200: Message,
        400: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Account"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Partially update account & retain sessions and revoke others",
      description:
        "Update `firstName`, `lastName`. **Email cannot be changed.** To revoke other sessions, supply `sessionId`.",
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
      { body }: ContractRequest,
      { request }
    ): Promise<ContractResponse> => {
      // Get the user's ID from the decoded JWT
      const userId = request.decodedJwt.id;

      // Check if user exists
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

      // Validate the request body
      const parsedBody = AccountUpdate.safeParse(body);
      if (!parsedBody.success) {
        throw new TsRestResponseError(contract, {
          status: 400,
          body: {
            status: "failed",
            message: "Invalid request body",
          },
        });
      }

      const { firstName, lastName, sessionId } = parsedBody.data;

      try {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
        });

        // Update user in database if any profile fields are provided
        if (firstName !== undefined || lastName !== undefined) {
          await db.user.update({
            where: { id: userId },
            data: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
            },
          });

          await clerkClient.users.updateUser(userId, {
            ...(firstName !== undefined && { firstName }),
            ...(lastName !== undefined && { lastName }),
          });
        }

        // Handle session management if sessionId is provided
        if (sessionId) {
          // Get all active sessions for the user
          const sessionsResponse = await clerkClient.sessions.getSessionList({
            userId: userId, // Assume userId is derived from the JWT or request context
            status: "active",
          });

          // Handle case where session fetch fails
          if (!sessionsResponse.data) {
            throw new TsRestResponseError(contract, {
              status: 500,
              body: {
                status: "failed",
                message: "Failed to fetch sessions.",
              },
            });
          }

          const activeSessions = sessionsResponse.data;

          // Validate sessionIds if provided
          if (sessionId.length > 0) {
            const activeSessionIds = activeSessions.map(
              (session) => session.id
            );
            const allSessionsExist = sessionId.every((id) =>
              activeSessionIds.includes(id)
            );
            if (!allSessionsExist) {
              throw new TsRestResponseError(contract, {
                status: 404,
                body: {
                  status: "failed",
                  message: "Session not found.",
                },
              });
            }
          }

          // Determine sessions to revoke
          const sessionsToRevoke =
            sessionId.length === 0
              ? activeSessions // Revoke all if sessionId is empty
              : activeSessions.filter(
                  (session) => !sessionId.includes(session.id)
                ); // Revoke sessions not in sessionId

          // Revoke sessions in parallel
          await Promise.all(
            sessionsToRevoke.map(async (session) => {
              try {
                await clerkClient.sessions.revokeSession(session.id);
              } catch (error) {
                console.error(`Failed to revoke session ${session.id}:`, error);
                // Continue with other sessions even if one fails
              }
            })
          );
        }

        return {
          status: 200,
          body: {
            message: "Account updated successfully.",
          },
        };
      } catch (error) {
        console.error(error);
        if (error instanceof TsRestResponseError) {
          throw error;
        }

        throw new TsRestResponseError(contract, {
          status: 500,
          body: {
            status: "failed",
            message: "Failed to update account.",
          },
        });
      }
    },
  }),
};
