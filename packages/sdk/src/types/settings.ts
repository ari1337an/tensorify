/**
 * Settings field types for the Tensorify SDK
 * Defines how plugin settings are configured and validated
 */

// ========================================
// SETTINGS UI COMPONENT TYPES
// ========================================

/**
 * UI component types available for settings fields
 */
export enum SettingsUIType {
  // Text Input
  INPUT_TEXT = "input-text",
  TEXTAREA = "textarea",

  // Numeric Input
  INPUT_NUMBER = "input-number",
  SLIDER = "slider",

  // Boolean Input
  TOGGLE = "toggle",
  CHECKBOX = "checkbox",

  // Selection Input
  DROPDOWN = "dropdown",
  RADIO = "radio",
  MULTI_SELECT = "multi-select",

  // Advanced Input
  CODE_EDITOR = "code-editor",
  FILE_UPLOAD = "file-upload",
  COLOR_PICKER = "color-picker",
  DATE_PICKER = "date-picker",
}

/**
 * Data types for settings fields
 */
export enum SettingsDataType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
  FILE = "file",
  DATE = "date",
  COLOR = "color",
}

// ========================================
// SETTINGS FIELD CONFIGURATION
// ========================================

/**
 * Options for dropdown and radio fields
 */
export interface SelectOption {
  /** Display text */
  label: string;
  /** Actual value */
  value: any;
  /** Optional description */
  description?: string;
  /** Whether option is selectable */
  disabled?: boolean;
}

/**
 * Validation rules for settings fields
 */
export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  /** For numeric fields */
  min?: number;
  /** For numeric fields */
  max?: number;
  /** Regex pattern */
  pattern?: string;
  /** Custom validation function */
  customValidator?: string;
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Conditional display rules for settings fields
 */
export interface ConditionalDisplay {
  /** Field key this depends on */
  dependsOn: string;
  /** Condition type */
  condition:
    | "equals"
    | "not-equals"
    | "greater-than"
    | "less-than"
    | "contains"
    | "not-contains";
  /** Value to compare against */
  value: any;
}

/**
 * Complete settings field definition
 */
export interface SettingsField {
  /** Maps to settings object key */
  key: string;
  /** UI display label */
  label: string;
  /** UI component type */
  type: SettingsUIType;
  /** Underlying data type */
  dataType: SettingsDataType;
  /** Default value */
  defaultValue?: any;
  /** Validation requirement */
  required: boolean;
  /** Help text/tooltip */
  description?: string;
  /** Validation rules */
  validation?: FieldValidation;
  /** Show/hide based on other fields */
  conditionalDisplay?: ConditionalDisplay;
  /** For dropdown/radio fields */
  options?: SelectOption[];
  /** Input placeholder text */
  placeholder?: string;
  /** Grouping for UI organization */
  group?: string;
  /** Field order within group */
  order?: number;
}

/**
 * Settings field grouping for UI organization
 */
export interface SettingsGroup {
  /** Unique group identifier */
  id: string;
  /** Display label for the group */
  label: string;
  /** Optional description */
  description?: string;
  /** Whether the group can be collapsed */
  collapsible: boolean;
  /** Whether the group is expanded by default */
  defaultExpanded: boolean;
  /** Field keys in this group */
  fields: string[];
  /** Display order */
  order?: number;
}

// ========================================
// SETTINGS VALIDATION HELPERS
// ========================================

/**
 * Type mapping for UI components to data types
 * Used for validation during plugin development
 */
export const UI_TYPE_TO_DATA_TYPE_MAP: Record<
  SettingsUIType,
  SettingsDataType[]
> = {
  [SettingsUIType.INPUT_TEXT]: [SettingsDataType.STRING],
  [SettingsUIType.TEXTAREA]: [SettingsDataType.STRING],
  [SettingsUIType.INPUT_NUMBER]: [SettingsDataType.NUMBER],
  [SettingsUIType.SLIDER]: [SettingsDataType.NUMBER],
  [SettingsUIType.TOGGLE]: [SettingsDataType.BOOLEAN],
  [SettingsUIType.CHECKBOX]: [SettingsDataType.BOOLEAN],
  [SettingsUIType.DROPDOWN]: [
    SettingsDataType.STRING,
    SettingsDataType.NUMBER,
    SettingsDataType.BOOLEAN,
  ],
  [SettingsUIType.RADIO]: [
    SettingsDataType.STRING,
    SettingsDataType.NUMBER,
    SettingsDataType.BOOLEAN,
  ],
  [SettingsUIType.MULTI_SELECT]: [SettingsDataType.ARRAY],
  [SettingsUIType.CODE_EDITOR]: [SettingsDataType.STRING],
  [SettingsUIType.FILE_UPLOAD]: [SettingsDataType.FILE],
  [SettingsUIType.COLOR_PICKER]: [SettingsDataType.COLOR],
  [SettingsUIType.DATE_PICKER]: [SettingsDataType.DATE],
};

/**
 * Default values for different data types
 */
export const DEFAULT_VALUES: Record<SettingsDataType, any> = {
  [SettingsDataType.STRING]: "",
  [SettingsDataType.NUMBER]: 0,
  [SettingsDataType.BOOLEAN]: false,
  [SettingsDataType.ARRAY]: [],
  [SettingsDataType.OBJECT]: {},
  [SettingsDataType.FILE]: null,
  [SettingsDataType.DATE]: new Date(),
  [SettingsDataType.COLOR]: "#000000",
};
