"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useWorkflowStore from "@workflow/store/workflowStore";
import useAppStore from "@/app/_store/store";

type EdgeValidationState = {
  id: string;
  isCompatible: boolean;
  reason: null | "incompatible" | "multi-prev" | "multi-next";
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
  isSequenceChild: boolean;
  parentSequenceId?: string;
};

type UIEngineState = {
  edges: Record<string, EdgeValidationState>;
  nodes: Record<string, NodeValidationState>;
  availableVariablesByNodeId: Record<string, string[]>;
};

const UIEngineContext = createContext<UIEngineState>({
  edges: {},
  nodes: {},
  availableVariablesByNodeId: {},
});

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
    // Build quick lookup maps for node handles
    const nodeIdToHandles = new Map<
      string,
      { input: Set<string>; output: Set<string> }
    >();

    nodes.forEach((node) => {
      // Determine required handles per node type
      const inputHandles = new Set<string>();
      const outputHandles = new Set<string>();
      if (node.type === "@tensorify/core/StartNode") {
        // Start requires only NEXT
        outputHandles.add("next");
      } else if (node.type === "@tensorify/core/EndNode") {
        // End requires only PREV
        inputHandles.add("prev");
      } else {
        // Custom/plugin and other functional nodes require both
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

      const prevCount = incoming.filter(
        (ie) => (ie.targetHandle ?? "") === "prev"
      ).length;
      const nextCount = outgoing.filter(
        (oe) => (oe.sourceHandle ?? "") === "next"
      ).length;
      const hasPrev = prevCount > 0;
      const hasNext = nextCount > 0;

      const now = Date.now();
      const flashUntil = (transientErrorUntilByNodeId || {})[n.id] || 0;
      const isFlashing = flashUntil > now;

      // Check for export errors
      const hasExportError = Boolean(lastExportErrorsByNodeId[n.id]);
      const exportErrorMessage = lastExportErrorsByNodeId[n.id];

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
    const NEXT_ALIASES = new Set(["next", "start-output"]);
    const PREV_ALIASES = new Set(["prev", "end-input"]);

    // Count per node handle
    const prevCountsByNode = new Map<string, number>();
    const nextCountsByNode = new Map<string, number>();
    rfEdges.forEach((e) => {
      const th = (e.targetHandle ?? "").toString();
      const sh = (e.sourceHandle ?? "").toString();
      if (th === "prev") {
        prevCountsByNode.set(
          e.target,
          (prevCountsByNode.get(e.target) || 0) + 1
        );
      }
      if (sh === "next") {
        nextCountsByNode.set(
          e.source,
          (nextCountsByNode.get(e.source) || 0) + 1
        );
      }
    });

    rfEdges.forEach((e) => {
      const sh = (e.sourceHandle ?? "").toString();
      const th = (e.targetHandle ?? "").toString();
      const compatible = NEXT_ALIASES.has(sh) && PREV_ALIASES.has(th);
      let reason: EdgeValidationState["reason"] = null;
      if (!compatible) {
        reason = "incompatible";
      } else if (sh === "next" && (nextCountsByNode.get(e.source) || 0) > 1) {
        reason = "multi-next";
      } else if (th === "prev" && (prevCountsByNode.get(e.target) || 0) > 1) {
        reason = "multi-prev";
      }
      edgesState[e.id] = {
        id: e.id,
        isCompatible: compatible && reason === null,
        reason,
      };
    });

    // Compute available variables per node based on manifests and toggles
    const manifestByKey = new Map<string, any>();
    for (const pm of pluginManifests) {
      const slug = (pm as any)?.slug || (pm as any)?.id;
      if (slug) manifestByKey.set(slug, (pm as any)?.manifest);
    }

    // Helper to resolve manifest for a workflow node
    function resolveManifestForNode(nodeId: string): any | null {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return null;
      const pluginId = (node.data as any)?.pluginId || node.type || nodeId;
      const primary = manifestByKey.get(pluginId);
      const secondary = node.type ? manifestByKey.get(node.type) : undefined;
      return primary || secondary || null;
    }

    // Build typed adjacency following next->prev
    const parentsByNode = new Map<string, string[]>();
    nodes.forEach((n) => parentsByNode.set(n.id, []));
    rfEdges.forEach((e) => {
      const sh = (e.sourceHandle ?? "").toString();
      const th = (e.targetHandle ?? "").toString();
      if (NEXT_ALIASES.has(sh) && PREV_ALIASES.has(th)) {
        if (!parentsByNode.has(e.target)) parentsByNode.set(e.target, []);
        parentsByNode.get(e.target)!.push(e.source);
      }
    });

    // Local variables per node (based on manifest.emits.variables and toggle in node settings)
    const localVarsByNode = new Map<string, string[]>();
    nodes.forEach((n) => {
      const mf = resolveManifestForNode(n.id);
      const variables = ((mf as any)?.emits?.variables || []) as Array<{
        value: string;
        switchKey?: string;
        isOnByDefault?: boolean;
      }>;
      const settings = ((n.data as any)?.pluginSettings || {}) as Record<
        string,
        any
      >;
      const vars: string[] = [];
      for (const v of variables) {
        const rawKey = (v.switchKey || "").split(".").pop() || "";
        const isOn =
          rawKey && settings.hasOwnProperty(rawKey)
            ? Boolean(settings[rawKey])
            : Boolean(v.isOnByDefault);
        if (isOn && v.value) vars.push(v.value);
      }
      localVarsByNode.set(n.id, vars);
    });

    // Fixed-point iteration to compute upstream union variables
    const availableByNode: Record<string, string[]> = {};
    nodes.forEach((n) => (availableByNode[n.id] = []));

    const maxIterations = Math.max(1, nodes.length);
    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false;
      for (const n of nodes) {
        const parents = parentsByNode.get(n.id) || [];
        const parentUnion = new Set<string>();
        for (const p of parents) {
          for (const v of availableByNode[p] || []) parentUnion.add(v);
        }
        for (const v of localVarsByNode.get(n.id) || []) parentUnion.add(v);
        const nextArr = Array.from(parentUnion);
        const prevArr = availableByNode[n.id] || [];
        if (
          nextArr.length !== prevArr.length ||
          nextArr.some((v, i) => v !== prevArr[i])
        ) {
          availableByNode[n.id] = nextArr;
          changed = true;
        }
      }
      if (!changed) break;
    }

    return {
      nodes: nodesState,
      edges: edgesState,
      availableVariablesByNodeId: availableByNode,
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
      state.reason === "incompatible"
        ? "drop-shadow(0 0 6px rgba(239,68,68,0.6))"
        : state.reason === "multi-prev" || state.reason === "multi-next"
          ? "drop-shadow(0 0 6px rgba(234,179,8,0.6))"
          : undefined;
    return {
      stroke:
        state.reason === "incompatible"
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
