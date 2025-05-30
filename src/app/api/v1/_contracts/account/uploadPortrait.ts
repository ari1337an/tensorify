import { ServerInferResponses, TsRestResponseError } from "@ts-rest/core";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { tsr } from "@ts-rest/serverless/next";
import { ErrorResponse, JwtPayloadSchema } from "../schema";
import { secureByAuthentication } from "../auth-utils";
import { createClerkClient } from "@clerk/nextjs/server";
import db from "@/server/database/db";

extendZodWithOpenApi(z);

export const contract = c.router(
  {
    contract: {
      method: "POST",
      path: "/account/portrait",
      contentType: "multipart/form-data",
      body: c.type<{ portrait: File }>(),
      responses: {
        200: z.object({
          imageUrl: z.string(),
        }),
        400: ErrorResponse,
        404: ErrorResponse,
      },
      metadata: {
        openApiTags: ["Account"],
        openApiSecurity: [{ bearerAuth: [] }],
      },
      summary: "Upload a portrait image to the user's account.",
      description: "Upload a portrait image to the user's account.",
    },
  },
  {
    strictStatusCodes: true,
  }
);

type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const action = {
  contract: tsr.routeWithMiddleware(contract.contract)<
    { decodedJwt: z.infer<typeof JwtPayloadSchema> },
    Record<string, never>
  >({
    middleware: [secureByAuthentication],
    handler: async (_, { request }): Promise<ContractResponse> => {
      try {
        // Check if user exists in database
        const user = await db.user.findUnique({
          where: { id: request.decodedJwt.id },
        });
        if (!user) {
          throw new TsRestResponseError(contract, {
            status: 404,
            body: {
              status: "failed",
              message: "User not found in database",
            },
          });
        }

        // Parse the multipart/form-data using Next.js built-in method
        let formData: FormData;
        try {
          formData = await request.formData();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message: "Invalid form data.",
            },
          });
        }

        const portraitFile = formData.get("portrait") as File;

        if (
          !formData.has("portrait") ||
          portraitFile == null ||
          (portraitFile instanceof File && portraitFile.size === 0)
        ) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message: "No portrait file provided",
            },
          });
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(portraitFile.type)) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message:
                "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
            },
          });
        }

        if (portraitFile.size > maxSize) {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message: "File too large. Maximum size is 10MB.",
            },
          });
        }

        const userId = request.decodedJwt.id;

        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
        });

        const response = await clerkClient.users.updateUserProfileImage(
          userId,
          {
            file: portraitFile,
          }
        );

        const imageUrl = response.imageUrl;

        await db.user.update({
          where: { id: userId },
          data: {
            imageUrl: imageUrl,
          },
        });

        return {
          status: 200,
          body: {
            imageUrl: imageUrl,
          },
        };
      } catch (error) {
        if (error instanceof TsRestResponseError) {
          throw error;
        } else {
          throw new TsRestResponseError(contract, {
            status: 400,
            body: {
              status: "failed",
              message: "Failed to upload portrait. Please try again.",
            },
          });
        }
      }
    },
  }),
};
