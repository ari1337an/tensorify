"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useWorkflowStore, { NodeMode } from "@workflow/store/workflowStore";
import useAppStore from "@/app/_store/store";
import { validateVariableProviderConnection } from "../components/nodes/handles/HandleValidation";
import {
  ShapeIntelliSenseManager,
  NodeShapeInfo,
  ConnectionShapeValidation,
} from "../utils/ShapeIntelliSense";
import {
  SequenceShapeValidator,
  type SequenceShapeValidation,
} from "../utils/SequenceShapeValidator";

type EdgeValidationState = {
  id: string;
  isCompatible: boolean;
  reason:
    | null
    | "incompatible"
    | "multi-prev"
    | "multi-next"
    | "type-mismatch"
    | "workflow-mode-error";
  errorMessage?: string;
};

type NodeValidationState = {
  id: string;
  missingPrev: boolean;
  missingNext: boolean;
  hasMultiplePrev: boolean;
  hasMultipleNext: boolean;
  prevConnections: number;
  nextConnections: number;
  isTransientError: boolean;
  hasExportError: boolean;
  exportErrorMessage?: string;
  hasValidationError: boolean;
  validationErrorMessage?: string;
  isSequenceChild: boolean;
  parentSequenceId?: string;
};

type UIEngineState = {
  edges: Record<string, EdgeValidationState>;
  nodes: Record<string, NodeValidationState>;
  availableVariablesByNodeId: Record<string, string[]>;
  availableVariableDetailsByNodeId: Record<
    string,
    Array<{
      name: string;
      sourceNodeId: string;
      sourceNodeType: string;
      pluginType: string;
      isEnabled: boolean;
    }>
  >;
  localVariableDetailsByNodeId: Record<
    string,
    Array<{
      name: string;
      sourceNodeId: string;
      sourceNodeType: string;
      pluginType: string;
      isEnabled: boolean;
    }>
  >;
  // NEW: Shape intellisense system
  nodeShapes: Record<string, NodeShapeInfo>;
  connectionShapeValidations: Record<string, ConnectionShapeValidation>;
  shapeIntelliSenseManager: ShapeIntelliSenseManager;
  // Sequence shape validation system
  sequenceShapeValidations: Record<string, SequenceShapeValidation>;
  // Plugin manifests for debugging and shape calculations
  pluginManifests: Record<string, any>;
};

const UIEngineContext = createContext<UIEngineState>({
  edges: {},
  nodes: {},
  availableVariablesByNodeId: {},
  availableVariableDetailsByNodeId: {},
  localVariableDetailsByNodeId: {},
  nodeShapes: {},
  connectionShapeValidations: {},
  shapeIntelliSenseManager: new ShapeIntelliSenseManager(),
  sequenceShapeValidations: {},
  pluginManifests: {},
});

// Helper function to get variable handles from manifest
function getVariableHandlesFromManifest(
  nodeId: string,
  pluginManifests: any
): string[] {
  const manifest = pluginManifests[nodeId];
  if (!manifest?.manifest) return [];

  // Support contracts shape (frontendConfigs) and legacy
  const fc = (manifest.manifest as any).frontendConfigs;
  const emitsConfig = fc?.emits || (manifest.manifest as any).emits;

  if (!emitsConfig?.variables) return [];

  // Extract variable names from emits configuration
  return emitsConfig.variables
    .filter((v: any) => v.value && v.isOnByDefault !== false)
    .map((v: any) => v.value);
}

const selector = (state: ReturnType<typeof useWorkflowStore.getState>) => ({
  nodes: state.nodes,
  edges: state.edges,
  transientErrorUntilByNodeId: state.transientErrorUntilByNodeId,
  lastExportErrorsByNodeId: state.lastExportErrorsByNodeId,
  lastExportArtifactErrors: state.lastExportArtifactErrors,
});

export function UIEngineProvider({ children }: { children: React.ReactNode }) {
  const {
    nodes,
    edges,
    transientErrorUntilByNodeId,
    lastExportErrorsByNodeId,
    lastExportArtifactErrors,
  } = useWorkflowStore(useShallow(selector));
  const pluginManifests = useAppStore((state) => state.pluginManifests);

  const state = useMemo<UIEngineState>(() => {
    // Define handle aliases at the top to avoid reference errors
    const NEXT_ALIASES = new Set(["next", "start-output", "nested-output"]);
    const PREV_ALIASES = new Set(["prev", "end-input", "nested-input"]);

    // Helper function to check if a handle is a Branch node numbered output
    const isBranchNextHandle = (handleId: string) =>
      /^next-\d+$/.test(handleId);

    // Build quick lookup maps for node handles
    const nodeIdToHandles = new Map<
      string,
      { input: Set<string>; output: Set<string> }
    >();

    nodes.forEach((node) => {
      // Determine required handles per node type
      const inputHandles = new Set<string>();
      const outputHandles = new Set<string>();

      // Check node mode
      const nodeMode = (node.data as any)?.nodeMode || NodeMode.WORKFLOW;
      const isVariableProvider = nodeMode === NodeMode.VARIABLE_PROVIDER;
      const isCodeProvider = nodeMode === NodeMode.CODE_PROVIDER;

      // Debug logging for code provider nodes
      if (isCodeProvider) {
        console.log(
          `[DEBUG] Code Provider Node: ${node.id}, type: ${node.type}, mode: ${nodeMode}`
        );
      }

      if (node.type === "@tensorify/core/StartNode") {
        // Start requires only NEXT (always workflow mode)
        outputHandles.add("next");
      } else if (node.type === "@tensorify/core/EndNode") {
        // End requires only PREV (always workflow mode)
        inputHandles.add("prev");
      } else if (node.type === "@tensorify/core/NestedNode") {
        // Nested nodes use their own handle IDs (always workflow mode)
        inputHandles.add("nested-input");
        outputHandles.add("nested-output");
      } else if (node.type === "@tensorify/core/BranchNode") {
        // Branch nodes have prev input and numbered next outputs (always workflow mode)
        inputHandles.add("prev");
        const branchCount = (node.data as any)?.branchCount || 2;
        for (let i = 1; i <= branchCount; i++) {
          outputHandles.add(`next-${i}`);
        }
      } else if (isVariableProvider) {
        // Variable Provider mode: NO input handles, ONLY variable output handles
        // Get variable handles from manifest or emitsConfig
        let variableNames: string[] = [];

        // First try to get from manifest (for plugin nodes)
        if (!node.type?.startsWith("@tensorify/core/")) {
          variableNames = getVariableHandlesFromManifest(
            node.id,
            pluginManifests
          );
        }

        // Fallback to emitsConfig for native nodes (ClassNode, CustomCodeNode)
        if (variableNames.length === 0) {
          const emitsConfig = (node.data as any)?.emitsConfig;
          if (emitsConfig?.variables) {
            variableNames = emitsConfig.variables
              .filter((v: any) => v.value && v.isOnByDefault !== false)
              .map((v: any) => v.value);
          }
        }

        // Add ONLY variable handles as outputs (no fallback to next)
        variableNames.forEach((varName) => outputHandles.add(varName));
      } else if (isCodeProvider) {
        // Code Provider mode: NO input handles, ONLY code output handle
        outputHandles.add("code_output");

        // Add dynamic input handles for code provider constructor items (for ClassNode)
        if (node.type === "@tensorify/core/ClassNode") {
          const classData = node.data as any;
          if (classData.constructorItems) {
            classData.constructorItems
              .filter(
                (item: any) =>
                  item.type === "code_provider" && item.codeProvider
              )
              .forEach((item: any) => {
                inputHandles.add(`code_provider_${item.id}`);
              });
          }
        }
      } else {
        // Workflow mode: Custom/plugin and other functional nodes require both prev and next
        inputHandles.add("prev");
        outputHandles.add("next");

        // Add dynamic input handles for code provider constructor items (for ClassNode in workflow mode)
        if (node.type === "@tensorify/core/ClassNode") {
          const classData = node.data as any;
          if (classData.constructorItems) {
            classData.constructorItems
              .filter(
                (item: any) =>
                  item.type === "code_provider" && item.codeProvider
              )
              .forEach((item: any) => {
                inputHandles.add(`code_provider_${item.id}`);
              });
          }
        }
      }

      // Debug logging for all calculated handles
      if (isCodeProvider || nodeMode === "code_provider") {
        console.log(`[DEBUG] Node ${node.id} handles:`, {
          nodeMode,
          inputHandles: Array.from(inputHandles),
          outputHandles: Array.from(outputHandles),
          isCodeProvider,
          nodeType: node.type,
        });
      }

      nodeIdToHandles.set(node.id, {
        input: inputHandles,
        output: outputHandles,
      });
    });

    // Compute node validation: prev must be connected as target, next must be connected as source
    const rfEdges = edges;
    const incomingByNode = new Map<
      string,
      Array<{
        source: string;
        sourceHandle: string | null;
        targetHandle: string | null;
      }>
    >();
    const outgoingByNode = new Map<
      string,
      Array<{
        target: string;
        targetHandle: string | null;
        sourceHandle: string | null;
      }>
    >();

    rfEdges.forEach((e) => {
      if (!incomingByNode.has(e.target)) incomingByNode.set(e.target, []);
      incomingByNode.get(e.target)!.push({
        source: e.source,
        sourceHandle: e.sourceHandle ?? null,
        targetHandle: e.targetHandle ?? null,
      });
      if (!outgoingByNode.has(e.source)) outgoingByNode.set(e.source, []);
      outgoingByNode.get(e.source)!.push({
        target: e.target,
        targetHandle: e.targetHandle ?? null,
        sourceHandle: e.sourceHandle ?? null,
      });
    });

    const nodesState: Record<string, NodeValidationState> = {};
    nodes.forEach((n) => {
      const handles = nodeIdToHandles.get(n.id)!;
      const incoming = incomingByNode.get(n.id) || [];
      const outgoing = outgoingByNode.get(n.id) || [];

      const prevCount = incoming.filter((ie) =>
        PREV_ALIASES.has(ie.targetHandle ?? "")
      ).length;
      const nextCount = outgoing.filter(
        (oe) =>
          NEXT_ALIASES.has(oe.sourceHandle ?? "") ||
          isBranchNextHandle(oe.sourceHandle ?? "")
      ).length;
      const hasPrev = prevCount > 0;
      const hasNext = nextCount > 0;

      const now = Date.now();
      const flashUntil = (transientErrorUntilByNodeId || {})[n.id] || 0;
      const isFlashing = flashUntil > now;

      // Check for export errors
      const hasExportError = Boolean(lastExportErrorsByNodeId[n.id]);
      const exportErrorMessage = lastExportErrorsByNodeId[n.id];

      // Check for ClassNode validation errors
      let hasValidationError = false;
      let validationErrorMessage = "";
      if (n.type === "@tensorify/core/ClassNode") {
        const classData = n.data as any;
        if (classData?.validationErrors?.hasErrors) {
          hasValidationError = true;
          validationErrorMessage =
            classData.validationErrors.errorMessage ||
            "Validation errors detected";
        }
      }

      // Check if this is a sequence child node
      const isSequenceChild = n.route.includes("/sequence-");
      const parentSequenceId = isSequenceChild
        ? n.route.split("/sequence-")[1]?.split("/")[0]
        : undefined;

      // Debug logging for validation calculation
      const nodeMode = (n.data as any)?.nodeMode || NodeMode.WORKFLOW;
      if (nodeMode === NodeMode.CODE_PROVIDER || nodeMode === "code_provider") {
        console.log(`[DEBUG] Validation for code provider node ${n.id}:`, {
          nodeMode,
          handlesPrev: handles.input.has("prev"),
          handlesNext: handles.output.has("next"),
          hasPrev,
          hasNext,
          inputHandles: Array.from(handles.input),
          outputHandles: Array.from(handles.output),
        });
      }

      nodesState[n.id] = {
        id: n.id,
        missingPrev: handles.input.has("prev") ? !hasPrev : false,
        missingNext: handles.output.has("next") ? !hasNext : false,
        hasMultiplePrev: prevCount > 1,
        hasMultipleNext: nextCount > 1,
        prevConnections: prevCount,
        nextConnections: nextCount,
        isTransientError: isFlashing,
        hasExportError,
        exportErrorMessage,
        hasValidationError,
        validationErrorMessage,
        isSequenceChild,
        parentSequenceId,
      };

      if (isFlashing) {
        // Force mark as missing to drive red styling in consumers
        nodesState[n.id].missingPrev = true;
      }
    });

    // Compute edge compatibility and over-subscription flags
    const edgesState: Record<string, EdgeValidationState> = {};

    // Count per node handle
    const prevCountsByNode = new Map<string, number>();
    const nextCountsByNode = new Map<string, number>();
    rfEdges.forEach((e) => {
      const th = (e.targetHandle ?? "").toString();
      const sh = (e.sourceHandle ?? "").toString();
      if (PREV_ALIASES.has(th)) {
        prevCountsByNode.set(
          e.target,
          (prevCountsByNode.get(e.target) || 0) + 1
        );
      }
      if (NEXT_ALIASES.has(sh) || isBranchNextHandle(sh)) {
        nextCountsByNode.set(
          e.source,
          (nextCountsByNode.get(e.source) || 0) + 1
        );
      }
    });

    rfEdges.forEach((e) => {
      const sh = (e.sourceHandle ?? "").toString();
      const th = (e.targetHandle ?? "").toString();

      // Check if this is a standard workflow connection (next/prev)
      const isWorkflowConnection =
        (NEXT_ALIASES.has(sh) || isBranchNextHandle(sh)) &&
        PREV_ALIASES.has(th);

      let reason: EdgeValidationState["reason"] = null;
      let errorMessage: string | undefined = undefined;

      if (isWorkflowConnection) {
        // Standard workflow connection validation
        if (
          (NEXT_ALIASES.has(sh) || isBranchNextHandle(sh)) &&
          (nextCountsByNode.get(e.source) || 0) > 1
        ) {
          // Check if source node is a Branch node - if so, multiple connections are expected
          const sourceNode = nodes.find((n) => n.id === e.source);
          const isBranchNode =
            sourceNode?.type === "@tensorify/core/BranchNode";
          if (!isBranchNode) {
            reason = "multi-next";
          }
        } else if (
          PREV_ALIASES.has(th) &&
          (prevCountsByNode.get(e.target) || 0) > 1
        ) {
          reason = "multi-prev";
        }
      } else {
        // Non-workflow connection (variable handle) – allow by default and validate later
        const sourceNode = nodes.find((n) => n.id === e.source);
        const targetNode = nodes.find((n) => n.id === e.target);
        if (sourceNode && targetNode) {
          reason = null; // defer to variable/type + shape validation
        } else {
          reason = "incompatible";
        }
      }

      edgesState[e.id] = {
        id: e.id,
        isCompatible: reason === null,
        reason,
        errorMessage,
      };
    });

    // Compute available variables per node based on manifests and toggles
    const manifestByKey = new Map<string, any>();
    const pluginTypeByKey = new Map<string, string>();
    for (const pm of pluginManifests) {
      const slug = (pm as any)?.slug || (pm as any)?.id;
      if (slug) {
        manifestByKey.set(slug, (pm as any)?.manifest);
        const pType =
          (pm as any)?.pluginType ||
          (pm as any)?.manifest?.pluginType ||
          "unknown";
        pluginTypeByKey.set(slug, pType);
      }
    }

    // Helper to resolve manifest for a workflow node
    function resolveManifestForNode(nodeId: string): any | null {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        console.log(`🔍 resolveManifestForNode - Node not found: ${nodeId}`);
        return null;
      }
      const pluginId = (node.data as any)?.pluginId || node.type || nodeId;
      console.log(
        `🔍 resolveManifestForNode - Node ${nodeId}, pluginId: ${pluginId}, node.type: ${node.type}`
      );
      console.log(
        `🔍 resolveManifestForNode - Available keys in manifestByKey:`,
        Array.from(manifestByKey.keys())
      );
      const primary = manifestByKey.get(pluginId);
      const secondary = node.type ? manifestByKey.get(node.type) : undefined;
      console.log(`🔍 resolveManifestForNode - Primary manifest:`, primary);
      console.log(`🔍 resolveManifestForNode - Secondary manifest:`, secondary);
      return primary || secondary || null;
    }

    // Build typed adjacency following next->prev
    const parentsByNode = new Map<string, string[]>();
    nodes.forEach((n) => parentsByNode.set(n.id, []));
    rfEdges.forEach((e) => {
      const sh = (e.sourceHandle ?? "").toString();
      const th = (e.targetHandle ?? "").toString();
      if (
        (NEXT_ALIASES.has(sh) || isBranchNextHandle(sh)) &&
        PREV_ALIASES.has(th)
      ) {
        if (!parentsByNode.has(e.target)) parentsByNode.set(e.target, []);
        parentsByNode.get(e.target)!.push(e.source);
      }
    });

    // Local variables per node (based on manifest.emits.variables and toggle in node settings)
    const localVarsByNode = new Map<string, string[]>();
    const localVarDetailsByNode = new Map<
      string,
      Array<{
        name: string;
        sourceNodeId: string;
        sourceNodeType: string;
        pluginType: string;
        isEnabled: boolean;
      }>
    >();
    nodes.forEach((n) => {
      let variables: Array<{
        value: string;
        switchKey?: string;
        isOnByDefault?: boolean;
        type?: string;
      }> = [];

      // Handle native nodes with emits configuration (CustomCodeNode, ClassNode, and ConstantsNode)
      if (
        n.type === "@tensorify/core/CustomCodeNode" ||
        n.type === "@tensorify/core/ClassNode" ||
        n.type === "@tensorify/core/ConstantsNode"
      ) {
        const nodeData = n.data as any;
        variables = nodeData?.emitsConfig?.variables || [];
      } else {
        // Handle plugin nodes
        const mf = resolveManifestForNode(n.id);
        variables = (mf as any)?.emits?.variables || [];
      }

      const settings = ((n.data as any)?.pluginSettings || {}) as Record<
        string,
        any
      >;
      const vars: string[] = [];
      const varDetails: Array<{
        name: string;
        sourceNodeId: string;
        sourceNodeType: string;
        pluginType: string;
        isEnabled: boolean;
      }> = [];
      const pluginKey = ((n.data as any)?.pluginId || n.type || n.id) as string;
      const fallbackPluginType =
        pluginTypeByKey.get(pluginKey) ||
        (n.type === "@tensorify/core/CustomCodeNode"
          ? "function"
          : n.type === "@tensorify/core/ClassNode"
            ? "custom"
            : n.type === "@tensorify/core/ConstantsNode"
              ? "function"
              : "unknown");

      for (const v of variables) {
        const rawKey = (v.switchKey || "").split(".").pop() || "";
        const isOn =
          rawKey && settings.hasOwnProperty(rawKey)
            ? Boolean(settings[rawKey])
            : Boolean(v.isOnByDefault);

        if (isOn && v.value) {
          vars.push(v.value);
          varDetails.push({
            name: v.value,
            sourceNodeId: n.id,
            sourceNodeType: (n.type as string) || "",
            pluginType: v.type || fallbackPluginType, // Use type from manifest, fallback to plugin type
            isEnabled: true,
          });
        }
      }
      localVarsByNode.set(n.id, vars);
      localVarDetailsByNode.set(n.id, varDetails);
    });

    // Nested bubbling: compute variables from nested route end nodes and bubble them up to the container (NestedNode)
    // Map containerId -> nested route prefix ("/" + containerId)
    const nestedRoutePrefixByContainer = new Map<string, string>();
    nodes
      .filter((n) => n.type === "@tensorify/core/NestedNode")
      .forEach((n) => nestedRoutePrefixByContainer.set(n.id, `/${n.id}`));

    // Map containerId -> array of nested end node ids inside that route (including deeper levels like sequence route)
    const nestedEndsByContainer = new Map<string, string[]>();
    nestedRoutePrefixByContainer.forEach((routePrefix, containerId) => {
      const endIds = nodes
        .filter(
          (n) =>
            n.type === "@tensorify/core/EndNode" &&
            (n.route || "").startsWith(routePrefix)
        )
        .map((n) => n.id);
      nestedEndsByContainer.set(containerId, endIds);
    });

    // Fixed-point iteration to compute upstream union variables
    const availableByNode: Record<string, string[]> = {};
    const availableDetailsByNode: Record<
      string,
      Array<{
        name: string;
        sourceNodeId: string;
        sourceNodeType: string;
        pluginType: string;
        isEnabled: boolean;
      }>
    > = {};
    nodes.forEach((n) => (availableByNode[n.id] = []));
    nodes.forEach((n) => (availableDetailsByNode[n.id] = []));

    const maxIterations = Math.max(1, nodes.length);
    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false;
      for (const n of nodes) {
        const parents = parentsByNode.get(n.id) || [];
        const parentUnion = new Set<string>();
        // Inherit from parents
        for (const p of parents) {
          for (const v of availableByNode[p] || []) parentUnion.add(v);
          // Add parent's own variables to the union (they become available to this node)
          for (const v of localVarsByNode.get(p) || []) parentUnion.add(v);
          // details
          const parentDetails = availableDetailsByNode[p] || [];
          const parentLocalDetails = localVarDetailsByNode.get(p) || [];
          const allParentDetails = [...parentDetails, ...parentLocalDetails];
          const detailKeys = new Set(
            (availableDetailsByNode[n.id] || []).map(
              (d) => `${d.name}|${d.sourceNodeId}`
            )
          );
          for (const d of allParentDetails) {
            const key = `${d.name}|${d.sourceNodeId}`;
            if (!detailKeys.has(key)) {
              (availableDetailsByNode[n.id] =
                availableDetailsByNode[n.id] || []).push(d);
              detailKeys.add(key);
            }
          }
        }
        // NOTE: Current node's own variables are NOT added to its available variables
        // This node's variables will be available to its children, but not to itself

        // If this node is a Nested container, bubble variables from its nested end nodes
        if (n.type === "@tensorify/core/NestedNode") {
          const endIds = nestedEndsByContainer.get(n.id) || [];
          for (const endId of endIds) {
            for (const v of availableByNode[endId] || []) parentUnion.add(v);
            for (const v of localVarsByNode.get(endId) || [])
              parentUnion.add(v);
            // details from end nodes
            const endDetails = [
              ...(availableDetailsByNode[endId] || []),
              ...(localVarDetailsByNode.get(endId) || []),
            ];
            const nestedDetailKeys = new Set(
              (availableDetailsByNode[n.id] || []).map(
                (d) => `${d.name}|${d.sourceNodeId}`
              )
            );
            for (const d of endDetails) {
              const key = `${d.name}|${d.sourceNodeId}`;
              if (!nestedDetailKeys.has(key)) {
                (availableDetailsByNode[n.id] =
                  availableDetailsByNode[n.id] || []).push(d);
                nestedDetailKeys.add(key);
              }
            }
          }
        }
        const nextArr = Array.from(parentUnion);
        const prevArr = availableByNode[n.id] || [];
        if (
          nextArr.length !== prevArr.length ||
          nextArr.some((v, i) => v !== prevArr[i])
        ) {
          availableByNode[n.id] = nextArr;
          changed = true;
        }
        // details change detection (shallow)
        const nextDetails = availableDetailsByNode[n.id] || [];
        const prevDetails = availableDetailsByNode[n.id] || [];
        if (nextDetails.length !== prevDetails.length) {
          changed = true;
        }
      }
      if (!changed) break;
    }

    // Convert Map to Record for localVarDetailsByNode before using it
    const localVariableDetailsByNodeId: Record<
      string,
      Array<{
        name: string;
        sourceNodeId: string;
        sourceNodeType: string;
        pluginType: string;
        isEnabled: boolean;
      }>
    > = {};
    localVarDetailsByNode.forEach((details, nodeId) => {
      localVariableDetailsByNodeId[nodeId] = details;
    });

    // Now validate variable provider connections with computed availableDetailsByNode
    rfEdges.forEach((e) => {
      const sh = (e.sourceHandle ?? "").toString();
      const th = (e.targetHandle ?? "").toString();

      // Only validate edges that haven't already been marked as incompatible
      // and are non-workflow handles (potential variable provider connections)
      if (
        edgesState[e.id]?.reason === null &&
        !NEXT_ALIASES.has(sh) &&
        !PREV_ALIASES.has(th) &&
        !isBranchNextHandle(sh)
      ) {
        const sourceNode = nodes.find((n) => n.id === e.source);
        const targetNode = nodes.find((n) => n.id === e.target);

        if (sourceNode && targetNode) {
          const validationResult = validateVariableProviderConnection(
            {
              source: e.source,
              sourceHandle: sh,
              target: e.target,
              targetHandle: th,
            },
            sourceNode,
            targetNode,
            localVariableDetailsByNodeId, // Use local variables instead of available
            pluginManifests
          );

          if (!validationResult.isValid) {
            // Update the edge state with type mismatch error
            edgesState[e.id] = {
              ...edgesState[e.id],
              isCompatible: false,
              reason: "type-mismatch",
              errorMessage: validationResult.errors.join(", "),
            };
          }
        }
      }
    });

    // NEW: Initialize Shape IntelliSense Manager
    const shapeManager = new ShapeIntelliSenseManager();

    // Debug: Log plugin manifests to check if shapes are loaded
    console.log("🔍 Plugin manifests loaded:", Object.keys(pluginManifests));
    Object.values(pluginManifests).forEach((manifest) => {
      // Check both possible locations for emits (root level and visual.emits)
      const manifestData = manifest?.manifest as any;
      const emitsVariables =
        manifestData?.emits?.variables ||
        manifestData?.visual?.emits?.variables;
      if (emitsVariables?.some((v: any) => v.shape)) {
        console.log(
          "✅ Found manifest with shape info:",
          manifest.slug,
          emitsVariables
        );
      }
    });

    // Calculate node shapes for tensor intellisense
    const nodeShapesMap = shapeManager.calculateAllNodeShapes(
      nodes,
      rfEdges,
      Object.values(pluginManifests)
    );

    // Convert map to object for state
    const nodeShapes: Record<string, NodeShapeInfo> = {};
    nodeShapesMap.forEach((shapeInfo, nodeId) => {
      nodeShapes[nodeId] = shapeInfo;
    });

    // Calculate connection shape validations
    const connectionShapeValidations: Record<
      string,
      ConnectionShapeValidation
    > = {};
    console.log("🔍 Starting edge validation for", rfEdges.length, "edges");

    rfEdges.forEach((edge) => {
      console.log("🔍 Validating edge:", {
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      });

      const validation = shapeManager.validateConnection(
        edge.source,
        edge.sourceHandle || "",
        edge.target,
        edge.targetHandle || "",
        rfEdges
      );

      const key = `${edge.source}:${edge.sourceHandle || ""}->${edge.target}:${edge.targetHandle || ""}`;
      // Determine if this is a standard workflow connection (next/prev).
      const sh2 = (edge.sourceHandle || "").toString();
      const th2 = (edge.targetHandle || "").toString();
      const isWorkflowConnection2 =
        (NEXT_ALIASES.has(sh2) || isBranchNextHandle(sh2)) &&
        PREV_ALIASES.has(th2);

      // Only record shape validations for non-workflow (variable) connections
      if (!isWorkflowConnection2) {
        connectionShapeValidations[key] = validation;

        // Debug: Log the validation key being set with detailed handle info
        console.log("🔑 SETTING VALIDATION KEY:", {
          edgeId: edge.id,
          key,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          sourceHandleType: typeof edge.sourceHandle,
          targetHandleType: typeof edge.targetHandle,
          isWorkflowConnection2,
          validation: {
            isValid: validation.isValid,
            message: validation.message,
          },
        });
      }

      // Debug: Log ALL shape validations with detailed node info
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      console.log("🔍 DETAILED EDGE VALIDATION:", {
        edgeId: edge.id,
        sourceNode: {
          id: sourceNode?.id,
          type: sourceNode?.type,
          pluginSettings: sourceNode?.data?.pluginSettings,
          // output shape omitted to avoid type mismatches in logs
        },
        targetNode: {
          id: targetNode?.id,
          type: targetNode?.type,
          pluginSettings: targetNode?.data?.pluginSettings,
          // expected input shape omitted to avoid type mismatches in logs
        },
        validation: {
          isValid: validation.isValid,
          error: validation.message,
          expectedShape: validation.expectedShape,
          actualShape: validation.outputShape,
        },
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        connectionValidationKey: key,
      });

      // Special focus on the Linear layer connection
      if (
        edge.sourceHandle === "linear_layer" &&
        edge.targetHandle === "input_tensor"
      ) {
        console.log("🎯 LINEAR LAYER EDGE SPECIFIC DEBUG:", {
          edgeId: edge.id,
          isValid: validation.isValid,
          error: validation.message,
          sourceOutputDimensions: validation.outputShape?.dimensions,
          targetExpectedDimensions: validation.expectedShape?.dimensions,
          fullValidationObject: validation,
          key: key,
          willBeStoredAs: `${edge.source}:${edge.sourceHandle}->${edge.target}:${edge.targetHandle}`,
        });
      }

      // Debug: Show ONLY failed validations to identify the issue
      if (!validation.isValid) {
        console.log("🔴 FAILED EDGE VALIDATION:", {
          edge: `${edge.source} → ${edge.target}`,
          error: validation.message,
          shapes: {
            actual: validation.outputShape,
            expected: validation.expectedShape,
            actualDimensions: validation.outputShape?.dimensions,
            expectedDimensions: validation.expectedShape?.dimensions,
          },
          sourceSettings: sourceNode?.data?.pluginSettings,
          targetSettings: targetNode?.data?.pluginSettings,
        });
      }

      if (!validation.isValid) {
        console.log("🔴 Shape validation error details:", {
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          error: validation.message,
          expectedShape: validation.expectedShape,
          actualShape: validation.outputShape,
        });
      }

      // Update edge validation with shape information
      if (
        !validation.isValid &&
        edgesState[edge.id]?.reason === null &&
        !isWorkflowConnection2
      ) {
        edgesState[edge.id] = {
          ...edgesState[edge.id],
          isCompatible: false,
          reason: "type-mismatch",
          errorMessage: validation.message,
        };
      }
    });

    // Calculate sequence shape validations for sequence nodes
    const sequenceShapeValidations: Record<string, SequenceShapeValidation> =
      {};
    const sequenceNodes = nodes.filter((node) => {
      const pluginId = node.data?.pluginId || node.type;
      if (!pluginId || typeof pluginId !== "string") return false;

      // Find manifest from the available manifests array
      const manifest = Object.values(pluginManifests).find(
        (m: any) => m.slug === pluginId || m.id === pluginId
      );
      if (!manifest?.manifest) return false;

      const nodeType =
        manifest.manifest.pluginType ||
        manifest.manifest.frontendConfigs?.nodeType;
      return nodeType === "sequence";
    });

    for (const sequenceNode of sequenceNodes) {
      // Get input shape for the sequence node (from connected edges)
      const sequenceNodeShapeInfo = nodeShapesMap.get(sequenceNode.id);
      const inputShape = sequenceNodeShapeInfo
        ? Object.values(sequenceNodeShapeInfo.expectedInputShapes)[0]
        : undefined;

      const validation = SequenceShapeValidator.validateSequenceShapes(
        sequenceNode,
        Object.values(pluginManifests),
        nodes,
        inputShape
      );

      sequenceShapeValidations[sequenceNode.id] = validation;

      // Debug logging for sequence validation (basic info only)
      console.log(
        `🔗 Sequence validation for ${sequenceNode.id}: ${validation.hasAnyErrors ? "❌" : "✅"} (${validation.itemShapeInfos.length} items)`
      );

      if (validation.hasAnyErrors) {
        console.log(
          "🔴 Sequence shape validation errors:",
          SequenceShapeValidator.formatValidationResults(validation)
        );
      }
    }

    return {
      nodes: nodesState,
      edges: edgesState,
      availableVariablesByNodeId: availableByNode,
      availableVariableDetailsByNodeId: availableDetailsByNode,
      localVariableDetailsByNodeId, // Add local variables for validation
      nodeShapes,
      connectionShapeValidations,
      shapeIntelliSenseManager: shapeManager,
      sequenceShapeValidations,
      pluginManifests: Object.fromEntries(manifestByKey),
    };
  }, [
    // Force deep comparison for reactivity on settings changes
    JSON.stringify(
      nodes.map((node) => ({
        id: node.id,
        pluginSettings: node.data?.pluginSettings,
        settings: node.data?.settings,
        type: node.type,
        // Include native node-specific data that affects variable emission
        emitsConfig: node.data?.emitsConfig,
        constants: node.data?.constants, // For ConstantsNode
        code: node.data?.code, // For CustomCodeNode
        methods: node.data?.methods, // For ClassNode
        className: node.data?.className, // For ClassNode
        customImports: node.data?.customImports, // For CustomCode/ClassNode
      }))
    ),
    JSON.stringify(
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }))
    ),
    Object.keys(pluginManifests).join(","),
    JSON.stringify(transientErrorUntilByNodeId),
    JSON.stringify(lastExportErrorsByNodeId),
    JSON.stringify(lastExportArtifactErrors),
  ]);

  return (
    <UIEngineContext.Provider value={state}>
      {children}
    </UIEngineContext.Provider>
  );
}

export function useUIEngine() {
  return useContext(UIEngineContext);
}

// Utility styles for premium feedback
export function getEdgeStyle(
  edgeId: string,
  engine: UIEngineState
): React.CSSProperties | undefined {
  const state = engine.edges[edgeId];
  if (!state) return undefined;
  if (!state.isCompatible) {
    const glow =
      state.reason === "incompatible" ||
      state.reason === "type-mismatch" ||
      state.reason === "workflow-mode-error"
        ? "drop-shadow(0 0 6px rgba(239,68,68,0.6))"
        : state.reason === "multi-prev" || state.reason === "multi-next"
          ? "drop-shadow(0 0 6px rgba(234,179,8,0.6))"
          : undefined;
    return {
      stroke:
        state.reason === "incompatible" ||
        state.reason === "type-mismatch" ||
        state.reason === "workflow-mode-error"
          ? "var(--destructive)"
          : "hsl(var(--warning, 40 100% 50%))",
      strokeWidth: 5,
      filter: glow,
    };
  }
  return undefined;
}

export function getNodeValidation(
  nodeId: string,
  engine: UIEngineState
): NodeValidationState | undefined {
  return engine.nodes[nodeId];
}
