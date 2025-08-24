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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  Code2,
  ChevronDownIcon,
  ChevronRightIcon,
  Plus,
  Trash2,
  Eye,
  Settings,
  Import,
  Copy,
  Variable,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import useWorkflowStore, { NodeMode } from "../../../store/workflowStore";
import { useUIEngine } from "../../../engine/ui-engine";
import type {
  ClassNodeData,
  ClassParameter,
  ClassMethod,
  BaseClass,
  ConstructorItem,
  CodeProviderConfig,
} from "../ClassNode";
import {
  IntelligentCodeEditor,
  type AvailableVariable,
} from "../../common/IntelligentCodeEditor";
import { NodeType } from "@packages/sdk/src/types/core";

interface ClassNodeSettingsProps {
  nodeId: string;
  onSettingsChange: (data: Partial<ClassNodeData>) => void;
}

// Common Python data types
const PYTHON_DATA_TYPES = [
  "str",
  "int",
  "float",
  "bool",
  "list",
  "dict",
  "tuple",
  "set",
  "Any",
  "Optional",
  "List",
  "Dict",
  "Tuple",
  "Union",
];

// Extended interface for supported base classes with type mapping
interface SupportedBaseClass extends BaseClass {
  suggestedType: NodeType;
}

// Supported base classes with intelligent type mapping
const SUPPORTED_BASE_CLASSES: SupportedBaseClass[] = [
  {
    name: "torch.nn.Module",
    importPath: "torch.nn",
    displayName: "torch.nn.Module",
    requiredMethods: ["forward"],
    suggestedType: NodeType.MODEL,
  },
  {
    name: "Dataset",
    importPath: "torch.utils.data",
    displayName: "torch.utils.data.Dataset",
    requiredMethods: ["__len__", "__getitem__"],
    suggestedType: NodeType.DATALOADER,
  },
];

// Get intelligent variable type based on base class
const getVariableTypeForBaseClass = (baseClass: BaseClass | null): NodeType => {
  if (!baseClass) return NodeType.CUSTOM;

  const supportedClass = SUPPORTED_BASE_CLASSES.find(
    (sc) => sc.name === baseClass.name
  );

  return supportedClass?.suggestedType || NodeType.CUSTOM;
};

// Common Python imports
const COMMON_IMPORTS = [
  { path: "torch", items: ["nn", "optim", "utils"] },
  { path: "torch.nn.functional", items: ["F"] },
  { path: "torch.utils.data", items: ["Dataset", "DataLoader"] },
  { path: "numpy", items: ["np"] },
  { path: "pandas", items: ["pd"] },
  { path: "typing", items: ["Any", "List", "Dict", "Tuple", "Optional"] },
  { path: "os", items: [] },
];

export function ClassNodeSettings({
  nodeId,
  onSettingsChange,
}: ClassNodeSettingsProps) {
  const nodes = useWorkflowStore((state) => state.nodes);
  const node = nodes.find((n) => n.id === nodeId);
  const engine = useUIEngine();

  // Cast node data to our specific type
  const classData = (node?.data || {}) as ClassNodeData;

  // Local state management
  const [className, setClassName] = useState(classData.className || "MyClass");
  const [baseClass, setBaseClass] = useState<BaseClass | null>(
    classData.baseClass || null
  );
  const [constructorParameters, setConstructorParameters] = useState<
    ClassParameter[]
  >(classData.constructorParameters || []);
  const [constructorItems, setConstructorItems] = useState<ConstructorItem[]>(
    classData.constructorItems || []
  );
  const [methods, setMethods] = useState<ClassMethod[]>(
    classData.methods || []
  );
  const [emittedVariables, setEmittedVariables] = useState(
    classData.emitsConfig?.variables || [
      {
        value: className,
        switchKey: "emitClass",
        isOnByDefault: true,
        type: getVariableTypeForBaseClass(classData.baseClass || null),
      },
    ]
  );
  const [customImports, setCustomImports] = useState(
    classData.customImports || []
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["class-definition"])
  );

  // Get available variables from upstream nodes
  const availableVariables: AvailableVariable[] = useMemo(() => {
    const details = engine.availableVariableDetailsByNodeId[nodeId] || [];
    return details.map((d) => ({
      name: d.name,
      type: d.pluginType || "Any",
      sourceNode: d.sourceNodeType || "Class Node",
      sourceNodeId: d.sourceNodeId,
    }));
  }, [engine, nodeId]);

  // Debounced save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback(
    (data: Partial<ClassNodeData>) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onSettingsChange(data);
      }, 300);
    },
    [onSettingsChange]
  );

  // Initialize emitted variables if not present
  useEffect(() => {
    if (
      !classData.emitsConfig?.variables ||
      classData.emitsConfig.variables.length === 0
    ) {
      const intelligentType = getVariableTypeForBaseClass(baseClass);
      const defaultVariable = {
        value: className,
        switchKey: "emitClass",
        isOnByDefault: true,
        type: intelligentType,
      };
      const initialEmittedVars = [defaultVariable];
      setEmittedVariables(initialEmittedVars);
      // Use debouncedSave to properly save the initial state
      debouncedSave({
        emitsConfig: {
          ...classData.emitsConfig,
          variables: initialEmittedVars,
        },
      });
    }
  }, [className, baseClass, debouncedSave, classData.emitsConfig]); // Include dependencies for proper updates

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle class name changes
  const handleClassNameChange = (newClassName: string) => {
    setClassName(newClassName);
    // Update emitted variable value to match class name
    const updatedEmittedVars = emittedVariables.map((variable) =>
      variable.switchKey === "emitClass"
        ? { ...variable, value: newClassName }
        : variable
    );
    setEmittedVariables(updatedEmittedVars);
    debouncedSave({
      className: newClassName,
      emitsConfig: {
        ...classData.emitsConfig,
        variables: updatedEmittedVars,
      },
    });
  };

  // Handle base class changes
  const handleBaseClassChange = (newBaseClass: BaseClass | null) => {
    setBaseClass(newBaseClass);

    // Auto-update emitted variable type based on base class
    const intelligentType = getVariableTypeForBaseClass(newBaseClass);
    const updatedEmittedVars = emittedVariables.map((variable) =>
      variable.switchKey === "emitClass"
        ? { ...variable, type: intelligentType }
        : variable
    );
    setEmittedVariables(updatedEmittedVars);

    // Auto-add required methods for base classes
    let updatedMethods = [...methods];
    if (newBaseClass && newBaseClass.requiredMethods) {
      newBaseClass.requiredMethods.forEach((methodName) => {
        // Check if method already exists
        const methodExists = updatedMethods.some((m) => m.name === methodName);
        if (!methodExists) {
          let defaultCode = "# Write your method code here\npass";

          // Add specific default implementations for known methods
          if (methodName === "forward") {
            defaultCode =
              "# Define the forward pass of your neural network\n# Example:\n# x = self.layer1(x)\n# return x\npass";
          } else if (methodName === "__len__") {
            defaultCode =
              "# Return the total number of samples in the dataset\n# Example:\n# return len(self.data)\npass";
          } else if (methodName === "__getitem__") {
            defaultCode =
              "# Return a sample from the dataset at the given index\n# Example:\n# sample = self.data[idx]\n# return sample\npass";
          }

          updatedMethods.push({
            name: methodName,
            parameters: [],
            code: defaultCode,
          });
        }
      });
    }

    setMethods(updatedMethods);
    debouncedSave({
      baseClass: newBaseClass,
      methods: updatedMethods,
      emitsConfig: {
        ...classData.emitsConfig,
        variables: updatedEmittedVars,
      },
    });
  };

  // Handle emitted variables changes
  const handleEmittedVariablesChange = (newVariables: any[]) => {
    setEmittedVariables(newVariables);
    debouncedSave({
      emitsConfig: {
        ...classData.emitsConfig,
        variables: newVariables,
      },
    });
  };

  // Update emitted variable
  const updateEmittedVariable = (index: number, field: string, value: any) => {
    const newVariables = [...emittedVariables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    handleEmittedVariablesChange(newVariables);
  };

  // Get duplicate property names for validation (across all constructor items)
  const getDuplicatePropertyNames = (): string[] => {
    const allPropertyNames: string[] = [];

    // From legacy constructor parameters
    constructorParameters.forEach((p) => {
      const propName = p.propertyName || p.name;
      if (propName) allPropertyNames.push(propName);
    });

    // From new constructor items
    constructorItems.forEach((item) => {
      if (item.type === "parameter" && item.parameter) {
        const propName = item.parameter.propertyName || item.parameter.name;
        if (propName) allPropertyNames.push(propName);
      }
    });

    // Find duplicates
    const duplicates = allPropertyNames.filter(
      (name, index) => allPropertyNames.indexOf(name) !== index
    );
    return duplicates;
  };

  // Check if node has validation errors
  const hasValidationErrors = (): boolean => {
    const duplicates = getDuplicatePropertyNames();
    const dynamicErrors = getDynamicSelfParams().filter((p) => p.hasError);
    return duplicates.length > 0 || dynamicErrors.length > 0;
  };

  // Get validation errors object
  const getValidationErrors = () => {
    const duplicates = getDuplicatePropertyNames();
    const dynamicParams = getDynamicSelfParams();
    const dynamicErrors = dynamicParams.filter((p) => p.hasError);

    return {
      duplicateProperties: duplicates,
      dynamicParameterErrors: dynamicErrors,
      hasErrors: duplicates.length > 0 || dynamicErrors.length > 0,
      errorMessage:
        duplicates.length > 0
          ? `Duplicate properties: ${duplicates.join(", ")}`
          : dynamicErrors.length > 0
            ? `Dynamic parameter conflicts: ${dynamicErrors.map((e) => e.errorMessage).join("; ")}`
            : "",
    };
  };

  // Generate import preview with proper base class imports
  const generateImportPreview = () => {
    const importLines: string[] = [];
    const importSet = new Set<string>();

    // Add base class imports correctly
    if (baseClass) {
      if (
        baseClass.name === "torch.nn.Module" ||
        baseClass.name === "Dataset"
      ) {
        if (!importSet.has("import torch")) {
          importLines.push("import torch");
          importSet.add("import torch");
        }
      } else if (
        baseClass.importPath &&
        !importSet.has(`from ${baseClass.importPath} import ${baseClass.name}`)
      ) {
        importLines.push(
          `from ${baseClass.importPath} import ${baseClass.name}`
        );
        importSet.add(`from ${baseClass.importPath} import ${baseClass.name}`);
      }
    }

    // Add custom imports with aliases
    customImports.forEach((imp) => {
      if (imp.path && imp.items.length > 0) {
        const items = imp.items.filter((item: string) => item.trim() !== "");
        if (items.length === 0) return;

        const itemsWithAliases = items.map((item: string) => {
          const alias = imp.as && imp.as[item];
          return alias ? `${item} as ${alias}` : item;
        });

        const importLine = `from ${imp.path} import ${itemsWithAliases.join(", ")}`;
        if (!importSet.has(importLine)) {
          importLines.push(importLine);
          importSet.add(importLine);
        }
      }
    });

    return importLines.join("\n");
  };

  // Generate highlighted import preview for display
  const generateHighlightedImportPreview = () => {
    const preview = generateImportPreview();
    if (!preview) return "";

    return preview
      .split("\n")
      .map((line) => {
        if (line.startsWith("import ") || line.startsWith("from ")) {
          return `<span style="color: var(--primary-readable)">${line}</span>`;
        }
        return line;
      })
      .join("\n");
  };

  // Generate class preview
  const generateClassPreview = () => {
    const imports = generateImportPreview();
    const baseClassName = baseClass
      ? baseClass.name === "torch.nn.Module"
        ? "torch.nn.Module"
        : baseClass.name === "Dataset"
          ? "torch.utils.data.Dataset"
          : baseClass.name
      : "";

    const classDeclaration = baseClassName
      ? `class ${className}(${baseClassName}):`
      : `class ${className}:`;

    // Get all parameters (from both legacy constructorParameters and constructorItems)
    const allParams: ClassParameter[] = [
      ...constructorParameters,
      ...constructorItems
        .filter((item) => item.type === "parameter" && item.parameter)
        .map((item) => item.parameter!),
    ];

    const constructorParams =
      allParams.length > 0
        ? allParams
            .map((p) => {
              const paramName = p.name;
              const defaultVal = p.defaultValue ? `=${p.defaultValue}` : "";
              return `${paramName}${defaultVal}`;
            })
            .join(", ")
        : "";

    const constructorSignature = constructorParams
      ? `    def __init__(self, ${constructorParams}):`
      : `    def __init__(self):`;

    // Handle base class super() call
    const superCall =
      baseClass &&
      (baseClass.name === "torch.nn.Module" || baseClass.name === "Dataset")
        ? "        super().__init__()"
        : "";

    // Generate constructor body with mixed parameters and code blocks
    const constructorBody: string[] = [];

    if (superCall) constructorBody.push(superCall);

    // Add legacy constructor parameters first (for backward compatibility)
    constructorParameters.forEach((p) => {
      const propName = p.propertyName || p.name;
      constructorBody.push(`        self.${propName} = ${p.name}`);
    });

    // Add constructor items in order
    constructorItems.forEach((item) => {
      if (item.type === "parameter" && item.parameter) {
        const propName = item.parameter.propertyName || item.parameter.name;
        constructorBody.push(
          `        self.${propName} = ${item.parameter.name}`
        );
      } else if (item.type === "code" && item.code) {
        const codeLines = item.code
          .split("\n")
          .map((line) => (line ? `        ${line}` : ""));
        constructorBody.push(...codeLines);
      } else if (item.type === "code_provider" && item.codeProvider) {
        constructorBody.push(
          `        # injected code block (generated after export, preview not available)`
        );
      }
    });

    if (constructorBody.length === 0) {
      constructorBody.push("        pass");
    }

    const methodsCode = methods
      .map((method) => {
        const methodParams =
          method.parameters.length > 0
            ? method.parameters
                .map((p) => {
                  const defaultVal = p.defaultValue ? `=${p.defaultValue}` : "";
                  return `${p.name}${defaultVal}`;
                })
                .join(", ")
            : "";

        const methodSignature = methodParams
          ? `    def ${method.name}(self, ${methodParams}):`
          : `    def ${method.name}(self):`;

        const methodBody = method.code
          .split("\n")
          .map((line) => `        ${line}`)
          .join("\n");

        return `${methodSignature}\n${methodBody}`;
      })
      .join("\n\n");

    // Assemble the class with beautiful spacing
    const classBody = [constructorSignature, ...constructorBody].join("\n");

    let result = "";

    // Add imports with spacing
    if (imports) {
      result += imports + "\n\n\n";
    }

    // Add class declaration and body
    result += classDeclaration + "\n" + classBody;

    // Add methods with spacing
    if (methodsCode) {
      result += "\n\n" + methodsCode;
    }

    return result;
  };

  // Handle constructor parameters changes
  const handleConstructorParametersChange = (
    newParameters: ClassParameter[]
  ) => {
    setConstructorParameters(newParameters);
    // Calculate validation errors after updating parameters
    setTimeout(() => {
      const validationErrors = getValidationErrors();
      debouncedSave({
        constructorParameters: newParameters,
        validationErrors,
      });
    }, 0);
  };

  // Handle constructor items changes
  const handleConstructorItemsChange = (newItems: ConstructorItem[]) => {
    setConstructorItems(newItems);
    // Calculate validation errors after updating items
    setTimeout(() => {
      const validationErrors = getValidationErrors();
      debouncedSave({
        constructorItems: newItems,
        validationErrors,
      });
    }, 0);
  };

  // Add constructor item (parameter, code, or code_provider)
  const addConstructorItem = (type: "parameter" | "code" | "code_provider") => {
    const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: ConstructorItem = {
      id,
      type,
      ...(type === "parameter"
        ? {
            parameter: {
              name: `param_${constructorItems.length + 1}`,
              propertyName: `param_${constructorItems.length + 1}`,
            },
          }
        : type === "code"
          ? {
              code: "# Add your custom code here\n",
            }
          : {
              codeProvider: {
                handleLabel: `handle_${constructorItems.length + 1}`,
                handlePosition: "top",
              },
            }),
    };
    handleConstructorItemsChange([...constructorItems, newItem]);
  };

  // Remove constructor item
  const removeConstructorItem = (index: number) => {
    const newItems = constructorItems.filter((_, i) => i !== index);
    handleConstructorItemsChange(newItems);
  };

  // Update constructor item
  const updateConstructorItem = (
    index: number,
    updates: Partial<ConstructorItem>
  ) => {
    const newItems = [...constructorItems];
    newItems[index] = { ...newItems[index], ...updates };
    handleConstructorItemsChange(newItems);
  };

  // Extract dynamic self parameters from constructor code using @classnodeself decorator
  const getDynamicSelfParams = (): Array<{
    name: string;
    source: string;
    hasError?: boolean;
    errorMessage?: string;
  }> => {
    const dynamicParams: Array<{
      name: string;
      source: string;
      hasError?: boolean;
      errorMessage?: string;
    }> = [];
    // Pattern to match @classnodeself followed by self.param_name = value
    const pattern =
      /@classnodeself\s*\n\s*self\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm;

    // Track all dynamic parameters to detect duplicates
    const allDynamicParams = new Map<
      string,
      Array<{ source: string; index: number }>
    >();

    constructorItems.forEach((item, index) => {
      if (item.type === "code" && item.code) {
        let match;
        // Reset regex lastIndex for each iteration
        pattern.lastIndex = 0;
        while ((match = pattern.exec(item.code)) !== null) {
          const paramName = match[1];
          const fullName = `self.${paramName}`;

          // Track this parameter for duplicate detection
          if (!allDynamicParams.has(paramName)) {
            allDynamicParams.set(paramName, []);
          }
          allDynamicParams
            .get(paramName)!
            .push({ source: `Code Block ${index + 1}`, index });
        }
      }
    });

    // Now process each item again to check for conflicts
    constructorItems.forEach((item, index) => {
      if (item.type === "code" && item.code) {
        let match;
        pattern.lastIndex = 0;
        while ((match = pattern.exec(item.code)) !== null) {
          const paramName = match[1];
          const fullName = `self.${paramName}`;

          // Check for validation errors
          let hasError = false;
          let errorMessage = "";

          // Check if this conflicts with existing parameters
          const existingParam = constructorParameters.find(
            (p) => (p.propertyName || p.name) === paramName
          );
          const existingItem = constructorItems.find(
            (otherItem, otherIndex) =>
              otherIndex !== index &&
              otherItem.type === "parameter" &&
              otherItem.parameter &&
              (otherItem.parameter.propertyName || otherItem.parameter.name) ===
                paramName
          );

          // Check for duplicate dynamic parameters
          const dynamicOccurrences = allDynamicParams.get(paramName) || [];
          const hasDuplicateDynamic = dynamicOccurrences.length > 1;

          if (existingParam || existingItem) {
            hasError = true;
            errorMessage = `Dynamic parameter '${paramName}' conflicts with existing parameter`;
          } else if (hasDuplicateDynamic) {
            hasError = true;
            const sources = dynamicOccurrences.map((d) => d.source).join(", ");
            errorMessage = `Duplicate dynamic parameter '${paramName}' found in: ${sources}`;
          }

          dynamicParams.push({
            name: fullName,
            source: `Code Block ${index + 1}`,
            hasError,
            errorMessage,
          });
        }
      }
    });

    return dynamicParams;
  };

  // Get self params for $ variable highlighting
  const getSelfParams = (): AvailableVariable[] => {
    const selfParamsMap = new Map<string, AvailableVariable>();

    // From constructor parameters
    constructorParameters.forEach((param) => {
      const propName = param.propertyName || param.name;
      const varName = `self.${propName}`;
      if (!selfParamsMap.has(varName)) {
        selfParamsMap.set(varName, {
          name: varName,
          type: "self_param",
          sourceNodeId: nodeId,
          sourceNode: "Class Node",
        });
      }
    });

    // From constructor items that are parameters
    constructorItems.forEach((item) => {
      if (item.type === "parameter" && item.parameter) {
        const propName = item.parameter.propertyName || item.parameter.name;
        const varName = `self.${propName}`;
        if (!selfParamsMap.has(varName)) {
          selfParamsMap.set(varName, {
            name: varName,
            type: "self_param",
            sourceNodeId: nodeId,
            sourceNode: "Class Node",
          });
        }
      }
    });

    // From dynamic parameters in constructor code (#self.param_name)
    const dynamicParams = getDynamicSelfParams();
    dynamicParams.forEach((param) => {
      if (!param.hasError && !selfParamsMap.has(param.name)) {
        selfParamsMap.set(param.name, {
          name: param.name,
          type: "dynamic_self_param",
          sourceNodeId: nodeId,
          sourceNode: "Class Node",
        });
      }
    });

    return Array.from(selfParamsMap.values());
  };

  // Get constructor variables (constructor function params + self params)
  const getConstructorVariables = (): AvailableVariable[] => {
    const variables: AvailableVariable[] = [];

    // Add constructor function parameters
    const allParams: ClassParameter[] = [
      ...constructorParameters,
      ...constructorItems
        .filter((item) => item.type === "parameter" && item.parameter)
        .map((item) => item.parameter!),
    ];

    allParams.forEach((param) => {
      variables.push({
        name: param.name,
        type: "function_param",
        sourceNodeId: nodeId,
        sourceNode: "Class Node",
      });
    });

    // Add self params
    variables.push(...getSelfParams());

    return variables;
  };

  // Get method variables (method function params + self params)
  const getMethodVariables = (methodIndex: number): AvailableVariable[] => {
    const variables: AvailableVariable[] = [];

    // Add method function parameters
    if (methods[methodIndex]) {
      methods[methodIndex].parameters.forEach((param) => {
        variables.push({
          name: param.name,
          type: "function_param",
          sourceNodeId: nodeId,
          sourceNode: "Class Node",
        });
      });
    }

    // Add self params
    variables.push(...getSelfParams());

    return variables;
  };

  // Handle methods changes
  const handleMethodsChange = (newMethods: ClassMethod[]) => {
    setMethods(newMethods);
    debouncedSave({ methods: newMethods });
  };

  // Handle imports changes
  const handleImportsChange = (newImports: any[]) => {
    setCustomImports(newImports);
    debouncedSave({
      customImports: newImports,
      emitsConfig: {
        ...classData.emitsConfig,
        imports: newImports,
      },
    });
  };

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

  // Add new constructor parameter
  const addConstructorParameter = () => {
    const newParameter: ClassParameter = {
      name: `param_${constructorParameters.length + 1}`,
      propertyName: `param_${constructorParameters.length + 1}`,
    };
    handleConstructorParametersChange([...constructorParameters, newParameter]);
  };

  // Remove constructor parameter
  const removeConstructorParameter = (index: number) => {
    const newParameters = constructorParameters.filter((_, i) => i !== index);
    handleConstructorParametersChange(newParameters);
  };

  // Update constructor parameter
  const updateConstructorParameter = (
    index: number,
    field: string,
    value: any
  ) => {
    const newParameters = [...constructorParameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    handleConstructorParametersChange(newParameters);
  };

  // Add new method
  const addMethod = () => {
    const newMethod: ClassMethod = {
      name: `method_${methods.length + 1}`,
      parameters: [],
      code: "# Write your method code here\npass",
    };
    handleMethodsChange([...methods, newMethod]);
  };

  // Remove method
  const removeMethod = (index: number) => {
    const newMethods = methods.filter((_, i) => i !== index);
    handleMethodsChange(newMethods);
  };

  // Update method
  const updateMethod = (index: number, field: string, value: any) => {
    const newMethods = [...methods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    handleMethodsChange(newMethods);
  };

  // Add method parameter
  const addMethodParameter = (methodIndex: number) => {
    const newMethods = [...methods];
    const newParam = {
      name: `param_${newMethods[methodIndex].parameters.length + 1}`,
      defaultValue: "",
    };
    newMethods[methodIndex].parameters.push(newParam);
    handleMethodsChange(newMethods);
  };

  // Remove method parameter
  const removeMethodParameter = (methodIndex: number, paramIndex: number) => {
    const newMethods = [...methods];
    newMethods[methodIndex].parameters = newMethods[
      methodIndex
    ].parameters.filter((_, i) => i !== paramIndex);
    handleMethodsChange(newMethods);
  };

  // Update method parameter
  const updateMethodParameter = (
    methodIndex: number,
    paramIndex: number,
    field: string,
    value: any
  ) => {
    const newMethods = [...methods];
    newMethods[methodIndex].parameters[paramIndex] = {
      ...newMethods[methodIndex].parameters[paramIndex],
      [field]: value,
    };
    handleMethodsChange(newMethods);
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

  // Render section header
  const renderSectionHeader = (
    id: string,
    title: string,
    icon: React.ReactNode,
    badge?: string
  ) => {
    const isExpanded = expandedSections.has(id);
    return (
      <div className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors duration-200">
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
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Left Column - Configuration */}
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Class Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure Python class structure, constructor, and methods with
            intelligent parameter management
          </p>
        </div>

        {/* Class Definition Section */}
        <Card>
          <Collapsible
            open={expandedSections.has("class-definition")}
            onOpenChange={() => toggleSection("class-definition")}
          >
            <CollapsibleTrigger className="w-full">
              {renderSectionHeader(
                "class-definition",
                "Class Definition",
                <Code2 className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Class Name</Label>
                  <Input
                    value={className}
                    onChange={(e) => handleClassNameChange(e.target.value)}
                    placeholder="MyClass"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Base Class (Optional)</Label>
                  <Select
                    value={baseClass?.name || "no-base"}
                    onValueChange={(value) => {
                      if (value === "no-base") {
                        handleBaseClassChange(null);
                      } else if (value === "custom") {
                        handleBaseClassChange({ name: "", importPath: "" });
                      } else {
                        const supportedBase = SUPPORTED_BASE_CLASSES.find(
                          (b) => b.name === value
                        );
                        if (supportedBase) {
                          handleBaseClassChange(supportedBase);
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No base class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-base">No base class</SelectItem>
                      {SUPPORTED_BASE_CLASSES.map((base) => (
                        <SelectItem key={base.name} value={base.name}>
                          {base.displayName}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        Custom base class...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {baseClass && baseClass.name === "" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Base Class Name</Label>
                      <Input
                        value={baseClass.name}
                        onChange={(e) =>
                          handleBaseClassChange({
                            ...baseClass,
                            name: e.target.value,
                          })
                        }
                        placeholder="BaseClass"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Import Path</Label>
                      <Input
                        value={baseClass.importPath || ""}
                        onChange={(e) =>
                          handleBaseClassChange({
                            ...baseClass,
                            importPath: e.target.value,
                          })
                        }
                        placeholder="package.module"
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Constructor Section */}
        <Card>
          <Collapsible
            open={expandedSections.has("constructor")}
            onOpenChange={() => toggleSection("constructor")}
          >
            <CollapsibleTrigger className="w-full">
              {renderSectionHeader(
                "constructor",
                "Constructor (__init__)",
                <Settings className="h-4 w-4" />,
                (
                  constructorParameters.length + constructorItems.length
                ).toString()
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {/* Constructor parameters */}
                {constructorParameters.map((param, index) => (
                  <div
                    key={`param-${index}`}
                    className="p-3 border rounded-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Parameter {index + 1}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConstructorParameter(index)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Parameter Name</Label>
                        <Input
                          value={param.name}
                          onChange={(e) =>
                            updateConstructorParameter(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="param_name"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Default Value</Label>
                        <Input
                          value={param.defaultValue || ""}
                          onChange={(e) =>
                            updateConstructorParameter(
                              index,
                              "defaultValue",
                              e.target.value
                            )
                          }
                          placeholder="None"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Property Name (self.*)</Label>
                      <Input
                        value={param.propertyName || param.name}
                        onChange={(e) =>
                          updateConstructorParameter(
                            index,
                            "propertyName",
                            e.target.value
                          )
                        }
                        placeholder={param.name}
                        className={cn(
                          "text-sm",
                          getDuplicatePropertyNames().includes(
                            param.propertyName || param.name
                          ) && "border-destructive focus:border-destructive"
                        )}
                      />
                      {getDuplicatePropertyNames().includes(
                        param.propertyName || param.name
                      ) && (
                        <p className="text-xs text-destructive">
                          Property name already exists
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* New constructor items */}
                {constructorItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {item.type === "parameter"
                          ? "Parameter"
                          : item.type === "code"
                            ? "Custom Code"
                            : "Code Provider"}{" "}
                        {index + 1}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConstructorItem(index)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {item.type === "parameter" && item.parameter ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Parameter Name</Label>
                            <Input
                              value={item.parameter.name}
                              onChange={(e) =>
                                updateConstructorItem(index, {
                                  parameter: {
                                    ...item.parameter,
                                    name: e.target.value,
                                  },
                                })
                              }
                              placeholder="param_name"
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Default Value</Label>
                            <Input
                              value={item.parameter.defaultValue || ""}
                              onChange={(e) =>
                                updateConstructorItem(index, {
                                  parameter: {
                                    name: item.parameter?.name || "",
                                    propertyName: item.parameter?.propertyName,
                                    defaultValue: e.target.value,
                                  },
                                })
                              }
                              placeholder="None"
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">
                            Property Name (self.*)
                          </Label>
                          <Input
                            value={
                              item.parameter.propertyName || item.parameter.name
                            }
                            onChange={(e) =>
                              updateConstructorItem(index, {
                                parameter: {
                                  ...item.parameter,
                                  name: item.parameter?.name || "",
                                  propertyName: e.target.value,
                                },
                              })
                            }
                            placeholder={item.parameter.name}
                            className={cn(
                              "text-sm",
                              getDuplicatePropertyNames().includes(
                                item.parameter.propertyName ||
                                  item.parameter.name
                              ) && "border-destructive focus:border-destructive"
                            )}
                          />
                          {getDuplicatePropertyNames().includes(
                            item.parameter.propertyName || item.parameter.name
                          ) && (
                            <p className="text-xs text-destructive">
                              Property name already exists
                            </p>
                          )}
                        </div>
                      </>
                    ) : item.type === "code" ? (
                      <div className="space-y-2">
                        <Label className="text-xs">Custom Code</Label>
                        <IntelligentCodeEditor
                          value={item.code || ""}
                          onChange={(value) =>
                            updateConstructorItem(index, { code: value })
                          }
                          availableVariables={getConstructorVariables()}
                          placeholder="# Add your custom code here\n# Use $param_name for constructor parameters or $self.param_name for properties\n# Use @classnodeself decorator to create dynamic class properties:\n# @classnodeself\n# self.property_name = value"
                          language="python"
                          height="120px"
                          hasValidationErrors={(() => {
                            const dynamicParams = getDynamicSelfParams();
                            return dynamicParams.some(
                              (param, paramIndex) =>
                                param.hasError &&
                                constructorItems.findIndex(
                                  (ci) =>
                                    ci.type === "code" &&
                                    ci.code?.includes(`@classnodeself`) &&
                                    ci.code?.includes(param.name)
                                ) === index
                            );
                          })()}
                          validationErrorMessage={(() => {
                            const dynamicParams = getDynamicSelfParams();
                            const errors = dynamicParams.filter(
                              (param, paramIndex) =>
                                param.hasError &&
                                constructorItems.findIndex(
                                  (ci) =>
                                    ci.type === "code" &&
                                    ci.code?.includes(`@classnodeself`) &&
                                    ci.code?.includes(param.name)
                                ) === index
                            );
                            return errors.length > 0
                              ? errors.map((e) => e.errorMessage).join("; ")
                              : "";
                          })()}
                        />
                      </div>
                    ) : item.type === "code_provider" && item.codeProvider ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Handle Label</Label>
                            <Input
                              value={item.codeProvider.handleLabel}
                              onChange={(e) =>
                                updateConstructorItem(index, {
                                  codeProvider: {
                                    handlePosition: "bottom",
                                    ...item.codeProvider,
                                    handleLabel: e.target.value,
                                  },
                                })
                              }
                              placeholder="handle_name"
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Handle Position</Label>
                            <Select
                              value={item.codeProvider.handlePosition}
                              onValueChange={(value: "top" | "bottom") =>
                                updateConstructorItem(index, {
                                  codeProvider: {
                                    handleLabel: "",
                                    ...item.codeProvider,
                                    handlePosition: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                          Connect a code provider node to this handle on the
                          canvas to inject code.
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}

                {/* Add buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    onClick={() => addConstructorItem("parameter")}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Parameter
                  </Button>
                  <Button
                    onClick={() => addConstructorItem("code")}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Code
                  </Button>
                  <Button
                    onClick={() => addConstructorItem("code_provider")}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Code Provider
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Methods Section */}
        <Card>
          <Collapsible
            open={expandedSections.has("methods")}
            onOpenChange={() => toggleSection("methods")}
          >
            <CollapsibleTrigger className="w-full">
              {renderSectionHeader(
                "methods",
                "Methods",
                <Code2 className="h-4 w-4" />,
                methods.length.toString()
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {methods.map((method, methodIndex) => (
                  <div
                    key={methodIndex}
                    className="p-3 border rounded-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Method: {method.name}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMethod(methodIndex)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Method Name</Label>
                      <Input
                        value={method.name}
                        onChange={(e) =>
                          updateMethod(methodIndex, "name", e.target.value)
                        }
                        placeholder="method_name"
                        className="text-sm"
                      />
                    </div>

                    {/* Method Parameters */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Parameters</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addMethodParameter(methodIndex)}
                          className="h-6 px-2 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Param
                        </Button>
                      </div>
                      {method.parameters.map((param, paramIndex) => (
                        <div
                          key={paramIndex}
                          className="p-2 bg-muted/30 rounded border space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Parameter {paramIndex + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeMethodParameter(methodIndex, paramIndex)
                              }
                              className="h-4 w-4 p-0 text-destructive"
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              value={param.name}
                              onChange={(e) =>
                                updateMethodParameter(
                                  methodIndex,
                                  paramIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="param"
                              className="text-xs"
                            />

                            <Input
                              value={param.defaultValue || ""}
                              onChange={(e) =>
                                updateMethodParameter(
                                  methodIndex,
                                  paramIndex,
                                  "defaultValue",
                                  e.target.value
                                )
                              }
                              placeholder="default"
                              className="text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Method Code */}
                    <div className="space-y-2">
                      <Label className="text-xs">Method Code</Label>
                      <IntelligentCodeEditor
                        value={method.code}
                        onChange={(value) =>
                          updateMethod(methodIndex, "code", value)
                        }
                        availableVariables={getMethodVariables(methodIndex)}
                        height="200px"
                        showVariableHelper={false}
                        placeholder="# Write your method code here\n# Use $param_name for method parameters or $self.param_name for class properties\n# Dynamic class properties (@classnodeself) are created in constructor only\npass"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  onClick={addMethod}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Variable Emissions Section */}
        <Card>
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
                        Class Variable {index + 1}
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1">
                          Variable Name
                          <span className="text-muted-foreground text-[10px]">
                            (syncs with class name)
                          </span>
                        </Label>
                        <Input
                          value={variable.value}
                          disabled={true}
                          placeholder="class_instance"
                          className="text-sm bg-muted/50 cursor-not-allowed"
                          title="Variable name automatically syncs with class name"
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
                            <SelectItem value={NodeType.CUSTOM}>
                              CUSTOM
                            </SelectItem>
                            <SelectItem value={NodeType.FUNCTION}>
                              FUNCTION
                            </SelectItem>
                            <SelectItem value={NodeType.DATALOADER}>
                              DATALOADER
                            </SelectItem>
                            <SelectItem value={NodeType.MODEL}>
                              MODEL
                            </SelectItem>
                            <SelectItem value={NodeType.MODEL_LAYER}>
                              MODEL_LAYER
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Imports Section */}
        <Card>
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
                {(customImports.length > 0 || baseClass) && (
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

                {/* Quick Add Common Imports */}
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

                    <div className="grid grid-cols-2 gap-3">
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
                        <Label className="text-xs">Items</Label>
                        <Input
                          value={imp.items.join(", ")}
                          onChange={(e) =>
                            updateCustomImport(index, "items", e.target.value)
                          }
                          placeholder="nn, functional"
                          className="text-sm"
                        />
                      </div>
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

      {/* Right Column - Generated Code Preview */}
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Generated Code Preview</h3>
          <p className="text-sm text-muted-foreground">
            Real-time preview of the generated Python class
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <CardTitle className="text-sm">Python Class</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generateClassPreview());
                }}
                className="h-6 px-2 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <CardDescription className="text-xs">
              {constructorParameters.length} param
              {constructorParameters.length !== 1 ? "s" : ""} • {methods.length}{" "}
              method{methods.length !== 1 ? "s" : ""} •{" "}
              {emittedVariables.length} emitted variable
              {emittedVariables.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-md p-3 border">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                {generateClassPreview()}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
