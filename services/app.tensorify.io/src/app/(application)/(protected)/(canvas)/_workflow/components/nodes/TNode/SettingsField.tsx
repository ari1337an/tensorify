import React from "react";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Switch } from "@/app/_components/ui/switch";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Badge } from "@/app/_components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Slider } from "@/app/_components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group";
import { AlertCircleIcon, InfoIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";
import type { SettingsFieldSchema as _SF } from "@tensorify.io/contracts";
export type SettingsFieldType = import("zod").infer<typeof _SF>;

interface SettingsFieldProps {
  field: SettingsFieldType;
  value: any;
  onChange: (value: any) => void;
  allSettings: Record<string, any>;
}

export function SettingsField({
  field,
  value,
  onChange,
  allSettings,
}: SettingsFieldProps) {
  const [validationError, setValidationError] = React.useState<string>("");
  const [localValue, setLocalValue] = React.useState<any>(value);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Get the current value, falling back to default
  const currentValue = value !== undefined ? value : field.defaultValue;

  // Check conditional display
  const shouldShow = React.useMemo(() => {
    if (!field.conditionalDisplay) return true;

    const {
      dependsOn,
      condition,
      value: conditionValue,
    } = field.conditionalDisplay;
    const dependentValue = allSettings[dependsOn];

    switch (condition) {
      case "equals":
        return dependentValue === conditionValue;
      case "not-equals":
        return dependentValue !== conditionValue;
      case "greater-than":
        return dependentValue > conditionValue;
      case "less-than":
        return dependentValue < conditionValue;
      case "contains":
        return String(dependentValue).includes(String(conditionValue));
      case "not-contains":
        return !String(dependentValue).includes(String(conditionValue));
      default:
        return true;
    }
  }, [field.conditionalDisplay, allSettings]);

  // Validation function
  const validateValue = React.useCallback(
    (val: any): string => {
      if (!field.validation) return "";

      const validation = field.validation;

      // Required field validation
      if (field.required && (val === undefined || val === null || val === "")) {
        return `${field.label} is required`;
      }

      // Skip other validations if field is empty and not required
      if (
        !field.required &&
        (val === undefined || val === null || val === "")
      ) {
        return "";
      }

      // Type-specific validations
      if (field.dataType === "string" && typeof val === "string") {
        if (validation.minLength && val.length < validation.minLength) {
          return `${field.label} must be at least ${validation.minLength} characters`;
        }
        if (validation.maxLength && val.length > validation.maxLength) {
          return `${field.label} must be no more than ${validation.maxLength} characters`;
        }
        if (validation.pattern) {
          try {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(val)) {
              return (
                validation.errorMessage || `${field.label} format is invalid`
              );
            }
          } catch (e) {
            console.warn("Invalid regex pattern:", validation.pattern);
          }
        }
      }

      if (field.dataType === "number" && typeof val === "number") {
        if (validation.min !== undefined && val < validation.min) {
          return `${field.label} must be at least ${validation.min}`;
        }
        if (validation.max !== undefined && val > validation.max) {
          return `${field.label} must be no more than ${validation.max}`;
        }
      }

      if (field.dataType === "array" && Array.isArray(val)) {
        if (validation.minLength && val.length < validation.minLength) {
          return `${field.label} must have at least ${validation.minLength} items`;
        }
        if (validation.maxLength && val.length > validation.maxLength) {
          return `${field.label} must have no more than ${validation.maxLength} items`;
        }
      }

      return "";
    },
    [field]
  );

  // Sync local value with prop value
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle value change with debounced validation and save
  const handleChange = React.useCallback(
    (newValue: any) => {
      // Update local value immediately for responsive UI
      setLocalValue(newValue);

      // Clear any existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // For number inputs, don't validate or save empty strings immediately
      const isNumberField =
        field.type === "input-number" || field.dataType === "number";
      const isEmpty =
        newValue === "" || newValue === null || newValue === undefined;

      if (isNumberField && isEmpty) {
        // Just show a soft validation warning, don't trigger onChange yet
        if (field.required) {
          setValidationError(`${field.label} is required`);
        } else {
          setValidationError("");
        }

        // Debounce the actual save for empty values
        debounceTimerRef.current = setTimeout(() => {
          const defaultVal =
            field.defaultValue !== undefined ? field.defaultValue : 0;
          // Ensure default value is a number for number fields
          const finalDefaultVal =
            isNumberField && typeof defaultVal === "string"
              ? Number(defaultVal) || 0
              : defaultVal;
          onChange(finalDefaultVal);
        }, 1500); // Give user 1.5 seconds to type
        return;
      }

      // Validate immediately for UI feedback
      const error = validateValue(newValue);
      setValidationError(error);

      // Debounce the actual save
      debounceTimerRef.current = setTimeout(() => {
        // Convert string values to proper types before saving
        let valueToSave = newValue;
        if (isNumberField && typeof newValue === "string" && newValue !== "") {
          const numValue = Number(newValue);
          if (!isNaN(numValue)) {
            valueToSave = numValue;
          }
        }

        // Only save if validation passes
        if (!error) {
          onChange(valueToSave);
        } else if (field.validation?.min !== undefined && isNumberField) {
          // For number fields with min validation, use min value instead of blocking
          onChange(field.validation.min);
        }
      }, 500); // 500ms debounce for normal typing
    },
    [onChange, validateValue, field]
  );

  // Cleanup debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Validate on mount and when value changes
  React.useEffect(() => {
    const error = validateValue(currentValue);
    setValidationError(error);
  }, [currentValue, validateValue]);

  // Don't render if conditionally hidden
  if (!shouldShow) return null;

  const renderField = () => {
    switch (field.type) {
      case "input-text":
        return (
          <Input
            type="text"
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn(validationError && "border-destructive")}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              "min-h-[100px] resize-none",
              validationError && "border-destructive"
            )}
          />
        );

      case "input-number":
        return (
          <Input
            type="number"
            value={
              localValue !== undefined && localValue !== null ? localValue : ""
            }
            onChange={(e) => {
              const val = e.target.value === "" ? "" : e.target.value;
              handleChange(val);
            }}
            onBlur={(e) => {
              // On blur, convert to number if valid
              const stringVal = e.target.value;
              if (stringVal === "") {
                handleChange(undefined);
              } else {
                const numVal = Number(stringVal);
                if (!isNaN(numVal)) {
                  handleChange(numVal);
                }
              }
            }}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={cn(validationError && "border-destructive")}
          />
        );

      case "slider":
        const min = field.validation?.min || 0;
        const max = field.validation?.max || 100;
        const sliderValue =
          currentValue !== undefined ? [Number(currentValue)] : [min];

        return (
          <div className="space-y-2">
            <Slider
              value={sliderValue}
              onValueChange={(values) => handleChange(values[0])}
              min={min}
              max={max}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{min}</span>
              <span className="font-medium">{currentValue || min}</span>
              <span>{max}</span>
            </div>
          </div>
        );

      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(currentValue)}
              onCheckedChange={handleChange}
              id={`toggle-${field.key}`}
            />
            <Label htmlFor={`toggle-${field.key}`} className="text-sm">
              {currentValue ? "Enabled" : "Disabled"}
            </Label>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(currentValue)}
              onCheckedChange={handleChange}
              id={`checkbox-${field.key}`}
            />
            <Label htmlFor={`checkbox-${field.key}`} className="text-sm">
              {field.label}
            </Label>
          </div>
        );

      case "dropdown":
        return (
          <Select value={currentValue || ""} onValueChange={handleChange}>
            <SelectTrigger
              className={cn(validationError && "border-destructive")}
            >
              <SelectValue
                placeholder={field.placeholder || `Select ${field.label}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  <div>
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={currentValue || ""}
            onValueChange={handleChange}
            className="grid grid-cols-1 gap-2"
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String(option.value)}
                  id={`radio-${field.key}-${option.value}`}
                  disabled={option.disabled}
                />
                <Label
                  htmlFor={`radio-${field.key}-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  <div>
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multi-select":
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];

        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      let newValues;
                      if (checked) {
                        newValues = [...selectedValues, option.value];
                      } else {
                        newValues = selectedValues.filter(
                          (v) => v !== option.value
                        );
                      }
                      handleChange(newValues);
                    }}
                    id={`multi-${field.key}-${option.value}`}
                    disabled={option.disabled}
                  />
                  <Label
                    htmlFor={`multi-${field.key}-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    <div>
                      <div>{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedValues.map((value) => {
                  const option = field.options?.find(
                    (opt) => opt.value === value
                  );
                  return (
                    <Badge key={value} variant="secondary" className="text-xs">
                      {option?.label || value}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "code-editor":
        return (
          <Textarea
            value={currentValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || "Enter code..."}
            className={cn(
              "min-h-[120px] resize-none font-mono text-sm",
              validationError && "border-destructive"
            )}
          />
        );

      case "file-upload":
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleChange(file || null);
              }}
              className={cn(validationError && "border-destructive")}
            />
            {currentValue && (
              <div className="text-sm text-muted-foreground">
                Selected: {currentValue.name || currentValue}
              </div>
            )}
          </div>
        );

      case "color-picker":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={currentValue || "#000000"}
              onChange={(e) => handleChange(e.target.value)}
              className="w-12 h-10 p-1 border rounded"
            />
            <Input
              type="text"
              value={currentValue || "#000000"}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="#000000"
              className={cn("flex-1", validationError && "border-destructive")}
            />
          </div>
        );

      case "date-picker":
        return (
          <Input
            type="datetime-local"
            value={currentValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(validationError && "border-destructive")}
          />
        );

      default:
        return (
          <div className="p-4 border border-dashed border-muted-foreground/50 rounded-md text-center">
            <p className="text-sm text-muted-foreground">
              Unsupported field type: {field.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label
          htmlFor={field.key}
          className="text-sm font-medium flex items-center gap-2"
        >
          <span className="capitalize">{field.label}</span>
          {field.required && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
          {field.description && (
            <div className="group relative">
              <InfoIcon className="h-3 w-3 text-muted-foreground cursor-help" />
              <div className="absolute left-0 top-5 z-10 w-64 p-2 bg-popover border border-border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <p className="text-xs">{field.description}</p>
              </div>
            </div>
          )}
        </Label>
      </div>

      {renderField()}

      {validationError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
