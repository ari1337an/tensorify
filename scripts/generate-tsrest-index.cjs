/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");

const API_DIR = path.resolve(__dirname, "../src/app/api/v1/_contracts");
const OUTPUT_FILE = path.join(API_DIR, "index.ts");

function getExportKey(filePath) {
  const relPath = path.relative(API_DIR, filePath).replace(/\.ts$/, "");
  const parts = relPath.split(path.sep);
  return parts[parts.length - 1]; // filename without extension
}

function getImportPath(filePath) {
  const rel = path.relative(API_DIR, filePath).replace(/\.ts$/, "");
  return `./${rel.replace(/\\/g, "/")}`;
}

async function generateIndex() {
  const files = await fg(`${API_DIR}/**/*.ts`, {
    ignore: [
      "**/index.ts", // skip index.ts
      `${API_DIR}/*.ts`, // skip top-level .ts files in /api
      "**/*.test.ts",
    ],
  });

  const imports = [];
  const contractEntries = [];
  const actionEntries = [];

  for (const file of files) {
    const key = getExportKey(file);
    const importAliasContract = `${key}Contract`;
    const importAliasAction = `${key}Action`;
    const importPath = getImportPath(file);

    imports.push(
      `import { contract as ${importAliasContract}, action as ${importAliasAction} } from "${importPath}";`
    );
    contractEntries.push(`  ${key}: ${importAliasContract},`);
    actionEntries.push(`  ${key}: ${importAliasAction},`);
  }

  const output = `
import { initContract } from "@ts-rest/core";
import { tsr } from "@ts-rest/serverless/next";
import { JwtPayloadSchema } from "./schema";
import { z } from "zod";

${imports.join("\n")}

const c = initContract();

export const contract = c.router({
${contractEntries.join("\n")}
});

export const appRouter = tsr.routerWithMiddleware(contract)<{
  decodedJwt: z.infer<typeof JwtPayloadSchema>;
}>({
${actionEntries.join("\n")}
});
`;

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`✅ Generated: ${OUTPUT_FILE}`);
}

generateIndex().catch((err) => {
  console.error("❌ Failed to generate ts-rest index:", err);
  process.exit(1);
});
