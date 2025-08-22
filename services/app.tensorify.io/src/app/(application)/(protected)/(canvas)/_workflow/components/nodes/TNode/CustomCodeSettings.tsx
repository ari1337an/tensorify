import React, { useMemo, useState, useRef, useEffect } from "react";
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
import { Textarea } from "@/app/_components/ui/textarea";
import { Separator } from "@/app/_components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  Code,
  ChevronDownIcon,
  ChevronRightIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Variable,
  Import,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import useWorkflowStore from "../../../store/workflowStore";
import useAppStore from "@/app/_store/store";
import { useUIEngine } from "../../../engine/ui-engine";
import type { CustomCodeNodeData } from "../CustomCodeNode";
import { NodeType } from "@packages/sdk/src/types/core";
import {
  IntelligentCodeEditor,
  type AvailableVariable,
} from "../../common/IntelligentCodeEditor";

interface CustomCodeSettingsProps {
  nodeId: string;
  onSettingsChange: (data: Partial<CustomCodeNodeData>) => void;
}

// Available NodeType values for variable configuration
const NODE_TYPES = Object.values(NodeType);

// Common Python imports
const COMMON_IMPORTS = [
  { path: "torch", items: ["nn", "optim", "utils"] },
  { path: "torch.nn.functional", items: ["F"] },
  { path: "numpy", items: ["np"] },
  { path: "pandas", items: ["pd"] },
  { path: "matplotlib.pyplot", items: ["plt"] },
  { path: "typing", items: ["Any", "List", "Dict", "Tuple", "Optional"] },
];

export function CustomCodeSettings({
  nodeId,
  onSettingsChange,
}: CustomCodeSettingsProps) {
  const nodes = useWorkflowStore((state) => state.nodes);
  const node = nodes.find((n) => n.id === nodeId);
  const engine = useUIEngine();

  // Cast node data to our specific type
  const customCodeData = (node?.data || {}) as CustomCodeNodeData;

  // Local state management
  const [code, setCode] = useState(customCodeData.code || "");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["code-editor"])
  );

  // Get available variables from upstream nodes
  const availableVariables: AvailableVariable[] = useMemo(() => {
    const details = engine.availableVariableDetailsByNodeId[nodeId] || [];
    return details.map((d) => ({
      name: d.name,
      type: d.pluginType || "Any",
      sourceNode: d.sourceNodeType,
      sourceNodeId: d.sourceNodeId,
    }));
  }, [engine, nodeId]);

  // Variables and imports state
  const [emittedVariables, setEmittedVariables] = useState(
    customCodeData.emitsConfig?.variables || []
  );
  const [customImports, setCustomImports] = useState(
    customCodeData.customImports || []
  );

  // Local state for import items input to prevent cursor jumping
  const [importItemsInputs, setImportItemsInputs] = useState<
    Record<number, string>
  >({});

  // Debounced save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = (data: Partial<CustomCodeNodeData>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSettingsChange(data);
    }, 300);
  };

  // Clear local input state when imports change externally
  useEffect(() => {
    setImportItemsInputs({});
  }, [customImports.length]);

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

  // Handle emitted variables changes
  const handleEmittedVariablesChange = (newVariables: any[]) => {
    setEmittedVariables(newVariables);
    debouncedSave({
      emitsConfig: {
        ...customCodeData.emitsConfig,
        variables: newVariables,
      },
    });
  };

  // Handle imports changes
  const handleImportsChange = (newImports: any[]) => {
    setCustomImports(newImports);
    debouncedSave({
      customImports: newImports,
      emitsConfig: {
        ...customCodeData.emitsConfig,
        imports: newImports,
      },
    });
  };

  // Add new emitted variable
  const addEmittedVariable = () => {
    const newVariable = {
      value: `variable_${emittedVariables.length + 1}`,
      switchKey: `emitVar${emittedVariables.length + 1}`,
      isOnByDefault: true,
      type: NodeType.FUNCTION,
    };
    handleEmittedVariablesChange([...emittedVariables, newVariable]);
  };

  // Remove emitted variable
  const removeEmittedVariable = (index: number) => {
    const newVariables = emittedVariables.filter((_, i) => i !== index);
    handleEmittedVariablesChange(newVariables);
  };

  // Add new import
  const addCustomImport = () => {
    const newImport = { path: "", items: [""], as: {} };
    handleImportsChange([...customImports, newImport]);
  };

  // Remove import
  const removeCustomImport = (index: number) => {
    const newImports = customImports.filter((_, i) => i !== index);
    handleImportsChange(newImports);
  };

  // Update emitted variable
  const updateEmittedVariable = (index: number, field: string, value: any) => {
    const newVariables = [...emittedVariables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    handleEmittedVariablesChange(newVariables);
  };

  // Update import
  const updateCustomImport = (index: number, field: string, value: any) => {
    const newImports = [...customImports];
    if (field === "items") {
      const items = value
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s);

      // Update items and preserve existing aliases for items that still exist
      const currentAs = newImports[index].as || {};
      const newAs: Record<string, string> = {};
      items.forEach((item: string) => {
        if (currentAs[item]) {
          newAs[item] = currentAs[item];
        }
      });

      newImports[index] = {
        ...newImports[index],
        items,
        as: newAs,
      };
    } else {
      newImports[index] = { ...newImports[index], [field]: value };
    }
    handleImportsChange(newImports);
  };

  // Handle import items input with debouncing
  const handleImportItemsInput = (index: number, value: string) => {
    // Update local state immediately for smooth typing
    setImportItemsInputs((prev) => ({ ...prev, [index]: value }));

    // Debounce the actual update to prevent cursor jumping
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      updateCustomImport(index, "items", value);
    }, 300);
  };

  // Get the current value for import items input
  const getImportItemsInputValue = (index: number, items: string[]) => {
    // Use local state if available, otherwise join the actual items
    return importItemsInputs[index] !== undefined
      ? importItemsInputs[index]
      : items.join(", ");
  };

  // Update alias for specific item in import
  const updateImportAlias = (
    importIndex: number,
    item: string,
    alias: string
  ) => {
    const newImports = [...customImports];
    const currentAs = newImports[importIndex].as || {};

    if (alias.trim() === "") {
      // Remove alias if empty
      delete currentAs[item];
    } else {
      // Set alias
      currentAs[item] = alias.trim();
    }

    newImports[importIndex] = {
      ...newImports[importIndex],
      as: currentAs,
    };

    handleImportsChange(newImports);
  };

  // Generate import preview (simplified version of transpiler logic)
  const generateImportPreview = () => {
    if (customImports.length === 0) return "";

    const importLines: string[] = [];

    customImports.forEach((imp) => {
      if (imp.path && imp.items.length > 0) {
        const items = imp.items.filter((item: string) => item.trim() !== "");
        if (items.length === 0) return;

        const itemsWithAliases = items.map((item: string) => {
          const alias = imp.as && imp.as[item];
          return alias ? `${item} as ${alias}` : item;
        });

        importLines.push(
          `from ${imp.path} import ${itemsWithAliases.join(", ")}`
        );
      }
    });

    return importLines.join("\n");
  };

  // Generate syntax highlighted import preview
  const generateHighlightedImportPreview = () => {
    const plainCode = generateImportPreview();
    if (!plainCode) return "# No valid imports configured";

    // Apply syntax highlighting with inline styles
    return plainCode
      .replace(
        /\b(from|import|as)\b/g,
        '<span style="color: #C792EA; font-weight: bold;">$1</span>'
      )
      .replace(
        /(\w+(?:\.\w+)*?)(?=\s+import)/g,
        '<span style="color: #82AAFF;">$1</span>'
      )
      .replace(/import\s+([^as\n]+?)(?:\s+as\s+|\s*$)/g, (match, items) => {
        const highlightedItems = items.replace(
          /(\w+)/g,
          '<span style="color: #C3E88D;">$1</span>'
        );
        return `import ${highlightedItems}`;
      })
      .replace(/\bas\s+(\w+)/g, 'as <span style="color: #FFCB6B;">$1</span>');
  };

  // Handle code changes
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    debouncedSave({ code: newCode });
  };

  // Render section header
  const renderSectionHeader = (
    id: string,
    title: string,
    icon: React.ReactNode,
    badge?: string
  ) => {
    const isExpanded = expandedSections.has(id);
    return (
      <button
        onClick={() => toggleSection(id)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-muted/50">{icon}</div>
          <div className="text-left">
            <h3 className="font-medium text-sm text-foreground">{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {badge}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Custom Code Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Write custom Python code with intelligent variable injection and type
          inference
        </p>
      </div>

      {/* Code Editor Section */}
      <Card className="mb-4">
        <Collapsible
          open={expandedSections.has("code-editor")}
          onOpenChange={() => toggleSection("code-editor")}
        >
          <CollapsibleTrigger className="w-full">
            {renderSectionHeader(
              "code-editor",
              "Code Editor",
              <Code className="h-4 w-4" />,
              `${code.split("\n").length} lines`
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <IntelligentCodeEditor
                value={code}
                onChange={handleCodeChange}
                availableVariables={availableVariables}
                placeholder="# Write your Python code here...
# Use $variable_name to reference upstream variables
# Example:
# result = $input_tensor * 2
# return result"
                height="300px"
                showVariableHelper={true}
              />

              <div className="mt-2 text-xs text-muted-foreground">
                <p>• The code will be wrapped in a function automatically</p>
                <p>
                  • Return values using <code>return</code> statement
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Variable Emissions Section */}
      <Card className="mb-4">
        <Collapsible
          open={expandedSections.has("variable-emissions")}
          onOpenChange={() => toggleSection("variable-emissions")}
        >
          <CollapsibleTrigger className="w-full">
            {renderSectionHeader(
              "variable-emissions",
              "Variable Emissions",
              <Variable className="h-4 w-4" />,
              emittedVariables.length.toString()
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {emittedVariables.map((variable, index) => (
                <div key={index} className="p-3 border rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Variable {index + 1}
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmittedVariable(index)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Variable Name</Label>
                      <Input
                        value={variable.value}
                        onChange={(e) =>
                          updateEmittedVariable(index, "value", e.target.value)
                        }
                        placeholder="variable_name"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={variable.type}
                        onValueChange={(value) =>
                          updateEmittedVariable(index, "type", value)
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NODE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={addEmittedVariable}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Imports Section */}
      <Card className="mb-4">
        <Collapsible
          open={expandedSections.has("imports")}
          onOpenChange={() => toggleSection("imports")}
        >
          <CollapsibleTrigger className="w-full">
            {renderSectionHeader(
              "imports",
              "Custom Imports",
              <Import className="h-4 w-4" />,
              customImports.length.toString()
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Import Preview */}
              {customImports.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-md border">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    <Label className="text-xs font-medium">
                      Import Preview
                    </Label>
                  </div>
                  <div
                    className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: generateHighlightedImportPreview(),
                    }}
                  />
                </div>
              )}

              {/* Common Imports Quick Add */}
              <div className="p-3 bg-muted/30 rounded-md border">
                <Label className="text-xs font-medium mb-2 block">
                  Quick Add Common Imports
                </Label>
                <div className="flex flex-wrap gap-1">
                  {COMMON_IMPORTS.map((imp, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        if (
                          !customImports.some(
                            (existing) => existing.path === imp.path
                          )
                        ) {
                          handleImportsChange([...customImports, imp]);
                        }
                      }}
                    >
                      {imp.path}
                    </Button>
                  ))}
                </div>
              </div>

              {customImports.map((imp, index) => (
                <div key={index} className="p-3 border rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Import {index + 1}
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomImport(index)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Import Path</Label>
                      <Input
                        value={imp.path}
                        onChange={(e) =>
                          updateCustomImport(index, "path", e.target.value)
                        }
                        placeholder="torch.nn"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Items (comma-separated)</Label>
                      <Input
                        value={getImportItemsInputValue(index, imp.items)}
                        onChange={(e) =>
                          handleImportItemsInput(index, e.target.value)
                        }
                        placeholder="nn, functional, utils"
                        className="text-sm"
                      />
                    </div>

                    {/* Individual alias configuration */}
                    {imp.items &&
                      imp.items.length > 0 &&
                      imp.items.some((item: string) => item.trim() !== "") && (
                        <div className="space-y-2">
                          <Label className="text-xs">Aliases (optional)</Label>
                          <div className="space-y-2">
                            {imp.items
                              .filter((item: string) => item.trim() !== "")
                              .map((item: string, itemIndex: number) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center gap-2"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-muted-foreground min-w-0 flex-shrink-0">
                                        {item} →
                                      </span>
                                      <Input
                                        placeholder={`alias for ${item}`}
                                        value={(imp.as && imp.as[item]) || ""}
                                        onChange={(e) =>
                                          updateImportAlias(
                                            index,
                                            item,
                                            e.target.value
                                          )
                                        }
                                        className="text-xs h-7"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}

              <Button
                onClick={addCustomImport}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Import
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
