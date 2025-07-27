/**
 * Utility functions for plugin development and CLI integration
 */

import * as fs from "fs";
import * as path from "path";
import { TensorifyPlugin } from "../core/TensorifyPlugin";
import {
  FrontendPluginManifest,
  PackageJsonInfo,
  PluginValidationResult,
  PluginBuildOptions,
} from "../types/plugin";
import {
  PluginSettings,
  NodeType,
  PluginCapability,
  PluginRequirements,
} from "../types/core";
import {
  SettingsField,
  SettingsUIType,
  SettingsDataType,
  DEFAULT_VALUES,
} from "../types/settings";

// ========================================
// MANIFEST GENERATION UTILITIES
// ========================================

/**
 * Generate a plugin manifest from a plugin instance and package.json
 *
 * @param plugin Plugin instance
 * @param packageJsonPath Path to package.json file
 * @param entrypointClassName Name of the plugin class
 * @returns Generated manifest
 */
export function generatePluginManifest(
  plugin: TensorifyPlugin,
  packageJsonPath: string,
  entrypointClassName: string
): FrontendPluginManifest {
  const packageInfo = readPackageJson(packageJsonPath);
  return plugin.generateManifest(packageInfo, entrypointClassName);
}

/**
 * Read and parse package.json file
 *
 * @param packageJsonPath Path to package.json
 * @returns Parsed package.json information
 */
export function readPackageJson(packageJsonPath: string): PackageJsonInfo {
  try {
    const content = fs.readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(content);

    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      author: packageJson.author,
      main: packageJson.main,
      keywords: packageJson.keywords,
      dependencies: packageJson.dependencies,
      peerDependencies: packageJson.peerDependencies,
      repository: packageJson.repository,
    };
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error}`);
  }
}

/**
 * Write manifest to file
 *
 * @param manifest Plugin manifest to write
 * @param outputPath Output file path
 */
export function writeManifestFile(
  manifest: FrontendPluginManifest,
  outputPath: string
): void {
  try {
    const manifestJson = JSON.stringify(manifest, null, 2);
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, manifestJson, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write manifest file: ${error}`);
  }
}

/**
 * Complete build workflow: generate manifest and write to file
 *
 * @param plugin Plugin instance
 * @param packageJsonPath Path to package.json
 * @param entrypointClassName Plugin class name
 * @param outputPath Output manifest file path
 * @returns Generated manifest
 */
export function buildPluginManifest(
  plugin: TensorifyPlugin,
  packageJsonPath: string,
  entrypointClassName: string,
  outputPath: string
): FrontendPluginManifest {
  const manifest = generatePluginManifest(
    plugin,
    packageJsonPath,
    entrypointClassName
  );
  writeManifestFile(manifest, outputPath);
  return manifest;
}

// ========================================
// PLUGIN VALIDATION UTILITIES
// ========================================

/**
 * Validate a plugin instance comprehensively
 *
 * @param plugin Plugin instance to validate
 * @returns Validation result
 */
export function validatePlugin(
  plugin: TensorifyPlugin
): PluginValidationResult {
  // Create default settings for validation
  const defaultSettings = plugin.createDefaultSettings();

  // Validate the settings
  return plugin.validateSettings(defaultSettings);
}

/**
 * Validate plugin settings against field definitions
 *
 * @param plugin Plugin instance
 * @param settings Settings to validate
 * @returns Validation result with detailed feedback
 */
export function validatePluginSettings(
  plugin: TensorifyPlugin,
  settings: PluginSettings
): { isValid: boolean; message: string; details?: string[] } {
  const result = plugin.validateSettings(settings);

  if (result.isValid) {
    return {
      isValid: true,
      message: "All settings are valid",
    };
  }

  const details = result.errors.map(
    (error) => `${error.path}: ${error.message}`
  );

  return {
    isValid: false,
    message: `Validation failed with ${result.errors.length} error(s)`,
    details,
  };
}

// ========================================
// SETTINGS UTILITIES
// ========================================

/**
 * Create default settings object from field definitions
 *
 * @param settingsFields Array of settings field definitions
 * @returns Default settings object
 */
export function createDefaultSettings(
  settingsFields: SettingsField[]
): PluginSettings {
  const settings: PluginSettings = {
    variableName: `plugin_${Date.now()}`,
    labelName: "Plugin",
  };

  for (const field of settingsFields) {
    if (field.defaultValue !== undefined) {
      settings[field.key] = field.defaultValue;
    } else {
      // Use data type default
      settings[field.key] = DEFAULT_VALUES[field.dataType];
    }
  }

  return settings;
}

/**
 * Merge user settings with defaults
 *
 * @param userSettings User-provided settings
 * @param settingsFields Settings field definitions
 * @returns Merged settings with defaults applied
 */
export function mergeSettingsWithDefaults(
  userSettings: PluginSettings,
  settingsFields: SettingsField[]
): PluginSettings {
  const defaults = createDefaultSettings(settingsFields);
  return { ...defaults, ...userSettings };
}

/**
 * Generate dynamic label from template and settings
 *
 * @param template Template string with {placeholders}
 * @param settings Settings object
 * @returns Processed label string
 */
export function processDynamicLabelTemplate(
  template: string | undefined,
  settings: PluginSettings
): string {
  if (!template) return "";

  let result = template;
  for (const [key, value] of Object.entries(settings)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, "g"), String(value));
  }

  return result;
}

// ========================================
// CODE GENERATION UTILITIES
// ========================================

/**
 * Generate a unique variable name with prefix
 *
 * @param prefix Variable name prefix
 * @returns Unique variable name
 */
export function generateVariableName(prefix: string = "var"): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Sanitize a string to be a valid variable name
 *
 * @param name Input string
 * @returns Sanitized variable name
 */
export function sanitizeVariableName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^[0-9]/, "_$&")
    .replace(/_+/g, "_")
    .toLowerCase();
}

/**
 * Indent code by specified levels
 *
 * @param code Code string to indent
 * @param levels Number of indentation levels
 * @param indentString String to use for each level (default: 2 spaces)
 * @returns Indented code
 */
export function indentCode(
  code: string,
  levels: number,
  indentString: string = "  "
): string {
  if (levels <= 0) return code;

  const indent = indentString.repeat(levels);
  return code
    .split("\n")
    .map((line) => (line.trim() ? indent + line : line))
    .join("\n");
}

// ========================================
// FILE SYSTEM UTILITIES
// ========================================

/**
 * Auto-detect the entrypoint class name from source files
 *
 * @param sourceDir Source directory to search
 * @returns Detected class name or null
 */
export function autoDetectEntrypointClassName(
  sourceDir: string
): string | null {
  try {
    const indexPath = path.join(sourceDir, "index.ts");
    if (!fs.existsSync(indexPath)) return null;

    const content = fs.readFileSync(indexPath, "utf-8");

    // Look for default export class
    const defaultExportMatch = content.match(
      /export\s+default\s+class\s+(\w+)/
    );
    if (defaultExportMatch) {
      return defaultExportMatch[1];
    }

    // Look for named export class that extends TensorifyPlugin
    const namedExportMatch = content.match(
      /export\s+class\s+(\w+)\s+extends\s+TensorifyPlugin/
    );
    if (namedExportMatch) {
      return namedExportMatch[1];
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a directory contains a valid plugin structure
 *
 * @param directory Directory to check
 * @returns True if valid plugin structure
 */
export function isValidPluginDirectory(directory: string): boolean {
  const requiredFiles = ["package.json", "tsconfig.json"];
  const requiredDirs = ["src"];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(directory, file))) {
      return false;
    }
  }

  for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(directory, dir))) {
      return false;
    }
  }

  // Check for index.ts in src
  if (!fs.existsSync(path.join(directory, "src", "index.ts"))) {
    return false;
  }

  return true;
}

// ========================================
// DEVELOPMENT UTILITIES
// ========================================

/**
 * Create a minimal plugin template
 *
 * @param pluginName Human-readable plugin name
 * @param pluginId Unique plugin identifier
 * @param nodeType Plugin category
 * @returns Plugin template code
 */
export function createPluginTemplate(
  pluginName: string,
  pluginId: string,
  nodeType: NodeType = NodeType.CUSTOM
): string {
  return `import { 
  TensorifyPlugin,
  IPluginDefinition,
  PluginSettings,
  PluginCodeGenerationContext,
  NodeType,
  PluginCapability,
  HandleViewType,
  HandlePosition,
  EdgeType,
  NodeViewContainerType,
  IconType,
  SettingsUIType,
  SettingsDataType
} from '@tensorify.io/sdk';

export default class ${pluginName.replace(/[^a-zA-Z0-9]/g, "")}Plugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Core Metadata
      id: "${pluginId}",
      name: "${pluginName}",
      description: "A ${pluginName.toLowerCase()} plugin for Tensorify",
      version: "1.0.0",
      nodeType: NodeType.${nodeType.toUpperCase()},

      // Visual Configuration
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 200,
          height: 120
        },
        padding: {
          inner: 16,
          outer: 8,
          extraPadding: false
        },
        styling: {
          borderRadius: 8,
          borderWidth: 2,
          shadowLevel: 1,
          theme: "auto"
        },
        icons: {
          primary: {
            type: IconType.LUCIDE,
            value: "box"
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium"
        },
        labels: {
          title: "${pluginName}",
          showLabels: true,
          labelPosition: "top"
        }
      },

      // Handle Configuration
      inputHandles: [
        {
          id: "input",
          position: HandlePosition.LEFT,
          viewType: HandleViewType.DEFAULT,
          required: false,
          label: "Input",
          edgeType: EdgeType.DEFAULT,
          dataType: "any"
        }
      ],

      outputHandles: [
        {
          id: "output",
          position: HandlePosition.RIGHT,
          viewType: HandleViewType.DEFAULT,
          label: "Output",
          edgeType: EdgeType.DEFAULT,
          dataType: "any"
        }
      ],

      // Settings Configuration
      settingsFields: [
        {
          key: "message",
          label: "Message",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "Hello World!",
          required: false,
          description: "Message to display in generated code"
        }
      ],

      // Plugin Metadata
      capabilities: [PluginCapability.CODE_GENERATION],
      requirements: {
        minSdkVersion: "1.0.0",
        dependencies: []
      }
    };

    super(definition);
  }

  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Validate settings
    const validation = this.validateSettings(settings);
    if (!validation.isValid) {
      throw new Error(\`Settings validation failed: \${validation.errors.map(e => e.message).join(', ')}\`);
    }

    // Generate code
    const message = settings.message || "Hello World!";
    const variableName = settings.variableName;
    
    return \`# ${pluginName} Plugin
\${variableName} = "\${message}"
print(\${variableName})\`;
  }
}`;
}

/**
 * Get plugin metadata summary
 *
 * @param plugin Plugin instance
 * @returns Metadata summary object
 */
export function getPluginMetadata(plugin: TensorifyPlugin) {
  const definition = plugin.getDefinition();

  return {
    id: definition.id,
    name: definition.name,
    version: definition.version,
    nodeType: definition.nodeType,
    inputHandles: definition.inputHandles.length,
    outputHandles: definition.outputHandles.length,
    settingsFields: definition.settingsFields.length,
    capabilities: definition.capabilities,
    hasVisualConfig: !!definition.visual,
    hasDynamicLabel: !!definition.visual.labels.dynamicLabelTemplate,
  };
}
