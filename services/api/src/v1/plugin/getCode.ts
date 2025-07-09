import {
  initContract,
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { PluginSlugSchema } from "../schema";

import { S3Client } from "@aws-sdk/client-s3";
import { PluginEngineFactory } from "@tensorify.io/plugin-engine";
import { initServer } from "@ts-rest/express";

const s = initServer();
const c = initContract();

export const contract = c.router({
  // RecursivelyProccessAppRouter
  contract: {
    method: "GET",
    path: "/plugin",
    query: z.object({
      slug: PluginSlugSchema,
    }),
    responses: {
      200: z.object({
        id: z.string(),
        slug: z.string(),
        code: z.string(),
      }),
      400: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
    },
    summary: "Get plugin code by slug",
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
    // Create S3 client using environment variables
    const s3Client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: !!process.env.S3_ENDPOINT, // Required for custom endpoints like MinIO
    });

    // Get bucket name from environment
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new TsRestResponseError(contract.contract, {
        status: 400,
        body: {
          status: "error",
          message:
            "S3_BUCKET_NAME not configured. Set  S3_BUCKET_NAME environment variable.",
        },
      });
    }

    // Create plugin engine factory and engine instance
    const factory = new PluginEngineFactory();
    const engine = factory.createWithS3Client(s3Client, {
      bucketName,
      debug: process.env.NODE_ENV === "development",
    });

    // Get plugin source code
    const pluginCode = await engine.getPluginCode(slug);

    // Clean up engine resources
    await engine.dispose();

    return {
      status: 200,
      body: {
        id: "1",
        slug: slug,
        code: pluginCode,
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
            : "Failed to retrieve plugin code",
      },
    });
  }
};

export const action = {
  contract: s.route(contract.contract, mainFunction),
};
