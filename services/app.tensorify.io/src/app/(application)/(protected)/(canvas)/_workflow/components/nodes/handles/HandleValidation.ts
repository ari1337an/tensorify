/**
 * Handle validation utilities for custom plugin nodes
 * Implements validation rules from visual.ts types
 */

import {
  HandleDataType,
  HandleValidation,
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";
import { NodeType } from "@packages/sdk/src/types/core";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ConnectionValidationParams {
  source: string;
  sourceHandle: string | null;
  target: string;
  targetHandle: string | null;
}

/**
 * Validates data type compatibility between source and target handles
 */
export function validateDataTypeCompatibility(
  sourceType: HandleDataType,
  targetType: HandleDataType
): boolean {
  // "any" type is compatible with everything
  if (sourceType === "any" || targetType === "any") return true;

  // Exact type matches
  if (sourceType === targetType) return true;

  // Compatible node type mappings for variable providers
  const compatibilityMap: Record<string, string[]> = {
    dataset: ["dataloader"], // dataset can connect to dataloader
    model_layer: ["sequence"], // model layers can connect to sequences
    model: ["trainer", "evaluator"], // models can connect to trainers/evaluators
    dataloader: ["trainer"], // dataloaders can connect to trainers
  };

  // Check if sourceType can connect to targetType
  if (compatibilityMap[sourceType]?.includes(targetType)) return true;

  // Basic type compatibility (fallback for flexibility)
  const basicTypes = ["string", "number", "boolean", "object", "array"];
  if (basicTypes.includes(sourceType) && basicTypes.includes(targetType)) {
    return true; // Allow basic type connections for flexibility
  }

  return false;
}

/**
 * Validates input value against handle validation rules
 */
export function validateHandleInput(
  value: any,
  handle: InputHandle
): ValidationResult {
  const errors: string[] = [];

  // Check data type
  if (!validateValueDataType(value, handle.dataType)) {
    errors.push(`Expected ${handle.dataType}, got ${typeof value}`);
  }

  // Apply validation rules if present
  if (handle.validation) {
    const validationErrors = applyValidationRules(value, handle.validation);
    errors.push(...validationErrors);
  }

  // Check required field
  if (
    handle.required &&
    (value === null || value === undefined || value === "")
  ) {
    errors.push(`${handle.label || handle.id} is required`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates if a value matches the expected data type
 */
function validateValueDataType(
  value: any,
  expectedType: HandleDataType
): boolean {
  if (expectedType === "any") return true;

  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !isNaN(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return (
        typeof value === "object" && value !== null && !Array.isArray(value)
      );
    case "array":
      return Array.isArray(value);

    // Node types for variable providers - validate variable name structure
    case "dataset":
    case "dataloader":
    case "model":
    case "model_layer":
    case "sequence":
    case "trainer":
    case "evaluator":
    case "preprocessor":
    case "postprocessor":
    case "augmentation_stack":
    case "optimizer":
    case "loss_function":
    case "metric":
    case "scheduler":
    case "regularizer":
    case "function":
    case "pipeline":
    case "report":
    case "custom":
      // For node types, we expect either a variable name (string) or variable object
      return (
        typeof value === "string" ||
        (typeof value === "object" && value !== null && "variableName" in value)
      );

    default:
      return false;
  }
}

/**
 * Applies validation rules to a value
 */
function applyValidationRules(
  value: any,
  validation: HandleValidation
): string[] {
  const errors: string[] = [];

  // String/Array length validation
  if (validation.minLength !== undefined) {
    const length =
      typeof value === "string"
        ? value.length
        : Array.isArray(value)
          ? value.length
          : Object.keys(value || {}).length;

    if (length < validation.minLength) {
      errors.push(`Minimum length is ${validation.minLength}, got ${length}`);
    }
  }

  if (validation.maxLength !== undefined) {
    const length =
      typeof value === "string"
        ? value.length
        : Array.isArray(value)
          ? value.length
          : Object.keys(value || {}).length;

    if (length > validation.maxLength) {
      errors.push(`Maximum length is ${validation.maxLength}, got ${length}`);
    }
  }

  // Pattern validation
  if (validation.pattern && typeof value === "string") {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      errors.push(
        `Value does not match required pattern: ${validation.pattern}`
      );
    }
  }

  // Custom validation (would need to be implemented per plugin)
  if (validation.customValidator) {
    // This would typically call a plugin-specific validation function
    // For now, we'll just log that custom validation is needed
    console.warn(
      `Custom validation "${validation.customValidator}" not implemented for value:`,
      value
    );
  }

  return errors;
}

/**
 * Validates connection between two handles
 */
export function validateConnection(
  sourceHandle: OutputHandle,
  targetHandle: InputHandle,
  params: ConnectionValidationParams
): ValidationResult {
  const errors: string[] = [];

  // Check data type compatibility
  if (
    !validateDataTypeCompatibility(sourceHandle.dataType, targetHandle.dataType)
  ) {
    errors.push(
      `Incompatible types: Cannot connect ${sourceHandle.dataType} to ${targetHandle.dataType}`
    );
  }

  // Additional validation for variable provider connections
  if (isVariableProviderType(sourceHandle.dataType)) {
    // Variable providers should only connect to compatible workflow nodes
    if (!isWorkflowCompatibleType(targetHandle.dataType)) {
      errors.push(
        `Variable provider of type ${sourceHandle.dataType} cannot connect to ${targetHandle.dataType}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if a data type is a variable provider type
 */
function isVariableProviderType(dataType: HandleDataType): boolean {
  const variableProviderTypes = [
    "dataset",
    "dataloader",
    "model",
    "model_layer",
    "sequence",
    "trainer",
    "evaluator",
    "preprocessor",
    "postprocessor",
    "augmentation_stack",
    "optimizer",
    "loss_function",
    "metric",
    "scheduler",
    "regularizer",
    "function",
    "pipeline",
    "report",
    "custom",
  ];
  return variableProviderTypes.includes(dataType);
}

/**
 * Checks if a data type is compatible with workflow connections
 */
function isWorkflowCompatibleType(dataType: HandleDataType): boolean {
  // Basic types and node types are workflow compatible
  return true; // Allow flexibility for now, can be tightened later
}

/**
 * Validates connections specifically for variable provider nodes
 */
export function validateVariableProviderConnection(
  params: ConnectionValidationParams,
  sourceNode: any,
  targetNode: any,
  availableVariableDetailsByNodeId: Record<
    string,
    Array<{
      name: string;
      sourceNodeId: string;
      sourceNodeType: string;
      pluginType: string;
      isEnabled: boolean;
    }>
  >,
  pluginManifests: any[]
): ValidationResult {
  const errors: string[] = [];

  // Check if source is a variable provider (has variable emits)
  const sourceVariables = availableVariableDetailsByNodeId[sourceNode.id] || [];
  const isVariableProvider = sourceVariables.length > 0;

  if (!isVariableProvider) {
    // Not a variable provider connection, use standard validation
    return { isValid: true, errors: [] };
  }

  // For variable provider connections, we need to validate the specific handle being connected
  const sourceHandle = params.sourceHandle;
  const targetHandle = params.targetHandle;

  // Skip standard workflow handles (prev/next)
  if (sourceHandle === "next" || targetHandle === "prev") {
    return { isValid: true, errors: [] };
  }

  // Find the emitted variable that corresponds to the source handle
  const emittedVariable = sourceVariables.find((variable) => {
    // Check for exact match first, then fallback to partial matches
    const exactMatch = sourceHandle === variable.name;
    const partialMatch = sourceHandle?.includes(variable.name);
    return exactMatch || partialMatch;
  });

  if (!emittedVariable) {
    // Can't find matching emitted variable, reject connection
    errors.push(
      `No emitted variable found for source handle "${sourceHandle}" from "${sourceNode.data?.label || sourceNode.id}"`
    );
    return { isValid: false, errors };
  }

  // Get the emitted variable type
  const emittedType = emittedVariable.pluginType;

  // Get target node's plugin manifest to find the expected input handle type
  const targetPluginId = targetNode.data?.pluginId || targetNode.type;
  const targetManifest = pluginManifests.find(
    (p) => p.slug === targetPluginId || p.id === targetPluginId
  );

  if (!targetManifest?.manifest) {
    // Can't find target manifest, reject connection
    errors.push(
      `No plugin manifest found for target node "${targetNode.data?.label || targetNode.id}"`
    );
    return { isValid: false, errors };
  }

  // Extract input handles from target manifest
  const fc = (targetManifest.manifest as any).frontendConfigs;
  const inputHandles =
    fc?.inputHandles || (targetManifest.manifest as any).inputHandles || [];

  // Find the specific input handle being connected to
  const targetInputHandle = inputHandles.find(
    (handle: any) => handle.id === targetHandle
  );

  if (!targetInputHandle) {
    // Can't find target input handle, reject connection
    errors.push(
      `No input handle "${targetHandle}" found in target node "${targetNode.data?.label || targetNode.id}"`
    );
    return { isValid: false, errors };
  }

  // Get the expected data type from the target input handle
  const expectedType = targetInputHandle.dataType;

  // Perform type compatibility check
  const isCompatible = checkTypeCompatibility(emittedType, expectedType);

  if (!isCompatible) {
    errors.push(
      `Type mismatch: Cannot connect type '${emittedType}' from node "${sourceNode.data?.label || sourceNode.id}" to type '${expectedType}' expected by node "${targetNode.data?.label || targetNode.id}"`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if two data types are compatible for variable provider connections
 */
function checkTypeCompatibility(
  emittedType: string,
  expectedType: string
): boolean {
  // Direct match
  if (emittedType === expectedType) {
    return true;
  }

  // Normalize enum values to strings for comparison
  const normalizeType = (type: string) => {
    if (typeof type === "object" && type !== null) {
      return String(type).toLowerCase();
    }
    return type.toLowerCase();
  };

  const normalizedEmitted = normalizeType(emittedType);
  const normalizedExpected = normalizeType(expectedType);

  // Check normalized match
  if (normalizedEmitted === normalizedExpected) {
    return true;
  }

  // Define compatible type mappings
  const compatibilityMap: Record<string, string[]> = {
    // Dataset types
    dataset: ["dataset", NodeType.DATASET.toLowerCase()],
    [NodeType.DATASET.toLowerCase()]: [
      "dataset",
      NodeType.DATASET.toLowerCase(),
    ],

    // DataLoader types
    dataloader: ["dataloader", NodeType.DATALOADER.toLowerCase()],
    [NodeType.DATALOADER.toLowerCase()]: [
      "dataloader",
      NodeType.DATALOADER.toLowerCase(),
    ],

    // Model layer types
    model_layer: ["model_layer", NodeType.MODEL_LAYER.toLowerCase()],
    [NodeType.MODEL_LAYER.toLowerCase()]: [
      "model_layer",
      NodeType.MODEL_LAYER.toLowerCase(),
    ],

    // Any type accepts everything
    any: ["*"],
  };

  // Check if types are compatible
  const compatibleTypes = compatibilityMap[normalizedEmitted];
  if (compatibleTypes) {
    const isCompatible =
      compatibleTypes.includes("*") ||
      compatibleTypes.includes(normalizedExpected);
    if (isCompatible) {
      return true;
    }
  }

  // Check reverse compatibility (expected type accepts emitted type)
  const expectedCompatibleTypes = compatibilityMap[normalizedExpected];
  if (expectedCompatibleTypes) {
    const isCompatible =
      expectedCompatibleTypes.includes("*") ||
      expectedCompatibleTypes.includes(normalizedEmitted);
    if (isCompatible) {
      return true;
    }
  }

  // If no explicit compatibility found, reject the connection
  // This ensures type safety for variable provider connections
  return false;
}

/**
 * Gets validation message for display
 */
export function getValidationMessage(result: ValidationResult): string {
  if (result.isValid) return "";
  return result.errors.join(", ");
}

/**
 * Custom validation functions registry
 * Plugins can register their own validation functions here
 */
export const customValidators: Record<
  string,
  (value: any) => ValidationResult
> = {
  // Example validators
  validateDataset: (value: any) => {
    if (!Array.isArray(value)) {
      return { isValid: false, errors: ["Dataset must be an array"] };
    }
    if (value.length < 10) {
      return {
        isValid: false,
        errors: ["Dataset must have at least 10 samples"],
      };
    }
    return { isValid: true, errors: [] };
  },

  validateBoolean: (value: any) => {
    if (typeof value !== "boolean") {
      return { isValid: false, errors: ["Value must be true or false"] };
    }
    return { isValid: true, errors: [] };
  },

  // Add more custom validators as needed
};

/**
 * Registers a custom validator function
 */
export function registerCustomValidator(
  name: string,
  validator: (value: any) => ValidationResult
): void {
  customValidators[name] = validator;
}
