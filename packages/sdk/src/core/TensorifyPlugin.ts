/**
 * TensorifyPlugin - The core abstract class for all Tensorify plugins
 *
 * This is the single class that all plugin developers must extend.
 * It enforces frontend requirements, provides validation, and handles
 * manifest generation for the CLI publishing system.
 */

import {
  CorePluginSettings,
  PluginSettings,
  PluginCodeGenerationContext,
  NodeType,
  PluginCapability,
  PluginRequirements,
} from "../types/core";
import {
  IPluginDefinition,
  FrontendPluginManifest,
  PackageJsonInfo,
  PluginValidationResult,
  PluginValidationError,
  PluginValidationWarning,
} from "../types/plugin";
import {
  InputHandle,
  OutputHandle,
  NodeVisualConfig,
  HandleViewType,
  HandlePosition,
  EdgeType,
  NodeViewContainerType,
  IconType,
} from "../types/visual";
import {
  SettingsField,
  SettingsGroup,
  SettingsUIType,
  SettingsDataType,
  UI_TYPE_TO_DATA_TYPE_MAP,
} from "../types/settings";

/**
 * Abstract base class for all Tensorify plugins
 *
 * Every plugin must extend this class and implement the required methods.
 * This class enforces frontend visual requirements and provides utilities
 * for plugin development.
 */
export abstract class TensorifyPlugin {
  /** Plugin definition containing all configuration */
  protected readonly definition: IPluginDefinition;

  /** Current SDK version */
  private static readonly SDK_VERSION = "1.0.0";

  /** Manifest format version */
  private static readonly MANIFEST_VERSION = "1.0.0";

  /**
   * Constructor - Creates a new plugin instance
   * @param definition Complete plugin definition
   */
  constructor(definition: IPluginDefinition) {
    this.definition = definition;
    this.validateDefinition();
  }

  // ========================================
  // ABSTRACT METHODS (Must be implemented)
  // ========================================

  /**
   * Generate executable code for this plugin
   *
   * This is the core method that every plugin must implement.
   * It generates the actual code that will be executed in the workflow.
   *
   * @param settings Plugin settings extending CorePluginSettings
   * @param children Connected child plugins (keep as any for flexibility)
   * @param context Code generation context with input data access
   * @returns Generated code as string
   */
  public abstract getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string;

  // ========================================
  // INPUT ACCESS HELPER
  // ========================================

  /**
   * Helper method to access input data from handles
   *
   * @param context Code generation context
   * @param handleNumber Handle index (0-based)
   * @returns Input data from the specified handle
   */
  protected getInput(
    context: PluginCodeGenerationContext,
    handleNumber: number
  ): any {
    return context?.inputData[handleNumber] || null;
  }

  /**
   * Get all input data as an array
   *
   * @param context Code generation context
   * @returns Array of all input data
   */
  protected getAllInputs(context: PluginCodeGenerationContext): any[] {
    if (!context?.inputData) return [];
    const maxHandle = Math.max(...Object.keys(context.inputData).map(Number));
    const inputs: any[] = [];
    for (let i = 0; i <= maxHandle; i++) {
      inputs.push(context.inputData[i] || null);
    }
    return inputs;
  }

  // ========================================
  // PLUGIN DEFINITION ACCESSORS
  // ========================================

  /** Get plugin ID (may be undefined if not provided in definition) */
  public getId(): string | undefined {
    return this.definition.id;
  }

  /** Get plugin name (may be undefined if not provided in definition) */
  public getName(): string | undefined {
    return this.definition.name;
  }

  /** Get plugin description (may be undefined if not provided in definition) */
  public getDescription(): string | undefined {
    return this.definition.description;
  }

  /** Get plugin version (may be undefined if not provided in definition) */
  public getVersion(): string | undefined {
    return this.definition.version;
  }

  /** Get node type (may be undefined if not provided in definition) */
  public getNodeType(): NodeType | undefined {
    return this.definition.nodeType;
  }

  /** Get visual configuration */
  public getVisualConfig(): NodeVisualConfig {
    return this.definition.visual;
  }

  /** Get input handles */
  public getInputHandles(): InputHandle[] {
    return this.definition.inputHandles;
  }

  /** Get output handles */
  public getOutputHandles(): OutputHandle[] {
    return this.definition.outputHandles;
  }

  /** Get settings fields */
  public getSettingsFields(): SettingsField[] {
    return this.definition.settingsFields;
  }

  /** Get settings groups */
  public getSettingsGroups(): SettingsGroup[] {
    return this.definition.settingsGroups || [];
  }

  /** Get capabilities */
  public getCapabilities(): PluginCapability[] {
    return this.definition.capabilities;
  }

  /** Get requirements */
  public getRequirements(): PluginRequirements {
    return this.definition.requirements;
  }

  /** Get complete definition */
  public getDefinition(): IPluginDefinition {
    return { ...this.definition };
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  /**
   * Validate plugin settings before code generation
   *
   * @param settings Settings to validate
   * @returns Validation result
   */
  public validateSettings(settings: PluginSettings): PluginValidationResult {
    const errors: PluginValidationError[] = [];
    const warnings: PluginValidationWarning[] = [];

    if (!settings.labelName) {
      errors.push({
        type: "missing_property",
        message: "labelName is required in plugin settings",
        path: "labelName",
        expected: "string",
        actual: settings.labelName,
      });
    }

    // Validate each settings field
    for (const field of this.definition.settingsFields) {
      const value = settings[field.key];

      // Check required fields
      if (
        field.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push({
          type: "missing_property",
          message: `Required field '${field.key}' is missing`,
          path: field.key,
          expected: field.dataType,
          actual: value,
        });
        continue;
      }

      // Skip validation if field is not required and not provided
      if (value === undefined || value === null) continue;

      // Validate data type
      if (!this.validateFieldDataType(value, field.dataType, field.key)) {
        errors.push({
          type: "invalid_type",
          message: `Invalid type for field '${field.key}'`,
          path: field.key,
          expected: field.dataType,
          actual: typeof value,
        });
      }

      // Validate field-specific rules
      if (field.validation) {
        const fieldErrors = this.validateFieldRules(value, field);
        errors.push(...fieldErrors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate the plugin definition structure
   */
  private validateDefinition(): void {
    const errors: string[] = [];

    // Note: All core metadata (including nodeType) can be derived from package.json
    // Only visual configuration is truly required at definition time

    // Validate visual config
    if (!this.definition.visual) {
      errors.push("Plugin visual configuration is required");
    } else {
      this.validateVisualConfig(errors);
    }

    // Validate handles
    this.validateHandles(errors);

    // Validate settings fields
    this.validateSettingsFields(errors);

    // Enforce emits presence (empty structure allowed)
    const emits = (this.definition as any).emits;
    if (!emits || typeof emits !== "object") {
      errors.push(
        "Plugin definition must include 'emits' object with variables/imports arrays"
      );
    } else {
      if (!Array.isArray(emits.variables)) {
        errors.push("Plugin 'emits.variables' must be an array (can be empty)");
      }
      if (!Array.isArray(emits.imports)) {
        errors.push("Plugin 'emits.imports' must be an array (can be empty)");
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Plugin definition validation failed:\n${errors.join("\n")}`
      );
    }
  }

  /**
   * Validate visual configuration
   */
  private validateVisualConfig(errors: string[]): void {
    const visual = this.definition.visual;

    if (!visual.containerType) {
      errors.push("Visual containerType is required");
    }

    if (!visual.size || !visual.size.width || !visual.size.height) {
      errors.push("Visual size (width and height) is required");
    }

    if (visual.size.width < 50 || visual.size.height < 30) {
      errors.push("Visual size too small (minimum 50x30)");
    }
  }

  /**
   * Check if this plugin is a variable provider type
   */
  private isVariableProviderPlugin(): boolean {
    const nodeType = this.definition.nodeType;
    if (!nodeType) return false;

    const variableProviderTypes = [
      NodeType.DATASET,
      NodeType.DATALOADER,
      // Add more variable provider types as needed
    ];
    return variableProviderTypes.includes(nodeType);
  }

  /**
   * Validate handle configurations
   */
  private validateHandles(errors: string[]): void {
    const inputIds = new Set<string>();
    const outputIds = new Set<string>();
    let hasPrev = false;
    let hasNext = false;

    // Validate input handles
    for (const handle of this.definition.inputHandles) {
      if (!handle.id) {
        errors.push("Input handle id is required");
        continue;
      }

      if (inputIds.has(handle.id)) {
        errors.push(`Duplicate input handle id: ${handle.id}`);
      }
      inputIds.add(handle.id);

      if (!handle.position) {
        errors.push(`Input handle ${handle.id} position is required`);
      }

      if (!handle.viewType) {
        errors.push(`Input handle ${handle.id} viewType is required`);
      }

      if (handle.id === "prev") {
        hasPrev = true;
        if (handle.position !== HandlePosition.LEFT) {
          errors.push("Input handle 'prev' must be on the LEFT side");
        }
        // prev is required for flow, but Start nodes may omit. Since SDK doesn't know node type here,
        // enforce required flag present and true to make UI render a required badge.
        if (handle.required !== true) {
          errors.push("Input handle 'prev' must be required: true");
        }
      }
    }

    // Validate output handles
    for (const handle of this.definition.outputHandles) {
      if (!handle.id) {
        errors.push("Output handle id is required");
        continue;
      }

      if (outputIds.has(handle.id)) {
        errors.push(`Duplicate output handle id: ${handle.id}`);
      }
      outputIds.add(handle.id);

      if (!handle.position) {
        errors.push(`Output handle ${handle.id} position is required`);
      }

      if (!handle.viewType) {
        errors.push(`Output handle ${handle.id} viewType is required`);
      }

      if (handle.id === "next") {
        hasNext = true;
        if (handle.position !== HandlePosition.RIGHT) {
          errors.push("Output handle 'next' must be on the RIGHT side");
        }
      }
    }

    // Enforce presence of prev/next handles for non-variable-provider plugins
    const isVariableProvider = this.isVariableProviderPlugin();
    if (!isVariableProvider && !hasPrev) {
      errors.push("Plugin must define an input handle with id 'prev'");
    }
    if (!isVariableProvider && !hasNext) {
      errors.push("Plugin must define an output handle with id 'next'");
    }
  }

  /**
   * Validate settings fields configuration
   */
  private validateSettingsFields(errors: string[]): void {
    const fieldKeys = new Set<string>();

    for (const field of this.definition.settingsFields) {
      if (!field.key) {
        errors.push("Settings field key is required");
        continue;
      }

      if (fieldKeys.has(field.key)) {
        errors.push(`Duplicate settings field key: ${field.key}`);
      }
      fieldKeys.add(field.key);

      if (!field.label) {
        errors.push(`Settings field ${field.key} label is required`);
      }

      if (!field.type) {
        errors.push(`Settings field ${field.key} type is required`);
      }

      if (!field.dataType) {
        errors.push(`Settings field ${field.key} dataType is required`);
      }

      // Validate type compatibility
      if (field.type && field.dataType) {
        const compatibleTypes = UI_TYPE_TO_DATA_TYPE_MAP[field.type];
        if (compatibleTypes && !compatibleTypes.includes(field.dataType)) {
          errors.push(
            `Settings field ${field.key} has incompatible type/dataType combination`
          );
        }
      }
    }

    // Enforce emits.variables switch constraints if emits is provided
    if (
      this.definition.emits &&
      Array.isArray(this.definition.emits.variables)
    ) {
      const byKey: Record<string, SettingsField> = {};
      for (const f of this.definition.settingsFields) {
        byKey[f.key] = f;
      }
      for (const variable of this.definition.emits.variables) {
        if (!variable || !variable.switchKey) continue;
        const rawKey = variable.switchKey.includes(".")
          ? variable.switchKey.split(".").pop()!
          : variable.switchKey;
        const toggleField = byKey[rawKey];
        if (!toggleField) {
          errors.push(
            `Emitted variable '${variable.value}' requires a boolean toggle settings field '${rawKey}' (from switchKey '${variable.switchKey}')`
          );
          continue;
        }
        // Must be toggle boolean and required
        if (toggleField.type !== SettingsUIType.TOGGLE) {
          errors.push(
            `Settings field '${rawKey}' must be of UI type TOGGLE because it controls emitted variable '${variable.value}'`
          );
        }
        if (toggleField.dataType !== SettingsDataType.BOOLEAN) {
          errors.push(
            `Settings field '${rawKey}' must have dataType BOOLEAN because it controls emitted variable '${variable.value}'`
          );
        }
        if (toggleField.required !== true) {
          errors.push(
            `Settings field '${rawKey}' must be required: true because it controls emitted variable '${variable.value}'`
          );
        }
        // Default matches isOnByDefault when provided
        if (
          typeof variable.isOnByDefault === "boolean" &&
          toggleField.defaultValue !== variable.isOnByDefault
        ) {
          errors.push(
            `Settings field '${rawKey}'.defaultValue (${String(
              toggleField.defaultValue
            )}) must match isOnByDefault (${String(
              variable.isOnByDefault
            )}) for emitted variable '${variable.value}'`
          );
        }
      }
    }
  }

  /**
   * Validate individual field data type
   */
  private validateFieldDataType(
    value: any,
    expectedType: SettingsDataType,
    fieldKey: string
  ): boolean {
    switch (expectedType) {
      case SettingsDataType.STRING:
        return typeof value === "string";
      case SettingsDataType.NUMBER:
        return typeof value === "number" && !isNaN(value);
      case SettingsDataType.BOOLEAN:
        return typeof value === "boolean";
      case SettingsDataType.ARRAY:
        return Array.isArray(value);
      case SettingsDataType.OBJECT:
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      default:
        return true;
    }
  }

  /**
   * Validate field-specific rules
   */
  private validateFieldRules(
    value: any,
    field: SettingsField
  ): PluginValidationError[] {
    const errors: PluginValidationError[] = [];
    const validation = field.validation!;

    if (typeof value === "string") {
      if (
        validation.minLength !== undefined &&
        value.length < validation.minLength
      ) {
        errors.push({
          type: "invalid_value",
          message: `Field '${field.key}' is too short (minimum ${validation.minLength} characters)`,
          path: field.key,
          expected: `length >= ${validation.minLength}`,
          actual: value.length,
        });
      }

      if (
        validation.maxLength !== undefined &&
        value.length > validation.maxLength
      ) {
        errors.push({
          type: "invalid_value",
          message: `Field '${field.key}' is too long (maximum ${validation.maxLength} characters)`,
          path: field.key,
          expected: `length <= ${validation.maxLength}`,
          actual: value.length,
        });
      }

      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push({
            type: "invalid_value",
            message: `Field '${field.key}' does not match required pattern`,
            path: field.key,
            expected: validation.pattern,
            actual: value,
          });
        }
      }
    }

    if (typeof value === "number") {
      if (validation.min !== undefined && value < validation.min) {
        errors.push({
          type: "invalid_value",
          message: `Field '${field.key}' is too small (minimum ${validation.min})`,
          path: field.key,
          expected: `>= ${validation.min}`,
          actual: value,
        });
      }

      if (validation.max !== undefined && value > validation.max) {
        errors.push({
          type: "invalid_value",
          message: `Field '${field.key}' is too large (maximum ${validation.max})`,
          path: field.key,
          expected: `<= ${validation.max}`,
          actual: value,
        });
      }
    }

    return errors;
  }

  // ========================================
  // MANIFEST GENERATION
  // ========================================

  /**
   * Derive plugin ID from package name
   * @param packageName Package name (e.g., "@org/my-plugin" or "my-plugin")
   * @returns Derived plugin ID
   */
  private derivePluginId(packageName: string): string {
    // Remove scope prefix if present (@org/my-plugin -> my-plugin)
    return packageName.replace(/^@[^/]+\//, "");
  }

  /**
   * Derive nodeType from package.json tensorify.pluginType
   * @param pluginType Plugin type from package.json tensorify section
   * @returns Derived NodeType or default to CUSTOM
   */
  private deriveNodeType(pluginType?: string): NodeType {
    if (!pluginType) return NodeType.CUSTOM;

    // Map string values to NodeType enum
    const typeMap: Record<string, NodeType> = {
      custom: NodeType.CUSTOM,
      trainer: NodeType.TRAINER,
      evaluator: NodeType.EVALUATOR,
      model: NodeType.MODEL,
      model_layer: NodeType.MODEL_LAYER,
      sequence: NodeType.SEQUENCE,
      dataloader: NodeType.DATALOADER,
      preprocessor: NodeType.PREPROCESSOR,
      postprocessor: NodeType.POSTPROCESSOR,
      augmentation_stack: NodeType.AUGMENTATION_STACK,
      optimizer: NodeType.OPTIMIZER,
      loss_function: NodeType.LOSS_FUNCTION,
      metric: NodeType.METRIC,
      scheduler: NodeType.SCHEDULER,
      regularizer: NodeType.REGULARIZER,
      function: NodeType.FUNCTION,
      pipeline: NodeType.PIPELINE,
      report: NodeType.REPORT,
    };

    return typeMap[pluginType.toLowerCase()] || NodeType.CUSTOM;
  }

  /**
   * Generate frontend manifest for CLI publishing
   *
   * @param packageInfo Package.json information
   * @param entrypointClassName Exact class name for instantiation
   * @returns Frontend plugin manifest
   */
  public generateManifest(
    packageInfo: PackageJsonInfo,
    entrypointClassName: string
  ): FrontendPluginManifest {
    // Derive missing core metadata from package.json
    const derivedId =
      this.definition.id || this.derivePluginId(packageInfo.name);
    const derivedName = this.definition.name || packageInfo.name;
    const derivedDescription =
      this.definition.description || packageInfo.description || "";
    const derivedVersion = this.definition.version || packageInfo.version;
    const derivedNodeType =
      this.definition.nodeType ||
      this.deriveNodeType(packageInfo.tensorify?.pluginType);

    // Validate that we have all required information after derivation
    if (!derivedId) {
      throw new Error("Plugin ID could not be derived from package name");
    }
    if (!derivedName) {
      throw new Error("Plugin name could not be derived from package name");
    }
    if (!derivedVersion) {
      throw new Error("Plugin version could not be derived from package.json");
    }

    const manifest: FrontendPluginManifest = {
      // Package Information
      name: packageInfo.name,
      version: packageInfo.version,
      description: packageInfo.description || derivedDescription,
      author: packageInfo.author || this.definition.author || "",
      main: packageInfo.main || "dist/index.js",
      entrypointClassName,
      keywords: packageInfo.keywords || this.definition.keywords || [],
      repository: packageInfo.repository,
      pluginType: packageInfo.tensorify?.pluginType,
      tensorify: packageInfo.tensorify,

      // Frontend Configuration
      frontendConfigs: {
        id: derivedId,
        name: derivedName,
        category: derivedNodeType,
        nodeType: derivedNodeType,
        visual: this.definition.visual,
        inputHandles: this.definition.inputHandles,
        outputHandles: this.definition.outputHandles,
        settingsFields: this.definition.settingsFields,
        settingsGroups: this.definition.settingsGroups,
      },

      // Plugin Metadata
      capabilities: this.definition.capabilities,
      requirements: this.definition.requirements,

      // Emits (variables/imports) are included in manifest; ensure arrays exist
      emits: {
        variables: this.definition.emits?.variables || [],
        imports: this.definition.emits?.imports || [],
      },

      // Generation Metadata
      sdkVersion: TensorifyPlugin.SDK_VERSION,
      generatedAt: new Date().toISOString(),
      manifestVersion: TensorifyPlugin.MANIFEST_VERSION,
    };

    return manifest;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Create default settings object from field definitions
   */
  public createDefaultSettings(): PluginSettings {
    const settings: PluginSettings = {
      variableName: `${this.definition.id || "plugin"}_${Date.now()}`,
      labelName: this.definition.name || "Plugin",
    };

    for (const field of this.definition.settingsFields) {
      if (field.defaultValue !== undefined) {
        settings[field.key] = field.defaultValue;
      }
    }

    return settings;
  }

  /**
   * Process dynamic label template with settings values
   */
  public generateDynamicLabel(settings: PluginSettings): string {
    const template = this.definition.visual.labels.dynamicLabelTemplate;
    if (!template) return "";

    let result = template;
    for (const [key, value] of Object.entries(settings)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, "g"), String(value));
    }

    return result;
  }

  /**
   * Get current SDK version
   */
  public static getSDKVersion(): string {
    return TensorifyPlugin.SDK_VERSION;
  }

  /**
   * Get manifest format version
   */
  public static getManifestVersion(): string {
    return TensorifyPlugin.MANIFEST_VERSION;
  }
}
