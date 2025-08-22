"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useWorkflowStore, { NodeMode } from "@workflow/store/workflowStore";
import useAppStore from "@/app/_store/store";
import { validateVariableProviderConnection } from "../components/nodes/handles/HandleValidation";

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
};

const UIEngineContext = createContext<UIEngineState>({
  edges: {},
  nodes: {},
  availableVariablesByNodeId: {},
  availableVariableDetailsByNodeId: {},
  localVariableDetailsByNodeId: {},
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

      // Check if node is in Variable Provider mode
      const nodeMode = (node.data as any)?.nodeMode || NodeMode.WORKFLOW;
      const isVariableProvider = nodeMode === NodeMode.VARIABLE_PROVIDER;

      if (node.type === "@tensorify/core/StartNode") {
        // Start requires only NEXT (never variable provider)
        outputHandles.add("next");
      } else if (node.type === "@tensorify/core/EndNode") {
        // End requires only PREV (never variable provider)
        inputHandles.add("prev");
      } else if (node.type === "@tensorify/core/NestedNode") {
        // Nested nodes use their own handle IDs (never variable provider)
        inputHandles.add("nested-input");
        outputHandles.add("nested-output");
      } else if (node.type === "@tensorify/core/BranchNode") {
        // Branch nodes have prev input and numbered next outputs (never variable provider)
        inputHandles.add("prev");
        const branchCount = (node.data as any)?.branchCount || 2;
        for (let i = 1; i <= branchCount; i++) {
          outputHandles.add(`next-${i}`);
        }
      } else if (isVariableProvider) {
        // Variable Provider mode: NO input handles, ONLY variable output handles
        // No prev handle - node is disconnected from workflow sequence

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
      } else {
        // Workflow mode: Custom/plugin and other functional nodes require both
        inputHandles.add("prev");
        outputHandles.add("next");
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
        // Non-workflow connection - could be variable provider or invalid workflow connection
        const sourceNode = nodes.find((n) => n.id === e.source);
        const targetNode = nodes.find((n) => n.id === e.target);

        if (sourceNode && targetNode) {
          // Check if both nodes are in workflow mode trying to connect via variable handles
          const sourceMode = (sourceNode.data as any)?.nodeMode || "workflow";
          const targetMode = (targetNode.data as any)?.nodeMode || "workflow";

          if (sourceMode === "workflow" && targetMode === "workflow") {
            // Both in workflow mode but connecting via non-workflow handles
            reason = "workflow-mode-error";
            errorMessage = `Both nodes are in workflow mode. For variable connections, the source node "${sourceNode.data?.label || sourceNode.id}" should be in "variable provider" mode.`;
          } else {
            // This should be a variable provider connection - will be validated later
            reason = null;
          }
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

      // Handle native nodes with emits configuration (CustomCodeNode and ClassNode)
      if (
        n.type === "@tensorify/core/CustomCodeNode" ||
        n.type === "@tensorify/core/ClassNode"
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
            : "unknown");

      for (const v of variables) {
        const rawKey = (v.switchKey || "").split(".").pop() || "";
        const isOn =
          rawKey && settings.hasOwnProperty(rawKey)
            ? Boolean(settings[rawKey])
            : Boolean(v.isOnByDefault);

        console.log(
          `🔍 UI Engine - Variable ${v.value}: isOn=${isOn}, rawKey=${rawKey}, settings[${rawKey}]=${settings[rawKey]}, isOnByDefault=${v.isOnByDefault}`
        );

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
      console.log(`🔍 UI Engine - Final vars for node ${n.id}:`, vars);
      console.log(
        `🔍 UI Engine - Final varDetails for node ${n.id}:`,
        varDetails
      );
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

    return {
      nodes: nodesState,
      edges: edgesState,
      availableVariablesByNodeId: availableByNode,
      availableVariableDetailsByNodeId: availableDetailsByNode,
      localVariableDetailsByNodeId, // Add local variables for validation
    };
  }, [
    nodes,
    edges,
    pluginManifests,
    transientErrorUntilByNodeId,
    lastExportErrorsByNodeId,
    lastExportArtifactErrors,
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
