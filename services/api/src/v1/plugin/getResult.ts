import {
  initContract,
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { PluginSlugSchema } from "../schema";

import {
  createPluginEngine,
  PluginEngine,
  PluginNotFoundError,
} from "@tensorify.io/plugin-engine";
import path from "path";
import fs from "fs";
import { initServer } from "@ts-rest/express";

const s = initServer();
const c = initContract();

export const contract = c.router({
  // RecursivelyProccessAppRouter
  contract: {
    method: "POST",
    path: "/plugin/getResult",
    query: z.object({
      slug: PluginSlugSchema,
    }),
    body: z.record(z.any()), // Allow any JSON object as payload
    responses: {
      200: z.object({
        id: z.string(),
        result: z.string(),
      }),
      400: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
    },
    summary: "Get plugin result by slug",
    strictStatusCodes: true, // MUST as the upstream contracts require it
  },
});

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const mainFunction = async (
  request: ContractRequest
): Promise<ContractResponse> => {
  const slug = request.query.slug;
  const payload = request.body;
  try {
    // Helper to resolve offline base dir in development
    const resolveOfflineDir = (): string | null => {
      const fromEnv = process.env.OFFLINE_PLUGINS_DIR;
      if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
      if (process.env.NODE_ENV !== "development") return null;
      let current = path.resolve(__dirname, "../../../../");
      for (let i = 0; i < 5; i++) {
        const probe = path.join(current, "offline-plugins");
        if (fs.existsSync(probe) && fs.statSync(probe).isDirectory()) {
          return probe;
        }
        const parent = path.dirname(current);
        if (parent === current) break;
        current = parent;
      }
      return null;
    };

    const offlineDir = resolveOfflineDir();

    // Try offline first in development
    if (offlineDir) {
      const offlineEngine = new PluginEngine({
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        storageService:
          new (require("@tensorify.io/plugin-engine").LocalFileStorageService)(),
        bucketName: offlineDir,
        debug: process.env.NODE_ENV === "development",
      });
      try {
        const resultOffline = await offlineEngine.getExecutionResult(
          slug,
          payload,
          "TensorifyPlugin"
        );
        await offlineEngine.dispose();
        return {
          status: 200,
          body: {
            id: "1",
            result: resultOffline.code,
          },
        };
      } catch (e) {
        await offlineEngine.dispose();
        if (!(e instanceof PluginNotFoundError)) {
          throw e;
        }
      }
    }

    // S3 fallback
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
      forcePathStyle: !!process.env.S3_ENDPOINT,
    };

    const engine = createPluginEngine(s3Config, bucketName, {
      debug: process.env.NODE_ENV === "development",
    });

    const result = await engine.getExecutionResult(
      slug,
      payload,
      "TensorifyPlugin"
    );
    await engine.dispose();

    return {
      status: 200,
      body: {
        id: "1",
        result: result.code,
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
