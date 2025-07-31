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
  // 'any' type is compatible with everything
  if (sourceType === "any" || targetType === "any") {
    return true;
  }

  // Exact type match
  if (sourceType === targetType) {
    return true;
  }

  // Special compatibility rules
  const compatibilityRules: Record<HandleDataType, HandleDataType[]> = {
    string: ["any"],
    number: ["any"],
    boolean: ["any"],
    object: ["any"],
    array: ["any", "object"], // Arrays can sometimes be treated as objects
    any: ["string", "number", "boolean", "object", "array"],
  };

  return compatibilityRules[sourceType]?.includes(targetType) || false;
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
      `Data type mismatch: ${sourceHandle.dataType} cannot connect to ${targetHandle.dataType}`
    );
  }

  // Check if target handle is required and has no existing connections
  // This would need to be checked against the actual flow state

  return {
    isValid: errors.length === 0,
    errors,
  };
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
