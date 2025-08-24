import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/ui/collapsible";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Separator } from "@/app/_components/ui/separator";
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  Calculator,
  ChevronDownIcon,
  ChevronRightIcon,
  Plus,
  Trash2,
  Variable,
  Settings,
  ClipboardIcon,
  Wand2,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import useWorkflowStore, { NodeMode } from "../../../store/workflowStore";
import type { ConstantsNodeData, ConstantVariable } from "../ConstantsNode";
import { NodeType } from "@packages/sdk/src/types/core";

interface ConstantsNodeSettingsProps {
  nodeId: string;
  onSettingsChange: (data: Partial<ConstantsNodeData>) => void;
}

export function ConstantsNodeSettings({
  nodeId,
  onSettingsChange,
}: ConstantsNodeSettingsProps) {
  const { nodes } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);

  // Cast node data to our specific type
  const constantsData = (node?.data || {}) as ConstantsNodeData;

  // Local state management
  const [nodeMode, setNodeMode] = useState<NodeMode>(
    (node?.data as any)?.nodeMode || NodeMode.WORKFLOW
  );
  const [constants, setConstants] = useState<ConstantVariable[]>(
    constantsData.constants || []
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["node-mode", "constants-definition"])
  );
  const [pasteInput, setPasteInput] = useState<string>("");

  // Debounced save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback(
    (data: Partial<ConstantsNodeData>) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onSettingsChange(data);
      }, 300);
    },
    [onSettingsChange]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Handle node mode change
  const handleNodeModeChange = useCallback(
    (newMode: NodeMode) => {
      setNodeMode(newMode);
      debouncedSave({
        nodeMode: newMode,
      });
    },
    [debouncedSave]
  );

  // Handle constants change and update emits config
  const handleConstantsChange = useCallback(
    (newConstants: ConstantVariable[]) => {
      setConstants(newConstants);

      // Generate emits config based on enabled constants
      const emitsConfig = {
        variables: newConstants
          .filter((c) => c.isEnabled && c.name.trim() !== "")
          .map((constant) => ({
            value: constant.name,
            switchKey: `emit_${constant.name}`,
            isOnByDefault: constant.isEnabled,
            type: NodeType.FUNCTION, // Constants are treated as generic variables
          })),
        imports: [], // Constants don't need imports
      };

      debouncedSave({
        constants: newConstants,
        emitsConfig,
      });
    },
    [debouncedSave]
  );

  // Add new constant
  const addConstant = () => {
    const newConstant: ConstantVariable = {
      name: `constant_${constants.length + 1}`,
      value: "",
      type: "string",
      isEnabled: true,
    };
    handleConstantsChange([...constants, newConstant]);
  };

  // Remove constant
  const removeConstant = (index: number) => {
    const newConstants = constants.filter((_, i) => i !== index);
    handleConstantsChange(newConstants);
  };

  // Update constant
  const updateConstant = (
    index: number,
    updates: Partial<ConstantVariable>
  ) => {
    const newConstants = constants.map((constant, i) =>
      i === index ? { ...constant, ...updates } : constant
    );
    handleConstantsChange(newConstants);
  };

  // Validate constant value based on type
  const validateConstantValue = (
    value: string,
    type: ConstantVariable["type"]
  ): boolean => {
    if (value.trim() === "") return false;

    switch (type) {
      case "integer":
        return !isNaN(parseInt(value)) && isFinite(parseInt(value));
      case "double":
        return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
      case "string":
        return true; // String can be anything
      default:
        return false;
    }
  };

  // Format value for display in code
  const formatValueForCode = (
    value: string,
    type: ConstantVariable["type"]
  ): string => {
    switch (type) {
      case "string":
        return `"${value}"`;
      case "integer":
        return parseInt(value).toString();
      case "double":
        return parseFloat(value).toString();
      default:
        return value;
    }
  };

  // Auto-detect type based on value
  const detectType = (value: string): ConstantVariable["type"] => {
    const trimmedValue = value.trim();

    // Check if it's an integer
    if (/^-?\d+$/.test(trimmedValue)) {
      return "integer";
    }

    // Check if it's a float/double
    if (
      /^-?\d*\.\d+$/.test(trimmedValue) ||
      /^-?\d+\.\d*$/.test(trimmedValue)
    ) {
      return "double";
    }

    // Check if it's a quoted string
    if (
      (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
      (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
    ) {
      return "string";
    }

    // Default to string for everything else
    return "string";
  };

  // Parse pasted constants from text
  const parseConstants = (text: string): ConstantVariable[] => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const parsedConstants: ConstantVariable[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (
        !trimmedLine ||
        trimmedLine.startsWith("#") ||
        trimmedLine.startsWith("//")
      ) {
        continue;
      }

      // Match various assignment patterns:
      // BATCH_SIZE = 64
      // LR = 0.01
      // MODEL_NAME = "resnet18"
      // const EPOCHS = 3
      // let learning_rate = 0.001
      const assignmentRegex =
        /^(?:const\s+|let\s+|var\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/;
      const match = trimmedLine.match(assignmentRegex);

      if (match) {
        const [, name, valueStr] = match;
        let value = valueStr.trim();

        // Remove trailing semicolon if present
        if (value.endsWith(";")) {
          value = value.slice(0, -1).trim();
        }

        // Remove quotes for string values to store the raw value
        let cleanValue = value;
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          cleanValue = value.slice(1, -1);
        }

        const detectedType = detectType(value);

        parsedConstants.push({
          name: name.trim(),
          value: cleanValue,
          type: detectedType,
          isEnabled: true,
        });
      }
    }

    return parsedConstants;
  };

  // Handle paste and parse
  const handlePasteAndParse = () => {
    if (!pasteInput.trim()) return;

    const parsedConstants = parseConstants(pasteInput);
    if (parsedConstants.length > 0) {
      // Merge with existing constants, avoiding duplicates
      const existingNames = new Set(constants.map((c) => c.name));
      const newConstants = parsedConstants.filter(
        (c) => !existingNames.has(c.name)
      );

      if (newConstants.length > 0) {
        handleConstantsChange([...constants, ...newConstants]);
      }

      // Clear the paste input
      setPasteInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Constants Node</CardTitle>
          </div>
          <CardDescription>
            Define constant values that can be used by downstream nodes.
            Constants are emitted as variables that other nodes can access.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Node Mode Section */}
      <Card>
        <Collapsible
          open={expandedSections.has("node-mode")}
          onOpenChange={() => toggleSection("node-mode")}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <CardTitle className="text-base">Node Mode</CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {nodeMode === NodeMode.WORKFLOW
                      ? "Workflow"
                      : "Variable Provider"}
                  </Badge>
                </div>
                {expandedSections.has("node-mode") ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </div>
              <CardDescription>
                Configure how this constants node behaves in your workflow
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label
                  htmlFor="node-mode-select"
                  className="text-sm font-medium"
                >
                  Node Behavior
                </Label>
                <Select
                  value={nodeMode}
                  onValueChange={(value: NodeMode) =>
                    handleNodeModeChange(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NodeMode.WORKFLOW}>
                      Workflow Mode
                    </SelectItem>
                    <SelectItem value={NodeMode.VARIABLE_PROVIDER}>
                      Variable Provider Mode
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-xs text-muted-foreground space-y-2">
                  {nodeMode === NodeMode.WORKFLOW ? (
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Workflow Mode:
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Node has prev/next connections and participates in the
                        execution flow. Constants are defined at the beginning
                        of the workflow.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-800">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Variable Provider Mode:
                      </p>
                      <p className="text-green-700 dark:text-green-300">
                        Node only emits variables that other nodes can use. No
                        workflow connections, only variable output handles.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Constants Definition Section */}
      <Card>
        <Collapsible
          open={expandedSections.has("constants-definition")}
          onOpenChange={() => toggleSection("constants-definition")}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Variable className="w-4 h-4" />
                  <CardTitle className="text-base">
                    Constants Definition
                  </CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {constants.filter((c) => c.isEnabled).length} enabled
                  </Badge>
                </div>
                {expandedSections.has("constants-definition") ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </div>
              <CardDescription>
                Define constants with their names, values, and data types
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Constants List */}
              <div className="space-y-3">
                {constants.map((constant, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      constant.isEnabled
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-muted/30"
                    )}
                  >
                    <div className="space-y-3">
                      {/* Header with toggle and delete */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={constant.isEnabled}
                            onChange={(e) =>
                              updateConstant(index, {
                                isEnabled: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300"
                          />
                          <Label className="text-sm font-medium">
                            Constant {index + 1}
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConstant(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Constant configuration */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Name */}
                        <div className="space-y-1">
                          <Label
                            htmlFor={`constant-name-${index}`}
                            className="text-xs"
                          >
                            Variable Name
                          </Label>
                          <Input
                            id={`constant-name-${index}`}
                            value={constant.name}
                            onChange={(e) =>
                              updateConstant(index, { name: e.target.value })
                            }
                            placeholder="constant_name"
                            className="text-sm"
                          />
                        </div>

                        {/* Type */}
                        <div className="space-y-1">
                          <Label
                            htmlFor={`constant-type-${index}`}
                            className="text-xs"
                          >
                            Data Type
                          </Label>
                          <Select
                            value={constant.type}
                            onValueChange={(value: ConstantVariable["type"]) =>
                              updateConstant(index, { type: value })
                            }
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="integer">Integer</SelectItem>
                              <SelectItem value="double">Double</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Value */}
                        <div className="space-y-1">
                          <Label
                            htmlFor={`constant-value-${index}`}
                            className="text-xs"
                          >
                            Value
                          </Label>
                          <Input
                            id={`constant-value-${index}`}
                            value={constant.value.toString()}
                            onChange={(e) =>
                              updateConstant(index, { value: e.target.value })
                            }
                            placeholder={
                              constant.type === "string"
                                ? "Enter text"
                                : constant.type === "integer"
                                  ? "123"
                                  : "3.14"
                            }
                            className={cn(
                              "text-sm",
                              !validateConstantValue(
                                constant.value.toString(),
                                constant.type
                              ) && constant.value.toString().trim() !== ""
                                ? "border-destructive"
                                : ""
                            )}
                          />
                        </div>
                      </div>

                      {/* Preview */}
                      {constant.isEnabled &&
                        constant.name &&
                        validateConstantValue(
                          constant.value.toString(),
                          constant.type
                        ) && (
                          <div className="bg-muted/50 rounded-md p-2">
                            <code className="text-xs text-muted-foreground font-mono">
                              {constant.name} ={" "}
                              {formatValueForCode(
                                constant.value.toString(),
                                constant.type
                              )}
                            </code>
                          </div>
                        )}

                      {/* Validation error */}
                      {constant.value.toString().trim() !== "" &&
                        !validateConstantValue(
                          constant.value.toString(),
                          constant.type
                        ) && (
                          <div className="text-xs text-destructive">
                            Invalid {constant.type} value
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {constants.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No constants defined yet</p>
                    <p className="text-xs">
                      Add constants to emit them as variables
                    </p>
                  </div>
                )}
              </div>

              {/* Add Constant Button */}
              <Button
                onClick={addConstant}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Constant
              </Button>

              {/* Paste Constants Section */}
              <div className="space-y-3 pt-2">
                <Separator />
                <div className="flex items-center space-x-2">
                  <ClipboardIcon className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Paste Constants</Label>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder={`Paste your constants here, e.g.:
BATCH_SIZE = 64
LR = 0.01
EPOCHS = 3
MODEL_NAME = "resnet18"`}
                    value={pasteInput}
                    onChange={(e) => setPasteInput(e.target.value)}
                    className="min-h-[100px] text-sm font-mono"
                    rows={4}
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handlePasteAndParse}
                      disabled={!pasteInput.trim()}
                      size="sm"
                      className="flex-1"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Parse & Add Constants
                    </Button>
                    {pasteInput.trim() && (
                      <Button
                        onClick={() => setPasteInput("")}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {pasteInput.trim() && (
                    <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
                      <div className="font-medium mb-1">Supported formats:</div>
                      <div className="space-y-1">
                        • <code>VARIABLE_NAME = value</code>•{" "}
                        <code>const VARIABLE_NAME = value</code>•{" "}
                        <code>let variable_name = value</code>• Auto-detects
                        types: integers, floats, strings • Ignores comments (#
                        and //)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated Variables Preview */}
              {constants.filter((c) => c.isEnabled && c.name.trim() !== "")
                .length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Emitted Variables
                    </Label>
                    <div className="bg-muted/30 rounded-md p-3 border">
                      <div className="space-y-1">
                        {constants
                          .filter((c) => c.isEnabled && c.name.trim() !== "")
                          .map((constant, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <Badge variant="secondary" className="text-xs">
                                {constant.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ({constant.type})
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
