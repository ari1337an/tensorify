/**
 * TensorifyPlugin Base Class
 * Main base class for the new frontend plugin system
 */

import {
  IPluginDefinition,
  PluginSettings,
  FrontendPluginManifest,
  PackageJsonInfo,
  PluginValidationResult,
  PluginCodeGenerationContext,
  HandleDefinition,
  SettingsField,
  NodeVisualConfig,
  SettingsDataType,
  SettingsFieldType,
} from "../types/plugin.types";

/**
 * Abstract base class for all Tensorify plugins in the new frontend system
 * Plugin writers extend this class to create custom nodes for React Flow
 */
export abstract class TensorifyPlugin {
  protected readonly definition: IPluginDefinition;
  private dynamicLabelTemplate?: string;

  constructor(definition: IPluginDefinition) {
    this.definition = definition;
    this.dynamicLabelTemplate = definition.visual.dynamicLabelTemplate;

    // Validate the plugin definition on construction
    this.validatePluginDefinition();
  }

  /**
   * ABSTRACT METHOD: Generate code for this plugin
   * Plugin writers must implement this method
   *
   * @param settings - Current user-configured values from the settings UI
   * @param children - Connected child node data (for complex workflows)
   * @param context - Workflow-level context and global state
   * @returns Generated code string
   */
  public abstract getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string;

  /**
   * Get the plugin definition
   */
  public getDefinition(): IPluginDefinition {
    return { ...this.definition };
  }

  /**
   * Get plugin ID
   */
  public getId(): string {
    return this.definition.id;
  }

  /**
   * Get plugin name
   */
  public getName(): string {
    return this.definition.name;
  }

  /**
   * Get plugin version
   */
  public getVersion(): string {
    return this.definition.version;
  }

  /**
   * Get plugin category
   */
  public getCategory(): string {
    return this.definition.category;
  }

  /**
   * Get visual configuration
   */
  public getVisualConfig(): NodeVisualConfig {
    return { ...this.definition.visual };
  }

  /**
   * Get input handles
   */
  public getInputHandles(): HandleDefinition[] {
    return [...this.definition.inputHandles];
  }

  /**
   * Get output handles
   */
  public getOutputHandles(): HandleDefinition[] {
    return [...this.definition.outputHandles];
  }

  /**
   * Get settings fields
   */
  public getSettingsFields(): SettingsField[] {
    return [...this.definition.settingsFields];
  }

  /**
   * Update dynamic label template
   */
  public updateDynamicLabel(template: string): void {
    this.dynamicLabelTemplate = template;
  }

  /**
   * Get current dynamic label template
   */
  public getDynamicLabelTemplate(): string | undefined {
    return this.dynamicLabelTemplate;
  }

  /**
   * Generate dynamic label with actual settings values
   * Replaces {placeholders} with actual setting values
   *
   * @param settings - Current settings values
   * @returns Processed label string
   */
  public generateDynamicLabel(settings: PluginSettings): string {
    if (!this.dynamicLabelTemplate) {
      return "";
    }

    let label = this.dynamicLabelTemplate;

    // Replace {placeholder} patterns with actual values
    const placeholderRegex = /\{([^}]+)\}/g;
    label = label.replace(placeholderRegex, (match, key) => {
      const value = settings[key];

      // Handle different value types
      if (value === undefined || value === null) {
        return match; // Keep placeholder if no value
      }

      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      return String(value);
    });

    return label;
  }

  /**
   * Validate plugin settings against field definitions
   *
   * @param settings - Settings to validate
   * @returns True if valid, throws error if invalid
   */
  public validateSettings(settings: PluginSettings): boolean {
    const errors: string[] = [];

    for (const field of this.definition.settingsFields) {
      const value = settings[field.key];

      // Check required fields
      if (
        field.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(
          `Required field '${field.label}' (${field.key}) is missing`
        );
        continue;
      }

      // Skip validation if field is not required and no value provided
      if (!field.required && (value === undefined || value === null)) {
        continue;
      }

      // Validate data types
      if (!this.validateFieldDataType(value, field.dataType, field.key)) {
        errors.push(
          `Field '${field.label}' (${field.key}) has invalid data type. Expected: ${field.dataType}`
        );
      }

      // Validate options for dropdown/radio fields
      if (
        (field.type === "dropdown" || field.type === "radio") &&
        field.options
      ) {
        const validValues = field.options.map((opt) => opt.value);
        if (!validValues.includes(value)) {
          errors.push(
            `Field '${field.label}' (${field.key}) has invalid value. Valid options: ${validValues.join(", ")}`
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Settings validation failed:\n${errors.join("\n")}`);
    }

    return true;
  }

  /**
   * Generate frontend plugin manifest from package.json and plugin definition
   *
   * @param packageInfo - Package.json information
   * @param entrypointClassName - Exact class name for the plugin
   * @returns Complete frontend manifest
   */
  public generateManifest(
    packageInfo: PackageJsonInfo,
    entrypointClassName: string
  ): FrontendPluginManifest {
    return {
      name: packageInfo.name,
      version: packageInfo.version,
      description: packageInfo.description || this.definition.description,
      author: packageInfo.author || "",
      main: packageInfo.main || "dist/index.js",
      entrypointClassName,
      keywords: packageInfo.keywords || [],

      frontendConfigs: {
        id: this.definition.id,
        name: this.definition.name,
        category: this.definition.category,

        // Visual Configuration
        title: this.definition.visual.title,
        titleDescription: this.definition.visual.titleDescription,
        containerType: this.definition.visual.containerType,
        size: { ...this.definition.visual.size },
        extraPadding: this.definition.visual.extraPadding,
        primaryIcon: this.definition.visual.primaryIcon
          ? { ...this.definition.visual.primaryIcon }
          : undefined,
        secondaryIcons: this.definition.visual.secondaryIcons.map((icon) => ({
          ...icon,
        })),

        // Handle Configuration
        inputHandles: this.definition.inputHandles.map((handle) => ({
          ...handle,
        })),
        outputHandles: this.definition.outputHandles.map((handle) => ({
          ...handle,
        })),

        // Settings Configuration
        settingsFields: this.definition.settingsFields.map((field) => ({
          ...field,
        })),

        // Dynamic Label Template
        dynamicLabelTemplate: this.dynamicLabelTemplate,
      },

      capabilities: this.getCapabilities(),
      requirements: {
        minSdkVersion: "1.0.0", // Update this based on your versioning
        dependencies: Object.keys(packageInfo.dependencies || {}),
      },
    };
  }

  /**
   * Get plugin capabilities - can be overridden by subclasses
   */
  protected getCapabilities(): string[] {
    const capabilities: string[] = ["code-generation"];

    // Add capabilities based on plugin features
    if (this.definition.inputHandles.length > 0) {
      capabilities.push("input-handling");
    }

    if (this.definition.outputHandles.length > 0) {
      capabilities.push("output-handling");
    }

    if (this.definition.settingsFields.length > 0) {
      capabilities.push("configurable");
    }

    if (this.dynamicLabelTemplate) {
      capabilities.push("dynamic-labeling");
    }

    return capabilities;
  }

  /**
   * Perform comprehensive plugin validation
   */
  public validatePlugin(): PluginValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate basic definition
      this.validatePluginDefinition();

      // Validate handle IDs are unique
      this.validateHandleUniqueness();

      // Validate settings field keys are unique
      this.validateSettingsKeysUniqueness();

      // Validate data type and UI type compatibility
      this.validateSettingsTypeCompatibility();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    // Add warnings for best practices
    if (
      this.definition.inputHandles.length === 0 &&
      this.definition.outputHandles.length === 0
    ) {
      warnings.push(
        "Plugin has no input or output handles - consider if this is intentional"
      );
    }

    if (
      !this.definition.visual.primaryIcon &&
      this.definition.visual.secondaryIcons.length === 0
    ) {
      warnings.push("Plugin has no icons - consider adding visual indicators");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate basic plugin definition structure
   */
  private validatePluginDefinition(): void {
    if (!this.definition.id || this.definition.id.trim() === "") {
      throw new Error("Plugin ID is required");
    }

    if (!this.definition.name || this.definition.name.trim() === "") {
      throw new Error("Plugin name is required");
    }

    if (
      !this.definition.version ||
      !this.isValidSemver(this.definition.version)
    ) {
      throw new Error("Valid semver version is required");
    }

    if (!this.definition.visual.containerType) {
      throw new Error("Container type is required");
    }

    if (
      !this.definition.visual.size.width ||
      !this.definition.visual.size.height
    ) {
      throw new Error("Visual size (width and height) is required");
    }
  }

  /**
   * Validate handle ID uniqueness
   */
  private validateHandleUniqueness(): void {
    const allHandleIds = [
      ...this.definition.inputHandles.map((h) => h.id),
      ...this.definition.outputHandles.map((h) => h.id),
    ];

    const duplicates = allHandleIds.filter(
      (id, index) => allHandleIds.indexOf(id) !== index
    );

    if (duplicates.length > 0) {
      throw new Error(`Duplicate handle IDs found: ${duplicates.join(", ")}`);
    }
  }

  /**
   * Validate settings field key uniqueness
   */
  private validateSettingsKeysUniqueness(): void {
    const keys = this.definition.settingsFields.map((f) => f.key);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate settings field keys found: ${duplicates.join(", ")}`
      );
    }
  }

  /**
   * Validate settings type compatibility between dataType and UI type
   */
  private validateSettingsTypeCompatibility(): void {
    for (const field of this.definition.settingsFields) {
      if (!this.isCompatibleTypes(field.dataType, field.type)) {
        throw new Error(
          `Incompatible types for field '${field.key}': dataType '${field.dataType}' with UI type '${field.type}'`
        );
      }
    }
  }

  /**
   * Check if data type and UI type are compatible
   */
  private isCompatibleTypes(
    dataType: SettingsDataType,
    uiType: SettingsFieldType
  ): boolean {
    const compatibility: Record<SettingsDataType, SettingsFieldType[]> = {
      string: ["input-text", "textarea", "dropdown", "radio"],
      number: ["input-number"],
      boolean: ["toggle", "checkbox"],
      array: ["dropdown"], // Multi-select dropdown
      object: [], // Objects need custom handling
    };

    return compatibility[dataType]?.includes(uiType) || false;
  }

  /**
   * Validate field data type
   */
  private validateFieldDataType(
    value: any,
    expectedType: SettingsDataType,
    fieldKey: string
  ): boolean {
    switch (expectedType) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && !isNaN(value);
      case "boolean":
        return typeof value === "boolean";
      case "array":
        return Array.isArray(value);
      case "object":
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      default:
        console.warn(
          `Unknown data type '${expectedType}' for field '${fieldKey}'`
        );
        return true; // Allow unknown types
    }
  }

  /**
   * Simple semver validation
   */
  private isValidSemver(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+(-[\w\.-]+)?(\+[\w\.-]+)?$/;
    return semverRegex.test(version);
  }
}
