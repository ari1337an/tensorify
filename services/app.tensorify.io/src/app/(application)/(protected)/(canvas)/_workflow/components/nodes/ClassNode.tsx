"use client";

import React, { useMemo } from "react";
import { type NodeProps } from "@xyflow/react";
import { Code2, AlertCircle } from "lucide-react";
import TNode from "./TNode/TNode";
import CustomHandle from "./handles/CustomHandle";
import { type WorkflowNode } from "../../store/workflowStore";
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

export interface ConstructorItem {
  id: string;
  type: "parameter" | "code";
  parameter?: ClassParameter;
  code?: string;
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

  // Define the input handle for the class node
  const inputHandle: InputHandle = {
    id: "prev",
    label: "Prev",
    position: HandlePosition.LEFT,
    viewType: HandleViewType.VERTICAL_BOX,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
    required: true,
  };

  // Define the output handle for the class node
  const outputHandle: OutputHandle = {
    id: "next",
    label: "Next",
    position: HandlePosition.RIGHT,
    viewType: HandleViewType.VERTICAL_BOX,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
  };

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

        {/* Input Handle */}
        <CustomHandle
          handle={inputHandle}
          type="target"
          nodeId={id}
          index={0}
          totalHandles={1}
        />

        {/* Output Handle */}
        <CustomHandle
          handle={outputHandle}
          type="source"
          nodeId={id}
          index={0}
          totalHandles={1}
        />
      </div>
    </TNode>
  );
}
