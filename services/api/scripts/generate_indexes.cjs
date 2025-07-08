const fs = require("fs");
const path = require("path");

/**
 * Script to generate index.ts files for API version directories
 * Usage: node scripts/generate_indexes.cjs
 */

const SRC_DIR = path.join(__dirname, "..", "src");

// Helper function to check if a string is a version directory (v1, v2, etc.)
function isVersionDirectory(dirName) {
  return /^v\d+$/.test(dirName);
}

// Helper function to convert a path to a camelCase identifier
function pathToCamelCase(filePath) {
  // Remove file extension and split by / and _
  const parts = filePath
    .replace(/\.ts$/, "")
    .split(/[\/\_\-]/)
    .filter((part) => part.length > 0);

  // Convert to camelCase: first part lowercase, rest capitalized
  return parts
    .map((part, index) => {
      // Split camelCase words (e.g., getUser -> get, User)
      const words = part.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");

      return words
        .map((word, wordIndex) => {
          if (index === 0 && wordIndex === 0) {
            return word.toLowerCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join("");
    })
    .join("");
}

// Helper function to recursively find TypeScript files that export contract and action
function findContractFiles(dir, basePath = "") {
  const contractFiles = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

      if (item.isDirectory()) {
        // Recursively search subdirectories
        contractFiles.push(...findContractFiles(itemPath, relativePath));
      } else if (
        item.isFile() &&
        item.name.endsWith(".ts") &&
        item.name !== "index.ts"
      ) {
        // Check if the TypeScript file exports contract and action
        try {
          const content = fs.readFileSync(itemPath, "utf8");
          const hasContract = /export\s+const\s+contract\s*=/.test(content);
          const hasAction = /export\s+const\s+action\s*=/.test(content);

          if (hasContract && hasAction) {
            const importPath = "./" + relativePath.replace(/\.ts$/, "");
            const uniqueName = pathToCamelCase(relativePath);

            contractFiles.push({
              name: uniqueName,
              importPath,
              contractName: `${uniqueName}Contract`,
              actionName: `${uniqueName}Action`,
            });
          }
        } catch (error) {
          console.warn(
            `Warning: Could not read file ${itemPath}:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }

  return contractFiles;
}

// Function to generate loader.ts content
function generateLoaderContent(versionDirs) {
  if (versionDirs.length === 0) {
    return `import { initServer } from "@ts-rest/express";
import { initContract } from "@ts-rest/core";

const s = initServer();
const c = initContract();

// No version directories found
export const contracts = c.router(
  {},
  {
    pathPrefix: "/api",
    strictStatusCodes: true,
  }
);

export const actions = s.router(contracts, {});

export const openapi = [];
`;
  }

  // Generate imports for each version
  const imports = versionDirs
    .map(
      (version) =>
        `import { contracts as ${version}Contracts, actions as ${version}Actions, openApiDocument as ${version}OpenApiDocument } from "./${version}";`
    )
    .join("\n");

  // Generate contract router object entries
  const contractEntries = versionDirs
    .map((version) => `    ${version}: ${version}Contracts,`)
    .join("\n");

  // Generate actions router object entries
  const actionEntries = versionDirs
    .map((version) => `  ${version}: ${version}Actions,`)
    .join("\n");

  // Generate openapi array entries
  const openapiEntries = versionDirs
    .map(
      (version) => `  { json: ${version}OpenApiDocument, name: "${version}" },`
    )
    .join("\n");

  return `import { initServer } from "@ts-rest/express";
import { initContract } from "@ts-rest/core";
${imports}

const s = initServer();
const c = initContract();

// Create the main contract router with proper versioning
export const contracts = c.router(
  {
${contractEntries}
  },
  {
    pathPrefix: "/api",
    strictStatusCodes: true,
  }
);

// Create the actions router that matches the contract structure
export const actions = s.router(contracts, {
${actionEntries}
});

// Export openapi documents array
export const openapi = [
${openapiEntries}
];
`;
}

// Function to generate index.ts content
function generateIndexContent(versionNum, contractFiles) {
  if (contractFiles.length === 0) {
    return `import { initContract } from "@ts-rest/core";
import { generateOpenApi } from '@ts-rest/open-api';

const c = initContract();

export const contracts = c.router(
  {},
  {
    pathPrefix: "/${versionNum}",
    strictStatusCodes: true,
  }
);

export const actions = {};

export const openApiDocument = generateOpenApi(
  contracts,
  {
    info: {
      title: 'API Service',
      version: '${versionNum}.0.0',
    },
  }
);
`;
  }

  // Generate imports
  const imports = contractFiles
    .map(
      (file) =>
        `import {\n  contract as ${file.contractName},\n  action as ${file.actionName},\n} from "${file.importPath}";`
    )
    .join("\n");

  // Generate contract router object
  const contractEntries = contractFiles
    .map((file) => `    ${file.name}: ${file.contractName},`)
    .join("\n");

  // Generate actions object
  const actionEntries = contractFiles
    .map((file) => `  ${file.name}: ${file.actionName},`)
    .join("\n");

  return `import { initContract } from "@ts-rest/core";
import { generateOpenApi } from '@ts-rest/open-api';
${imports}

const c = initContract();

export const contracts = c.router(
  {
${contractEntries}
  },
  {
    pathPrefix: "/${versionNum}",
    strictStatusCodes: true,
  }
);

export const actions = {
${actionEntries}
};

export const openApiDocument = generateOpenApi(
  contracts,
  {
    info: {
      title: 'API Service',
      version: '${versionNum}.0.0',
    },
  }
);
`;
}

// Main function
function generateIndexes() {
  console.log("🔍 Scanning for version directories...");

  try {
    const items = fs.readdirSync(SRC_DIR, { withFileTypes: true });
    const versionDirs = items
      .filter((item) => item.isDirectory() && isVersionDirectory(item.name))
      .map((item) => item.name)
      .sort(); // Sort to ensure consistent order (v1, v2, v3, etc.)

    if (versionDirs.length === 0) {
      console.log(
        "⚠️  No version directories found (looking for v1, v2, v3, etc.)"
      );

      // Still generate an empty loader.ts file
      console.log("\n🔧 Generating empty loader.ts...");
      const loaderPath = path.join(SRC_DIR, "loader.ts");
      const loaderContent = generateLoaderContent([]);
      fs.writeFileSync(loaderPath, loaderContent, "utf8");
      console.log("   ✅ Generated loader.ts (empty)");
      return;
    }

    console.log(`📁 Found version directories: ${versionDirs.join(", ")}`);

    // Generate loader.ts file
    console.log("\n🔧 Generating loader.ts...");
    const loaderPath = path.join(SRC_DIR, "loader.ts");
    const loaderContent = generateLoaderContent(versionDirs);
    fs.writeFileSync(loaderPath, loaderContent, "utf8");
    console.log("   ✅ Generated loader.ts");

    for (const versionDir of versionDirs) {
      console.log(`\n🔧 Processing ${versionDir}...`);

      const versionPath = path.join(SRC_DIR, versionDir);
      const indexPath = path.join(versionPath, "index.ts");

      // Find contract files in this version directory
      const contractFiles = findContractFiles(versionPath);

      if (contractFiles.length > 0) {
        console.log(`   Found ${contractFiles.length} contract file(s):`);
        contractFiles.forEach((file) => {
          console.log(`   - ${file.name} (${file.importPath})`);
        });
      } else {
        console.log("   No contract files found");
      }

      // Generate index.ts content
      const indexContent = generateIndexContent(versionDir, contractFiles);

      // Write the file
      fs.writeFileSync(indexPath, indexContent, "utf8");
      console.log(`   ✅ Generated ${versionDir}/index.ts`);
    }

    console.log("\n🎉 Index generation and loader creation completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateIndexes();
}

module.exports = { generateIndexes };
