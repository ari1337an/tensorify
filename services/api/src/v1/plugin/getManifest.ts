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
import {
  normalizeUiManifest,
  UIManifestSchema,
} from "@tensorify.io/sdk/contracts";
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
    // Helper to resolve offline base dir in development
    const resolveOfflineDir = (): string | null => {
      const fromEnv = process.env.OFFLINE_PLUGINS_DIR;
      if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
      if (process.env.NODE_ENV !== "development") return null;
      // Walk up from current file to find repo root 'offline-plugins'
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
        const manifestRawOffline = await offlineEngine.getPluginManifest(slug);
        await offlineEngine.dispose();
        // Ensure frontendConfigs exists for UI schema
        const mo: any = manifestRawOffline || {};
        if (!mo.frontendConfigs) {
          mo.frontendConfigs = {
            id: mo.name?.split("/")[1] || mo.name || slug,
            name: mo.name?.split("/")[1] || mo.name || slug,
            category:
              mo.pluginType ||
              (mo.tensorify && mo.tensorify.pluginType) ||
              "custom",
            nodeType:
              mo.pluginType ||
              (mo.tensorify && mo.tensorify.pluginType) ||
              "custom",
            visual: mo.visual,
            inputHandles: mo.inputHandles || [],
            outputHandles: mo.outputHandles || [],
            settingsFields: mo.settingsFields || [],
            settingsGroups: mo.settingsGroups || [],
          };
        }
        const manifestOffline = normalizeUiManifest(mo);
        return {
          status: 200,
          body: {
            success: true,
            data: UIManifestSchema.parse(manifestOffline),
            meta: {
              request_id: uuidv4(),
              timestamp: new Date().toISOString(),
            },
          },
        };
      } catch (e) {
        await offlineEngine.dispose();
        // Fallback to S3 only if plugin not found; otherwise bubble error
        if (!(e instanceof PluginNotFoundError)) {
          throw e;
        }
        // continue to S3 fallback below
      }
    }

    // S3 fallback (works in both dev and prod)
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
      forcePathStyle: true,
    };

    const engine = createPluginEngine(s3Config, bucketName, {
      debug: process.env.NODE_ENV === "development",
    });

    const manifestRaw = await engine.getPluginManifest(slug);
    // Normalize and also map flat fields to frontendConfigs if necessary
    const m: any = manifestRaw || {};
    if (!m.frontendConfigs) {
      m.frontendConfigs = {
        id: m.name?.split("/")[1] || m.name || slug,
        name: m.name?.split("/")[1] || m.name || slug,
        category:
          m.pluginType || (m.tensorify && m.tensorify.pluginType) || "custom",
        nodeType:
          m.pluginType || (m.tensorify && m.tensorify.pluginType) || "custom",
        visual: m.visual,
        inputHandles: m.inputHandles || [],
        outputHandles: m.outputHandles || [],
        settingsFields: m.settingsFields || [],
        settingsGroups: m.settingsGroups || [],
      };
    }
    const manifest = normalizeUiManifest(m);

    // Clean up engine resources
    await engine.dispose();

    return {
      status: 200,
      body: {
        success: true,
        data: UIManifestSchema.parse(manifest),
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
