"use client";

import React, { useMemo } from "react";
import { type NodeProps } from "@xyflow/react";
import { Code2, AlertCircle } from "lucide-react";
import TNode from "./TNode/TNode";
import CustomHandle from "./handles/CustomHandle";
import { type WorkflowNode, NodeMode } from "../../store/workflowStore";
import { useUIEngine } from "@workflow/engine";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import {
  HandleViewType,
  HandlePosition,
  EdgeType,
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";

export interface ClassParameter {
  name: string;
  defaultValue?: string;
  propertyName?: string; // Name when assigned to self.property_name
}

export interface CodeProviderConfig {
  handleLabel: string;
  handlePosition: "top" | "bottom";
}

export interface ConstructorItem {
  id: string;
  type: "parameter" | "code" | "code_provider";
  parameter?: ClassParameter;
  code?: string;
  codeProvider?: CodeProviderConfig;
}

export interface ClassMethod {
  name: string;
  parameters: Array<{
    name: string;
    defaultValue?: string;
  }>;
  code: string;
  returnType?: string;
}

export interface BaseClass {
  name: string;
  importPath?: string;
  displayName?: string;
  requiredMethods?: string[];
}

// Define the data structure for class node
export interface ClassNodeData {
  className?: string;
  baseClass?: BaseClass | null;
  constructorParameters?: ClassParameter[];
  constructorItems?: ConstructorItem[];
  methods?: ClassMethod[];
  emitsConfig?: {
    variables?: Array<{
      value: string;
      switchKey: string;
      isOnByDefault: boolean;
      type: string;
    }>;
    imports?: Array<{
      path: string;
      items: string[];
      as?: Record<string, string>;
    }>;
  };
  customImports?: Array<{
    path: string;
    items: string[];
    as?: Record<string, string>;
  }>;
  variableMap?: Record<string, any>;
  validationErrors?: {
    duplicateProperties?: string[];
    dynamicParameterErrors?: Array<{
      name: string;
      source: string;
      hasError?: boolean;
      errorMessage?: string;
    }>;
    hasErrors?: boolean;
    errorMessage?: string;
  };
}

export default function ClassNode(props: NodeProps<WorkflowNode>) {
  const { selected, id, data } = props;
  const engine = useUIEngine();
  const nodeValidation = engine.nodes[id];
  const needsPrev = nodeValidation?.missingPrev || false;
  const needsNext = nodeValidation?.missingNext || false;

  // Cast data to our specific type
  const classData = data as ClassNodeData;

  // Check for validation errors from UI Engine
  const hasValidationErrors = Boolean(nodeValidation?.hasValidationError);
  const validationErrorMessage = nodeValidation?.validationErrorMessage;

  // Get node mode
  const nodeMode = (data as any)?.nodeMode || NodeMode.WORKFLOW;
  const isVariableProvider = nodeMode === NodeMode.VARIABLE_PROVIDER;
  const isCodeProvider = nodeMode === NodeMode.CODE_PROVIDER;

  // Debug logging for ClassNode
  if (isCodeProvider) {
    console.log(`[DEBUG] ClassNode ${id} in code provider mode:`, {
      nodeMode,
      isCodeProvider,
      isVariableProvider,
      dataNodeMode: (data as any)?.nodeMode,
    });
  }

  // Generate input handles based on node mode
  const inputHandles: InputHandle[] = useMemo(() => {
    if (isVariableProvider) {
      // Variable Provider mode: NO input handles
      return [];
    }

    const handles: InputHandle[] = [];

    // Add standard prev handle ONLY for workflow mode
    if (nodeMode === NodeMode.WORKFLOW) {
      handles.push({
        id: "prev",
        label: "Prev",
        position: HandlePosition.LEFT,
        viewType: HandleViewType.VERTICAL_BOX,
        edgeType: EdgeType.DEFAULT,
        dataType: "any",
        required: true,
      });
    }

    // Add code provider handles for constructor items (regardless of node mode)
    if (classData.constructorItems) {
      classData.constructorItems
        .filter((item) => item.type === "code_provider" && item.codeProvider)
        .forEach((item) => {
          if (item.codeProvider) {
            handles.push({
              id: `code_provider_${item.id}`,
              label: item.codeProvider.handleLabel,
              position:
                item.codeProvider.handlePosition === "top"
                  ? HandlePosition.TOP
                  : HandlePosition.BOTTOM,
              viewType: HandleViewType.VERTICAL_BOX,
              edgeType: EdgeType.DEFAULT,
              dataType: "code",
            });
          }
        });
    }

    // Debug logging for calculated input handles
    if (isCodeProvider) {
      console.log(`[DEBUG] ClassNode ${id} input handles:`, {
        nodeMode,
        handles: handles.map((h) => ({ id: h.id, label: h.label })),
      });
    }

    return handles;
  }, [nodeMode, classData.constructorItems, isCodeProvider, id]);

  // Generate output handles based on node mode
  const outputHandles: OutputHandle[] = useMemo(() => {
    if (nodeMode === NodeMode.WORKFLOW) {
      // Workflow mode: single "next" handle
      return [
        {
          id: "next",
          label: "Next",
          position: HandlePosition.RIGHT,
          viewType: HandleViewType.VERTICAL_BOX,
          edgeType: EdgeType.DEFAULT,
          dataType: "any",
        },
      ];
    }

    if (nodeMode === NodeMode.VARIABLE_PROVIDER) {
      // Variable Provider mode: ONLY variable handles
      const emitsConfig = classData.emitsConfig;
      if (emitsConfig?.variables && emitsConfig.variables.length > 0) {
        const variableCount = emitsConfig.variables.filter(
          (v) => v.value && v.isOnByDefault !== false
        ).length;

        return emitsConfig.variables
          .filter((v) => v.value && v.isOnByDefault !== false)
          .map((variable, index) => {
            // Distribute handles around the node - right, top, bottom, left
            let position = HandlePosition.RIGHT;
            if (variableCount > 1) {
              if (index === 0) position = HandlePosition.RIGHT;
              else if (index === 1 && variableCount > 1)
                position = HandlePosition.TOP;
              else if (index === 2 && variableCount > 2)
                position = HandlePosition.BOTTOM;
              else if (index === 3 && variableCount > 3)
                position = HandlePosition.LEFT;
              else position = HandlePosition.RIGHT; // Fallback for more handles
            }

            return {
              id: variable.value,
              label: variable.value,
              position,
              viewType: HandleViewType.VERTICAL_BOX,
              edgeType: EdgeType.DEFAULT,
              dataType: "any",
            };
          });
      }

      // Variable Provider with no variables: no handles at all
      return [];
    }

    if (nodeMode === NodeMode.CODE_PROVIDER) {
      // Code Provider mode: output handle for generated code
      return [
        {
          id: "code_output",
          label: "Generated Code",
          position: HandlePosition.RIGHT,
          viewType: HandleViewType.VERTICAL_BOX,
          edgeType: EdgeType.DEFAULT,
          dataType: "code",
        },
      ];
    }

    const outputHandlesList: OutputHandle[] = [];

    // Get all output handles into a list for debugging
    if (nodeMode === NodeMode.WORKFLOW) {
      outputHandlesList.push({
        id: "next",
        label: "Next",
        position: HandlePosition.RIGHT,
        viewType: HandleViewType.VERTICAL_BOX,
        edgeType: EdgeType.DEFAULT,
        dataType: "any",
      });
    } else if (nodeMode === NodeMode.VARIABLE_PROVIDER) {
      const emitsConfig = classData.emitsConfig;
      if (emitsConfig?.variables && emitsConfig.variables.length > 0) {
        const variableCount = emitsConfig.variables.filter(
          (v) => v.value && v.isOnByDefault !== false
        ).length;

        outputHandlesList.push(
          ...emitsConfig.variables
            .filter((v) => v.value && v.isOnByDefault !== false)
            .map((variable, index) => {
              // Distribute handles around the node - right, top, bottom, left
              let position = HandlePosition.RIGHT;
              if (variableCount > 1) {
                if (index === 0) position = HandlePosition.RIGHT;
                else if (index === 1 && variableCount > 1)
                  position = HandlePosition.TOP;
                else if (index === 2 && variableCount > 2)
                  position = HandlePosition.BOTTOM;
                else if (index === 3 && variableCount > 3)
                  position = HandlePosition.LEFT;
                else position = HandlePosition.RIGHT; // Fallback for more handles
              }

              return {
                id: variable.value,
                label: variable.value,
                position,
                viewType: HandleViewType.VERTICAL_BOX,
                edgeType: EdgeType.DEFAULT,
                dataType: "any",
              };
            })
        );
      }
    } else if (nodeMode === NodeMode.CODE_PROVIDER) {
      outputHandlesList.push({
        id: "code_output",
        label: "Generated Code",
        position: HandlePosition.RIGHT,
        viewType: HandleViewType.VERTICAL_BOX,
        edgeType: EdgeType.DEFAULT,
        dataType: "code",
      });
    }

    // Debug logging for calculated output handles
    if (isCodeProvider) {
      console.log(`[DEBUG] ClassNode ${id} output handles:`, {
        nodeMode,
        handles: outputHandlesList.map((h) => ({ id: h.id, label: h.label })),
      });
    }

    return outputHandlesList;
  }, [nodeMode, classData.emitsConfig, isCodeProvider, id]);

  // Get class name for display
  const className = classData.className || "MyClass";

  // Count constructor parameters
  const parameterCount = useMemo(() => {
    return classData.constructorParameters?.length || 0;
  }, [classData.constructorParameters]);

  // Count methods
  const methodCount = useMemo(() => {
    return classData.methods?.length || 0;
  }, [classData.methods]);

  // Count imports
  const importCount = useMemo(() => {
    const emitsImports = classData.emitsConfig?.imports?.length || 0;
    const customImports = classData.customImports?.length || 0;
    const baseClassImport =
      classData.baseClass && classData.baseClass.importPath ? 1 : 0;
    return emitsImports + customImports + baseClassImport;
  }, [
    classData.emitsConfig?.imports,
    classData.customImports,
    classData.baseClass,
  ]);

  // Count emitted variables
  const emittedVariableCount = useMemo(() => {
    return classData.emitsConfig?.variables?.length || 0; // Show actual count
  }, [classData.emitsConfig?.variables]);

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-card border-2 rounded-lg shadow-sm
          min-w-[240px] min-h-[160px]
          transition-all duration-200
          ${
            hasValidationErrors
              ? "border-destructive shadow-lg shadow-destructive/20"
              : selected
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border hover:border-muted-foreground"
          }
        `}
      >
        {needsPrev && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute -top-2 -left-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                  aria-label="Node connection issue"
                >
                  <AlertCircle className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" className="max-w-xs">
                <div className="text-xs space-y-1">
                  <p className="font-medium">Missing input connection</p>
                  <p>Connect an incoming edge to the input handle.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {needsNext && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                  aria-label="Node connection issue"
                >
                  <AlertCircle className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" align="center" className="max-w-xs">
                <div className="text-xs space-y-1">
                  <p className="font-medium">Missing output connection</p>
                  <p>Connect an outgoing edge from the output handle.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {hasValidationErrors && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                  aria-label="Validation errors"
                >
                  <AlertCircle className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-xs">
                <div className="text-xs space-y-1">
                  <p className="font-medium">Validation Errors</p>
                  <p>{validationErrorMessage}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <div className="flex flex-col p-4 space-y-3">
          {/* Icon and Title */}
          <div className="flex items-center space-x-3">
            <div
              className={`
                p-2 rounded-md transition-colors duration-200
                ${
                  selected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                }
              `}
            >
              <Code2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Python Class
              </p>
              <p className="text-xs text-muted-foreground">Class Definition</p>
            </div>
          </div>

          {/* Class Name Display */}
          <div className="bg-muted/30 rounded-md p-2 border border-border/50">
            <code className="text-xs text-muted-foreground font-mono leading-relaxed block truncate">
              class {className}:
            </code>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="text-muted-foreground">
              <span className="font-medium text-primary-readable">
                {parameterCount}
              </span>{" "}
              params
            </span>
            <span className="text-muted-foreground">
              <span className="font-medium text-primary-readable">
                {methodCount}
              </span>{" "}
              methods
            </span>
            <span className="text-muted-foreground">
              <span className="font-medium text-primary-readable">
                {emittedVariableCount}
              </span>{" "}
              vars
            </span>
            <span className="text-muted-foreground">
              <span className="font-medium text-primary-readable">
                {importCount}
              </span>{" "}
              imports
            </span>
          </div>
        </div>

        {/* Input Handles - Only in Workflow mode */}
        {inputHandles.map((handle, index) => (
          <CustomHandle
            key={handle.id}
            handle={handle}
            type="target"
            nodeId={id}
            index={index}
            totalHandles={inputHandles.length}
          />
        ))}

        {/* Output Handles */}
        {outputHandles.map((handle, index) => (
          <CustomHandle
            key={handle.id}
            handle={handle}
            type="source"
            nodeId={id}
            index={index}
            totalHandles={outputHandles.length}
          />
        ))}
      </div>
    </TNode>
  );
}
