import {
  initContract,
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { PluginSlugSchema } from "../schema";

import { createPluginEngine } from "@tensorify.io/plugin-engine";
import { initServer } from "@ts-rest/express";

import { v4 as uuidv4 } from "uuid";

const s = initServer();
const c = initContract();

export const contract = c.router({
  // RecursivelyProccessAppRouter
  contract: {
    method: "GET",
    path: "/plugin/getManifest",
    query: z.object({
      slug: PluginSlugSchema,
    }),
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.record(z.any()),
        meta: z.object({
          request_id: z.string().uuid(),
          timestamp: z.string().datetime(),
        }),
      }),
      400: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
    },
    summary: "Get plugin manifest by slug",
    strictStatusCodes: true, // MUST as the upstream contracts require it
  },
});

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const mainFunction = async (
  request: ContractRequest
): Promise<ContractResponse> => {
  const slug = request.query.slug;
  try {
    // Get bucket name from environment
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new TsRestResponseError(contract.contract, {
        status: 400,
        body: {
          status: "error",
          message:
            "S3_BUCKET_NAME not configured. Set S3_BUCKET_NAME environment variable.",
        },
      });
    }

    // Handle S3 configuration from environment variables
    const s3Config = {
      region: process.env.S3_REGION || process.env.AWS_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      credentials:
        process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
          ? {
              accessKeyId:
                process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID!,
              secretAccessKey:
                process.env.S3_SECRET_ACCESS_KEY ||
                process.env.AWS_SECRET_ACCESS_KEY!,
              sessionToken:
                process.env.S3_SESSION_TOKEN || process.env.AWS_SESSION_TOKEN,
            }
          : undefined,
      forcePathStyle: true,
    };

    // Create plugin engine using the new clean API
    const engine = createPluginEngine(s3Config, bucketName, {
      debug: process.env.NODE_ENV === "development",
    });

    const manifest = await engine.getPluginManifest(slug);

    // Clean up engine resources
    await engine.dispose();

    return {
      status: 200,
      body: {
        success: true,
        data: manifest,
        meta: {
          request_id: uuidv4(),
          timestamp: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    if (error instanceof TsRestResponseError) {
      throw error;
    }
    // Return error response
    throw new TsRestResponseError(contract, {
      status: 400,
      body: {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve plugin manifest",
      },
    });
  }
};

export const action = {
  contract: s.route(contract.contract, mainFunction),
};
