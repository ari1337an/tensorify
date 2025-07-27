/**
 * Plugin Utility Functions
 * Helper functions for manifest generation and plugin system utilities
 */

import * as fs from "fs";
import * as path from "path";
import {
  FrontendPluginManifest,
  PackageJsonInfo,
  IPluginDefinition,
  PluginSettings,
  SettingsField,
  PluginValidationResult,
} from "../types/plugin.types";
import { TensorifyPlugin } from "../base/TensorifyPlugin";

/**
 * Generate a complete frontend manifest from a plugin instance and package.json
 */
export function generatePluginManifest(
  plugin: TensorifyPlugin,
  packageJsonPath: string,
  entrypointClassName: string
): FrontendPluginManifest {
  // Read and parse package.json
  const packageInfo = readPackageJson(packageJsonPath);

  // Generate manifest using the plugin
  const manifest = plugin.generateManifest(packageInfo, entrypointClassName);

  // Validate the generated manifest
  const validation = validateManifest(manifest);
  if (!validation.isValid) {
    throw new Error(
      `Generated manifest is invalid:\n${validation.errors.join("\n")}`
    );
  }

  return manifest;
}

/**
 * Read and parse package.json file
 */
export function readPackageJson(packageJsonPath: string): PackageJsonInfo {
  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    return {
      name: packageJson.name || "unknown-plugin",
      version: packageJson.version || "1.0.0",
      description: packageJson.description,
      author: packageJson.author,
      main: packageJson.main,
      keywords: packageJson.keywords || [],
      dependencies: packageJson.dependencies || {},
      peerDependencies: packageJson.peerDependencies || {},
    };
  } catch (error) {
    throw new Error(
      `Failed to read package.json from ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Write manifest.json file to disk
 */
export function writeManifestFile(
  manifest: FrontendPluginManifest,
  outputPath: string
): void {
  try {
    const manifestJson = JSON.stringify(manifest, null, 2);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, manifestJson, "utf8");
  } catch (error) {
    throw new Error(
      `Failed to write manifest to ${outputPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Complete manifest generation workflow
 */
export function buildPluginManifest(
  plugin: TensorifyPlugin,
  packageJsonPath: string,
  entrypointClassName: string,
  outputPath: string
): FrontendPluginManifest {
  // Generate the manifest
  const manifest = generatePluginManifest(
    plugin,
    packageJsonPath,
    entrypointClassName
  );

  // Write to file
  writeManifestFile(manifest, outputPath);

  console.log(`✅ Generated manifest.json at ${outputPath}`);
  console.log(`📦 Plugin: ${manifest.name} v${manifest.version}`);
  console.log(`🎯 Entrypoint: ${manifest.entrypointClassName}`);
  console.log(`🏷️  Category: ${manifest.frontendConfigs.category}`);
  console.log(
    `🔧 Handles: ${manifest.frontendConfigs.inputHandles.length} input, ${manifest.frontendConfigs.outputHandles.length} output`
  );
  console.log(
    `⚙️  Settings: ${manifest.frontendConfigs.settingsFields.length} fields`
  );

  return manifest;
}

/**
 * Validate a manifest (wrapper for validation functions)
 */
function validateManifest(
  manifest: FrontendPluginManifest
): PluginValidationResult {
  // Import validation function dynamically to avoid circular dependencies
  const {
    validateFrontendManifest,
  } = require("../validation/plugin.validation");
  return validateFrontendManifest(manifest);
}

/**
 * Create default settings values from settings field definitions
 */
export function createDefaultSettings(
  settingsFields: SettingsField[]
): PluginSettings {
  const defaultSettings: PluginSettings = {};

  for (const field of settingsFields) {
    if (field.defaultValue !== undefined) {
      defaultSettings[field.key] = field.defaultValue;
    } else {
      // Provide sensible defaults based on data type
      switch (field.dataType) {
        case "string":
          defaultSettings[field.key] = "";
          break;
        case "number":
          defaultSettings[field.key] = 0;
          break;
        case "boolean":
          defaultSettings[field.key] = false;
          break;
        case "array":
          defaultSettings[field.key] = [];
          break;
        case "object":
          defaultSettings[field.key] = {};
          break;
      }
    }
  }

  return defaultSettings;
}

/**
 * Merge user settings with default settings
 */
export function mergeSettings(
  userSettings: PluginSettings,
  settingsFields: SettingsField[]
): PluginSettings {
  const defaultSettings = createDefaultSettings(settingsFields);

  // Start with defaults and override with user values
  const mergedSettings = { ...defaultSettings };

  for (const [key, value] of Object.entries(userSettings)) {
    // Only include settings that are defined in the fields
    const field = settingsFields.find((f) => f.key === key);
    if (field) {
      mergedSettings[key] = value;
    }
  }

  return mergedSettings;
}

/**
 * Generate dynamic label with settings values
 */
export function generateDynamicLabel(
  template: string | undefined,
  settings: PluginSettings
): string {
  if (!template) {
    return "";
  }

  let label = template;

  // Replace {placeholder} patterns with actual values
  const placeholderRegex = /\{([^}]+)\}/g;
  label = label.replace(placeholderRegex, (match, key) => {
    const value = settings[key];

    // Handle different value types
    if (value === undefined || value === null) {
      return match; // Keep placeholder if no value
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.length > 0 ? `${value.length} items` : "empty";
      }
      return JSON.stringify(value);
    }

    return String(value);
  });

  return label;
}

/**
 * Extract plugin metadata for debugging/logging
 */
export function getPluginMetadata(plugin: TensorifyPlugin): {
  id: string;
  name: string;
  version: string;
  category: string;
  handleCounts: { input: number; output: number };
  settingsCount: number;
  hasIcons: boolean;
  hasDynamicLabel: boolean;
} {
  const definition = plugin.getDefinition();

  return {
    id: definition.id,
    name: definition.name,
    version: definition.version,
    category: definition.category,
    handleCounts: {
      input: definition.inputHandles.length,
      output: definition.outputHandles.length,
    },
    settingsCount: definition.settingsFields.length,
    hasIcons: !!(
      definition.visual.primaryIcon ||
      definition.visual.secondaryIcons.length > 0
    ),
    hasDynamicLabel: !!plugin.getDynamicLabelTemplate(),
  };
}

/**
 * Convert plugin definition to a summary for logging/debugging
 */
export function createPluginSummary(plugin: TensorifyPlugin): string {
  const metadata = getPluginMetadata(plugin);

  return `
🔌 Plugin Summary
  ID: ${metadata.id}
  Name: ${metadata.name}
  Version: ${metadata.version}
  Category: ${metadata.category}
  
📊 Configuration
  Input Handles: ${metadata.handleCounts.input}
  Output Handles: ${metadata.handleCounts.output}
  Settings Fields: ${metadata.settingsCount}
  Has Icons: ${metadata.hasIcons ? "✅" : "❌"}
  Dynamic Label: ${metadata.hasDynamicLabel ? "✅" : "❌"}
  `;
}

/**
 * Validate plugin settings and return user-friendly error messages
 */
export function validateSettingsWithFeedback(
  plugin: TensorifyPlugin,
  settings: PluginSettings
): { isValid: boolean; message: string; details?: string[] } {
  try {
    plugin.validateSettings(settings);
    return {
      isValid: true,
      message: "Settings are valid",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Parse multi-line error messages
    const lines = errorMessage.split("\n");
    const mainMessage = lines[0] || "Settings validation failed";
    const details = lines.slice(1).filter((line) => line.trim() !== "");

    return {
      isValid: false,
      message: mainMessage,
      details: details.length > 0 ? details : undefined,
    };
  }
}

/**
 * Auto-detect entrypoint class name from TypeScript files
 */
export function autoDetectEntrypointClassName(
  sourceDir: string
): string | null {
  try {
    const files = fs.readdirSync(sourceDir, { recursive: true });

    for (const file of files) {
      if (
        typeof file === "string" &&
        file.endsWith(".ts") &&
        !file.endsWith(".d.ts")
      ) {
        const filePath = path.join(sourceDir, file);
        const content = fs.readFileSync(filePath, "utf8");

        // Look for class that extends TensorifyPlugin
        const classMatch = content.match(
          /export\s+(?:default\s+)?class\s+(\w+)\s+extends\s+TensorifyPlugin/
        );
        if (classMatch) {
          return classMatch[1];
        }
      }
    }

    return null;
  } catch (error) {
    console.warn(
      `Failed to auto-detect entrypoint class name: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Generate a build script for plugin development
 */
export function generateBuildScript(
  pluginInstance: TensorifyPlugin,
  options: {
    packageJsonPath?: string;
    sourceDir?: string;
    outputDir?: string;
    entrypointClassName?: string;
  } = {}
): string {
  const packageJsonPath = options.packageJsonPath || "./package.json";
  const sourceDir = options.sourceDir || "./src";
  const outputDir = options.outputDir || "./dist";
  const entrypointClassName =
    options.entrypointClassName ||
    autoDetectEntrypointClassName(sourceDir) ||
    "MyPlugin";

  return `#!/usr/bin/env node
/**
 * Generated build script for Tensorify plugin
 * This script generates the manifest.json file for your plugin
 */

const { buildPluginManifest } = require('@tensorify.io/sdk');
const { ${entrypointClassName} } = require('${outputDir}/index.js');
const path = require('path');

// Create plugin instance
const plugin = new ${entrypointClassName}();

// Generate manifest
const manifestPath = path.join('${outputDir}', 'manifest.json');
const packageJsonPath = path.resolve('${packageJsonPath}');

try {
  const manifest = buildPluginManifest(
    plugin,
    packageJsonPath,
    '${entrypointClassName}',
    manifestPath
  );
  
  console.log('🎉 Plugin build completed successfully!');
  console.log('📄 Files generated:');
  console.log('  - dist/index.js (compiled plugin)');
  console.log('  - dist/manifest.json (frontend configuration)');
  console.log('');
  console.log('🚀 Ready for deployment to Tensorify plugin registry!');
  
} catch (error) {
  console.error('❌ Plugin build failed:', error.message);
  process.exit(1);
}
`;
}

/**
 * Create a development template for new plugins
 */
export function createPluginTemplate(
  pluginName: string,
  pluginId: string,
  category: string = "general"
): string {
  const className = pluginName.replace(/[^a-zA-Z0-9]/g, "") + "Plugin";

  return `import { 
  TensorifyPlugin, 
  IPluginDefinition,
  PluginSettings,
  PluginCodeGenerationContext,
  HandleViewType,
  NodeViewContainerType,
  SettingsFieldType,
  IconType,
  HandlePosition,
  EdgeType
} from "@tensorify.io/sdk";

/**
 * ${pluginName} Plugin
 * TODO: Add description for your plugin
 */
export class ${className} extends TensorifyPlugin {
  constructor() {
    super({
      // Basic plugin metadata
      id: "${pluginId}",
      name: "${pluginName}",
      description: "TODO: Describe what your plugin does",
      version: "1.0.0",
      category: "${category}",

      // Visual Configuration
      visual: {
        containerType: "default" as NodeViewContainerType,
        size: { 
          width: 200,
          height: 120,
          minWidth: 150,
          minHeight: 100
        },
        extraPadding: false,
        title: "${pluginName}",
        primaryIcon: {
          type: "lucide" as IconType,
          value: "box", // TODO: Choose appropriate Lucide icon
          position: "center"
        },
        secondaryIcons: [],
        dynamicLabelTemplate: undefined // TODO: Add dynamic label if needed
      },

      // Handle Configuration
      inputHandles: [
        {
          id: "input",
          position: "left" as HandlePosition,
          viewType: "default" as HandleViewType,
          required: false,
          label: "Input",
          edgeType: "default" as EdgeType
        }
      ],
      
      outputHandles: [
        {
          id: "output",
          position: "right" as HandlePosition,
          viewType: "default" as HandleViewType,
          label: "Output",
          edgeType: "default" as EdgeType
        }
      ],

      // Settings Configuration
      settingsFields: [
        {
          key: "message",
          label: "Message",
          type: "input-text" as SettingsFieldType,
          dataType: "string",
          defaultValue: "Hello, World!",
          required: false,
          description: "A simple message to display"
        }
      ]
    });
  }

  /**
   * Generate code for this plugin
   */
  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Validate settings first
    this.validateSettings(settings);

    // TODO: Implement your code generation logic
    const message = settings.message || "Hello, World!";
    
    return \`
# Generated code for ${pluginName}
print("${pluginName}: \${message}")

# TODO: Add your actual implementation here
\`.trim();
  }
}

// Export as default
export default ${className};
`;
}

// All functions are already exported individually above
