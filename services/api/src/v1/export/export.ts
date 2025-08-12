import {
  initContract,
  ServerInferRequest,
  ServerInferResponses,
  TsRestResponseError,
} from "@ts-rest/core";
import { z } from "zod";
import { initServer } from "@ts-rest/express";
import { generateCode } from "@tensorify.io/transpiler";
import { PluginEngine, PluginNotFoundError } from "@tensorify.io/plugin-engine";
import path from "path";
import fs from "fs";

const s = initServer();
const c = initContract();

// Define the Node and Edge schemas
const NodeDataSchema = z
  .object({
    label: z.string(),
    visualConfig: z.any().optional(),
  })
  .passthrough();

const NodeSchema = z
  .object({
    id: z.string(),
    type: z.string().optional(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    data: NodeDataSchema,
    route: z.string(),
    version: z.string(),
  })
  .passthrough();

const EdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().nullable().optional(),
    targetHandle: z.string().nullable().optional(),
  })
  .passthrough();

export const contract = c.router({
  contract: {
    method: "POST",
    path: "/export",
    body: z.object({
      nodes: z.array(NodeSchema),
      edges: z.array(EdgeSchema),
    }),
    responses: {
      200: z.object({
        artifacts: z.record(z.string()), // endNodeId -> code
        paths: z.record(z.array(z.string())).optional(), // endNodeId -> path of nodeIds
      }),
      400: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
      500: z.object({
        status: z.literal("error"),
        message: z.string(),
      }),
    },
    summary: "Export workflow to code artifacts",
    strictStatusCodes: true,
  },
});

type ContractRequest = ServerInferRequest<typeof contract.contract>;
type ContractResponse = ServerInferResponses<typeof contract.contract>;

export const mainFunction = async (
  request: ContractRequest
): Promise<ContractResponse> => {
  try {
    const { nodes, edges } = request.body;

    // Validate that we have nodes and edges
    if (!nodes || nodes.length === 0) {
      throw new TsRestResponseError(contract.contract, {
        status: 400,
        body: {
          status: "error",
          message: "No nodes provided in the workflow",
        },
      });
    }

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

    // For export, we need the transpiler to use a plugin engine. The generateCode helper
    // constructs its own engine from s3Config/bucketName. We'll pass S3 config as usual,
    // but in development we want plugins to resolve from offline first. The plugin engine
    // used by the transpiler will try S3. To enforce offline-first, we duplicate the
    // path execution here using a local engine when available and only fall back to S3
    // if not found. The simplest approach: if offlineDir exists, we mimic S3 by setting
    // bucketName to offlineDir and using a local engine for execution paths.

    // Compute S3 config (fallback or prod-only)
    const bucketNameEnv = process.env.S3_BUCKET_NAME;
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

    let result;
    if (offlineDir && process.env.NODE_ENV === "development") {
      // Use offline directory for plugin execution via transpiler by pointing bucketName to offlineDir
      result = await generateCode({
        nodes,
        edges,
        s3Config, // still required, but bucketName is the offlineDir
        bucketName: offlineDir,
        debug: true,
      });
    } else {
      // Production or no offline dir: require S3 configuration
      if (!bucketNameEnv) {
        throw new TsRestResponseError(contract.contract, {
          status: 400,
          body: {
            status: "error",
            message:
              "S3_BUCKET_NAME not configured. Set S3_BUCKET_NAME environment variable.",
          },
        });
      }
      result = await generateCode({
        nodes,
        edges,
        s3Config,
        bucketName: bucketNameEnv,
        debug: process.env.NODE_ENV === "development",
      });
    }

    // Return the artifacts
    return {
      status: 200,
      body: {
        artifacts: result.artifacts,
        paths: result.paths,
      },
    };
  } catch (error) {
    if (error instanceof TsRestResponseError) {
      throw error;
    }

    console.error("Export failed:", error);

    // Return error response
    throw new TsRestResponseError(contract.contract, {
      status: 500,
      body: {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to export workflow",
      },
    });
  }
};

export const action = {
  contract: s.route(contract.contract, mainFunction),
};
