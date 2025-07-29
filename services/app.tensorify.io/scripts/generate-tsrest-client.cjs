/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");

// Directory containing the contract files
const CONTRACTS_DIR = path.resolve(__dirname, "../src/app/api/v1/_contracts");
// Output file for the generated client
const OUTPUT_FILE = path.resolve(
  __dirname,
  "../src/app/api/v1/_client/client.ts"
);
// Relative path from the client file to the contracts directory for imports
const RELATIVE_CONTRACTS_PATH = "../_contracts";

function getContractKey(filePath) {
  const fileName = path.basename(filePath, ".ts");
  return fileName;
}

async function generateClient() {
  const contractFiles = await fg(`${CONTRACTS_DIR}/**/*.ts`, {
    ignore: [
      "**/index.ts",
      `${CONTRACTS_DIR}/index.ts`,
      `${CONTRACTS_DIR}/schema.ts`,
      `${CONTRACTS_DIR}/auth-utils.ts`,
      `${CONTRACTS_DIR}/test-utils.ts`,
      `${CONTRACTS_DIR}/version.json`,
      "**/*.test.ts",
    ],
    absolute: true,
  });

  const contractKeys = new Set();
  for (const file of contractFiles) {
    const key = getContractKey(file);
    // Filter out any problematic keys if necessary, e.g. empty strings or keys that might conflict
    if (
      key &&
      key !== "schema" &&
      key !== "auth-utils" &&
      key !== "test-utils"
    ) {
      contractKeys.add(key);
    }
  }

  const clientFunctionStrings = Array.from(contractKeys)
    .sort() // Sort alphabetically for deterministic output
    .map((key) => {
      // Ensure the key is a valid identifier part
      // This basic check might need to be more robust depending on filenames
      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        console.warn(
          `Skipping potentially invalid key for function name: ${key}`
        );
        return "";
      }
      return `
export async function ${key}(args: Parameters<typeof client.${key}.contract>[0]): Promise<ReturnType<typeof client.${key}.contract>> {
  const dynamicClient = await getClientWithBaseUrl();
  return await dynamicClient.${key}.contract(args);
}
`;
    })
    .join("\n");

  const output = `"use server";

import { initClient } from '@ts-rest/core';
import { contract } from '${RELATIVE_CONTRACTS_PATH}';
import version from '${RELATIVE_CONTRACTS_PATH}/version.json';
import { auth } from '@clerk/nextjs/server';

// Initialize client without baseUrl (or with a default)
const client = initClient(contract, {
  baseUrl: '', // Will override in each server action
  baseHeaders: {},
  credentials: "include",
});

// Function to get baseUrl dynamically
const getBaseUrl = () => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  if (process.env.NODE_ENV === "production") {
    return \`\${protocol}://app.tensorify.io/api/\${version.apiVersion}\`;
  } else {
    const port = process.env.PORT || "3000";
    return \`\${protocol}://localhost:\${port}/api/\${version.apiVersion}\`;
  }
};

// Helper to create a client with dynamic baseUrl
const getClientWithBaseUrl = async () => {
  const {getToken} = await auth();
  const token = await getToken();
  return initClient(contract, {
    baseUrl: getBaseUrl(),
    baseHeaders: {
      authorization: \`Bearer \${token}\`,
    },
    credentials: "include",
  });
};

/**
 * ------------------------------------------------------------------------------------------------
 * HOW TO USE THE CLIENT
 * ------------------------------------------------------------------------------------------------
 * 
 * Import whatever the function you want to call and 
 * they will give out the proper API response in terms of 
 * the type of the response return and the arguments to 
 * pass in are also fully typed as we are using TS-REST.
 * 
 * The functions are server actions and can be called from the client side.
 * 
 * ------------------------------------------------------------------------------------------------
 * EXAMPLES
 * ------------------------------------------------------------------------------------------------
 * 
 * ### Example 1: For GET requests where no body is required:
 * 
 * In client side or server side:
 * 
 * \`\`\`ts
 * // As there is no body required, we pass an empty object. If we don't pass empty object, it will throw an error.
 * const response = await onboardingQuestions({}); 
 * if(response.status === 200){
 *  const questions = response.body; // This is the data that the API returns
 * } else {
 *  const error = response.body; // This is the error that the API returns
 * }
 * \`\`\`
 * 
 * Even if there is error, it is still typed properly.
 * 
 * ### Example 2: For POST requests where body is required:
 * 
 * In client side or server side:
 * 
 * \`\`\`ts
 * const response = await onboardingSetup({
 *  body: {
 *    name: "123",
 *    resourceType: "ORGANIZATION",
 *    resourceId: "123",
 *    permissions: [
 *      {
 *        type: "ALLOW",
 *        permissionId: "123",
 *      },
 *    ],
 *    description: "123",
 *  },
 * });
 * \`\`\`
 * 
 * The response will be a 201 Created response with the data that the API returns.
 * 
 * The body that needs to be send has type:
 * \`\`\`ts
 * { 
 *  name: string; 
 *  resourceType: "ORGANIZATION" | "TEAM" | "PROJECT" | "WORKFLOW"; 
 *  resourceId: string;
 *  permissions: {
 *    type: "ALLOW" | "DENY";
 *    permissionId: string;
 *  }[];
 *  description?: string | undefined;
 * }
 * \`\`\`
 * 
 * \`\`\`ts
 * if(response.status === 201){
 *  const setup = response.body; // This is the data that the API returns
 * } else {
 *  const error = response.body; // This is the error that the API returns
 * }
 * \`\`\`
 * 
 * Even if there is error, it is still typed properly.
 */
${clientFunctionStrings}
`;

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log("✅ Generated client: " + OUTPUT_FILE); // Corrected console.log
}

generateClient().catch((err) => {
  console.error("❌ Failed to generate ts-rest client:", err);
  process.exit(1);
});
