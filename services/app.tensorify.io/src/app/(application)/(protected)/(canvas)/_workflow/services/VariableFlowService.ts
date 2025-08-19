import { WorkflowNode } from "../store/workflowStore";
import { PluginManifest } from "@/app/_store/store";

export interface EmittedVariable {
  name: string;
  sourceNodeId: string;
  sourceNodeType: string;
  pluginType: string;
  switchKey: string;
  isEnabled: boolean;
  isOnByDefault: boolean;
}

export interface VariableFlowInfo {
  // Variables available to this node from upstream
  availableVariables: EmittedVariable[];
  // Variables this node emits
  emittedVariables: EmittedVariable[];
  // Import statements this node contributes
  imports: Array<{
    path: string;
    items?: string[];
    alias?: string;
    as?: Record<string, string>;
  }>;
}

export class VariableFlowService {
  protected nodes: WorkflowNode[];
  protected manifests: PluginManifest[];
  protected adjacencyMap: Map<string, string[]> = new Map();
  protected reverseAdjacencyMap: Map<string, string[]> = new Map();

  constructor(nodes: WorkflowNode[], manifests: PluginManifest[]) {
    this.nodes = nodes;
    this.manifests = manifests;
    this.buildAdjacencyMaps();
  }

  /**
   * Build adjacency maps to track node dependencies
   */
  private buildAdjacencyMaps() {
    this.adjacencyMap.clear();
    this.reverseAdjacencyMap.clear();

    // Initialize maps
    this.nodes.forEach((node) => {
      this.adjacencyMap.set(node.id, []);
      this.reverseAdjacencyMap.set(node.id, []);
    });

    // Note: We don't have edge data here, so we'll need to get it from the workflow store
    // For now, we'll create a simple approach based on node positioning or route structure
    // This should be enhanced with actual edge data
  }

  /**
   * Get variable flow information for a specific node
   */
  public getVariableFlowInfo(nodeId: string): VariableFlowInfo {
    console.log(`🚀 [VariableFlowService] getVariableFlowInfo called for node: ${nodeId}`);
    
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) {
      console.log(`❌ [VariableFlowService] Node ${nodeId} not found!`);
      return {
        availableVariables: [],
        emittedVariables: [],
        imports: [],
      };
    }

    console.log(`📍 [VariableFlowService] Node info:`, {
      nodeId,
      nodeType: node.type,
      nodeRoute: node.route,
      nodeLabel: node.data.label
    });

    const availableVariables = this.getAvailableVariables(nodeId);
    const emittedVariables = this.getEmittedVariables(node);
    const imports = this.getNodeImports(node);

    console.log(`✅ [VariableFlowService] Final results for ${nodeId}:`, {
      availableVariables: availableVariables.length,
      emittedVariables: emittedVariables.length,
      imports: imports.length,
      availableVariableNames: availableVariables.map(v => v.name),
      emittedVariableNames: emittedVariables.map(v => v.name)
    });

    return {
      availableVariables,
      emittedVariables,
      imports,
    };
  }

  /**
   * Get variables available to a node from upstream dependencies
   * Uses lazy computation and proper reverse DFS to trace all previous nodes
   */
  private getAvailableVariables(nodeId: string): EmittedVariable[] {
    const currentNode = this.nodes.find((n) => n.id === nodeId);
    if (!currentNode) return [];

    // Get all nodes that come before this node in execution order
    const allPreviousNodes = this.getAllPreviousNodes(nodeId);
    const availableVariables: EmittedVariable[] = [];

    // Collect variables from all previous nodes
    allPreviousNodes.forEach((previousNodeId) => {
      const previousNode = this.nodes.find((n) => n.id === previousNodeId);
      if (previousNode) {
        const emittedVars = this.getEmittedVariables(previousNode);
        availableVariables.push(...emittedVars);
      }
    });

    // Remove duplicates based on variable name and source
    const uniqueVariables = availableVariables.filter(
      (variable, index, array) =>
        array.findIndex(
          (v) =>
            v.name === variable.name && v.sourceNodeId === variable.sourceNodeId
        ) === index
    );

    return uniqueVariables;
  }

  /**
   * Get variables emitted by a specific node
   */
  private getEmittedVariables(node: WorkflowNode): EmittedVariable[] {
    const manifest = this.getNodeManifest(node);
    if (!manifest?.manifest?.emits?.variables) {
      return [];
    }

    const nodeSettings = node.data.pluginSettings || {};

    return manifest.manifest.emits.variables.map((emitVar) => {
      // Extract the actual settings key from switchKey
      const settingsKey = emitVar.switchKey.includes(".")
        ? emitVar.switchKey.split(".").pop()!
        : emitVar.switchKey;

      // Check if the variable is enabled based on the settings toggle
      const isEnabled = (nodeSettings as any)[settingsKey] !== false;

      return {
        name: emitVar.value,
        sourceNodeId: node.id,
        sourceNodeType: node.type || "",
        pluginType: manifest.pluginType || "unknown",
        switchKey: emitVar.switchKey,
        isEnabled,
        isOnByDefault: emitVar.isOnByDefault || false,
      };
    });
  }

  /**
   * Get import statements contributed by a node
   */
  private getNodeImports(node: WorkflowNode): Array<{
    path: string;
    items?: string[];
    alias?: string;
    as?: Record<string, string>;
  }> {
    const manifest = this.getNodeManifest(node);
    return manifest?.manifest?.emits?.imports || [];
  }

  /**
   * Get the manifest for a specific node
   */
  private getNodeManifest(node: WorkflowNode): PluginManifest | undefined {
    if (!node.data.pluginId) return undefined;

    return this.manifests.find(
      (manifest) =>
        manifest.slug === node.data.pluginId ||
        manifest.id === node.data.pluginId
    );
  }

  /**
   * Get upstream nodes that this node depends on
   * This is a simplified implementation - should be enhanced with actual edge data
   */
  protected getUpstreamNodes(nodeId: string): string[] {
    return this.reverseAdjacencyMap.get(nodeId) || [];
  }

  /**
   * Get parent routes for a given route (e.g., "/nested1/sequence-123" -> ["/", "/nested1"])
   */
  private getParentRoutes(route: string): string[] {
    const parts = route.split("/").filter(Boolean);
    const parentRoutes: string[] = ["/"];

    for (let i = 0; i < parts.length - 1; i++) {
      const parentRoute = "/" + parts.slice(0, i + 1).join("/");
      parentRoutes.push(parentRoute);
    }

    return parentRoutes;
  }

  /**
   * Get nodes that are in the same nested context (same route level)
   */
  private getNestedPeerNodes(nodeId: string): string[] {
    const currentNode = this.nodes.find((n) => n.id === nodeId);
    if (!currentNode) return [];

    return this.nodes
      .filter((n) => n.id !== nodeId && n.route === currentNode.route)
      .map((n) => n.id);
  }

  /**
   * Get ALL nodes that come before the current node in execution order
   * Uses non-recursive reverse DFS with cross-route traversal
   * This is the core method for proper variable flow calculation
   */
  protected getAllPreviousNodes(nodeId: string): string[] {
    console.log(`🔄 [getAllPreviousNodes] Starting traversal for node: ${nodeId}`);
    
    const currentNode = this.nodes.find((n) => n.id === nodeId);
    if (!currentNode) {
      console.log(`❌ [getAllPreviousNodes] Node ${nodeId} not found!`);
      return [];
    }

    console.log(`📋 [getAllPreviousNodes] Current node:`, {
      nodeId,
      nodeType: currentNode.type,
      nodeRoute: currentNode.route,
      label: currentNode.data.label
    });

    const visited = new Set<string>();
    const previousNodes: string[] = [];
    const stack: Array<{ nodeId: string; route: string }> = [];

    // Start with the current node
    stack.push({ nodeId, route: currentNode.route });
    console.log(`🏁 [getAllPreviousNodes] Starting DFS traversal from route: ${currentNode.route}`);

    while (stack.length > 0) {
      const { nodeId: currentNodeId, route: currentRoute } = stack.pop()!;
      
      console.log(`🔍 [getAllPreviousNodes] Processing node: ${currentNodeId} (route: ${currentRoute})`);

      if (visited.has(currentNodeId)) {
        console.log(`⏭️ [getAllPreviousNodes] Skipping already visited node: ${currentNodeId}`);
        continue;
      }
      visited.add(currentNodeId);

      // Don't include the original node in the results
      if (currentNodeId !== nodeId) {
        previousNodes.push(currentNodeId);
        const currentNodeInfo = this.nodes.find(n => n.id === currentNodeId);
        console.log(`✅ [getAllPreviousNodes] Added previous node: ${currentNodeId} (${currentNodeInfo?.type}, route: ${currentNodeInfo?.route})`);
      }

      // Get direct predecessors in the current route
      const directPredecessors =
        this.reverseAdjacencyMap.get(currentNodeId) || [];
      for (const predId of directPredecessors) {
        if (!visited.has(predId)) {
          const predNode = this.nodes.find((n) => n.id === predId);
          if (predNode) {
            stack.push({ nodeId: predId, route: predNode.route });
          }
        }
      }

      // If we're in a nested route, also traverse to parent route nodes
      if (currentRoute !== "/") {
        const parentRoutes = this.getParentRoutes(currentRoute);

        for (const parentRoute of parentRoutes) {
          // Find nodes in parent routes that could feed into this nested context
          const parentRouteNodes = this.nodes.filter(
            (n) => n.route === parentRoute
          );

          for (const parentNode of parentRouteNodes) {
            if (!visited.has(parentNode.id)) {
              // Check if this parent node leads to our nested context
              if (
                this.doesNodeLeadToNestedContext(parentNode.id, currentRoute)
              ) {
                stack.push({ nodeId: parentNode.id, route: parentNode.route });
              }
            }
          }
        }
      }

      // If we're at a nested node entry point, trace back to the nested node container
      if (this.isNestedEntryPoint(currentNodeId, currentRoute)) {
        const containerNodeId = this.getNestedContainerNode(currentRoute);
        if (containerNodeId && !visited.has(containerNodeId)) {
          const containerNode = this.nodes.find(
            (n) => n.id === containerNodeId
          );
          if (containerNode) {
            stack.push({ nodeId: containerNodeId, route: containerNode.route });
          }
        }
      }

      // CRITICAL FIX: If we're in root route, also check for nested routes that flow back to root
      if (currentRoute === "/") {
        console.log(`🔥 [getAllPreviousNodes] CRITICAL: Processing root route node ${currentNodeId} - checking nested routes`);
        
        // Find all nested routes and check if they contribute to this execution path
        const nestedRoutes = [
          ...new Set(
            this.nodes.filter((n) => n.route !== "/").map((n) => n.route)
          ),
        ];
        
        console.log(`🗂️ [getAllPreviousNodes] Found nested routes:`, nestedRoutes);

        for (const nestedRoute of nestedRoutes) {
          console.log(`🔍 [getAllPreviousNodes] Checking if nested route ${nestedRoute} flows back to root node ${currentNodeId}`);
          
          // Check if this nested route flows back to the current root execution path
          if (this.doesNestedRouteFlowToRoot(nestedRoute, currentNodeId)) {
            console.log(`✅ [getAllPreviousNodes] Nested route ${nestedRoute} DOES flow back to root!`);
            
            // Add ALL nodes from this nested route that are part of the execution path
            const nestedNodes = this.nodes.filter(
              (n) => n.route === nestedRoute
            );
            
            console.log(`📦 [getAllPreviousNodes] Adding ${nestedNodes.length} nodes from nested route ${nestedRoute}:`, 
              nestedNodes.map(n => ({ id: n.id, type: n.type, label: n.data.label })));

            for (const nestedNode of nestedNodes) {
              if (!visited.has(nestedNode.id)) {
                stack.push({ nodeId: nestedNode.id, route: nestedNode.route });
                console.log(`➕ [getAllPreviousNodes] Added nested node ${nestedNode.id} to stack`);
              } else {
                console.log(`⏭️ [getAllPreviousNodes] Nested node ${nestedNode.id} already visited`);
              }
            }
          } else {
            console.log(`❌ [getAllPreviousNodes] Nested route ${nestedRoute} does NOT flow back to root`);
          }
        }
      }
    }

    return previousNodes;
  }

  /**
   * Check if a node leads to a nested context (e.g., connects to a nested node)
   */
  private doesNodeLeadToNestedContext(
    nodeId: string,
    targetRoute: string
  ): boolean {
    // Check if this node has edges that lead into the target nested route
    const directSuccessors = this.adjacencyMap.get(nodeId) || [];
    return directSuccessors.some((successorId) => {
      const successorNode = this.nodes.find((n) => n.id === successorId);
      return successorNode && successorNode.route.startsWith(targetRoute);
    });
  }

  /**
   * Check if a node is an entry point to a nested route (like a start node)
   */
  private isNestedEntryPoint(nodeId: string, route: string): boolean {
    if (route === "/") return false;

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return false;

    // Check if this is a start node in a nested route with no predecessors in the same route
    const isStartNode = node.type === "@tensorify/core/StartNode";
    const hasNoPredecessorsInRoute = (
      this.reverseAdjacencyMap.get(nodeId) || []
    ).every((predId) => {
      const predNode = this.nodes.find((n) => n.id === predId);
      return !predNode || predNode.route !== route;
    });

    return isStartNode && hasNoPredecessorsInRoute;
  }

  /**
   * Get the container node ID for a nested route (e.g., the nested node that contains this route)
   */
  private getNestedContainerNode(route: string): string | null {
    console.log(`🏗️ [getNestedContainerNode] Finding container for route: ${route}`);
    
    if (route === "/") {
      console.log(`🏗️ [getNestedContainerNode] Root route, no container needed`);
      return null;
    }

    // Extract container node ID from route pattern like "/nested1" or "/nested1/sequence-abc"
    const routeParts = route.split("/").filter(Boolean);
    console.log(`🏗️ [getNestedContainerNode] Route parts:`, routeParts);
    
    if (routeParts.length === 0) {
      console.log(`🏗️ [getNestedContainerNode] No route parts found`);
      return null;
    }

    // For routes like "/nested1", the container is "nested1"
    // For routes like "/nested1/sequence-abc", we need to find what leads to nested1
    const topLevelRoute = "/" + routeParts[0];
    console.log(`🏗️ [getNestedContainerNode] Top level route: ${topLevelRoute}`);

    console.log(`🏗️ [getNestedContainerNode] Checking adjacency map for connections...`);
    console.log(`🏗️ [getNestedContainerNode] Full adjacency map:`, Object.fromEntries(this.adjacencyMap));

    // Find nodes that connect to this nested route
    for (const [nodeId, successors] of this.adjacencyMap.entries()) {
      console.log(`🏗️ [getNestedContainerNode] Checking node ${nodeId} with successors:`, successors);
      
      const hasNestedSuccessor = successors.some((successorId) => {
        const successorNode = this.nodes.find((n) => n.id === successorId);
        const isMatch = successorNode && successorNode.route === topLevelRoute;
        console.log(`🏗️ [getNestedContainerNode] Successor ${successorId}: route=${successorNode?.route}, matches=${isMatch}`);
        return isMatch;
      });

      if (hasNestedSuccessor) {
        console.log(`✅ [getNestedContainerNode] Found container node: ${nodeId}`);
        return nodeId;
      }
    }

    console.log(`❌ [getNestedContainerNode] No container node found for route ${route}`);
    return null;
  }

  /**
   * Check if a nested route flows back to a root node (critical for nested-to-root variable flow)
   */
  private doesNestedRouteFlowToRoot(
    nestedRoute: string,
    rootNodeId: string
  ): boolean {
    console.log(`🔗 [doesNestedRouteFlowToRoot] Checking if nested route ${nestedRoute} flows to root node ${rootNodeId}`);
    
    // Find the container node for this nested route
    const containerNodeId = this.getNestedContainerNode(nestedRoute);
    console.log(`📦 [doesNestedRouteFlowToRoot] Container node for ${nestedRoute}: ${containerNodeId}`);
    
    if (!containerNodeId) {
      console.log(`❌ [doesNestedRouteFlowToRoot] No container node found for route ${nestedRoute}`);
      return false;
    }

    // Check if the container node is connected to a path that leads to the root node
    const isConnected = this.isNodeInExecutionPath(containerNodeId, rootNodeId);
    console.log(`🛤️ [doesNestedRouteFlowToRoot] Container ${containerNodeId} → Root ${rootNodeId}: ${isConnected}`);
    
    return isConnected;
  }

  /**
   * Check if nodeA is in the execution path that leads to nodeB
   */
  private isNodeInExecutionPath(nodeA: string, nodeB: string): boolean {
    // Use a simple BFS to check if there's a path from nodeA to nodeB
    const visited = new Set<string>();
    const queue = [nodeA];

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      if (visited.has(currentNode)) continue;
      visited.add(currentNode);

      if (currentNode === nodeB) return true;

      // Add all successors to the queue
      const successors = this.adjacencyMap.get(currentNode) || [];
      for (const successor of successors) {
        if (!visited.has(successor)) {
          queue.push(successor);
        }
      }
    }

    return false;
  }

  /**
   * Check if nodeA comes before nodeB in the workflow execution order
   * This is a simplified check based on position or connectivity
   */
  private isNodeBefore(nodeAId: string, nodeBId: string): boolean {
    // Check if nodeA is upstream of nodeB through the adjacency graph
    const upstreamOfB = this.getUpstreamNodes(nodeBId);
    return upstreamOfB.includes(nodeAId);
  }

  /**
   * Get the plugin type icon based on the plugin type
   */
  public static getPluginTypeIcon(pluginType: string): string {
    const iconMap: Record<string, string> = {
      model_layer: "layers",
      sequence: "list",
      optimizer: "settings",
      criterion: "infinity",
      trainer: "chart-network",
      dataloader: "loader",
      dataset: "database",
      metric: "activity",
      scheduler: "clock",
      regularizer: "filter",
      preprocessor: "filter",
      postprocessor: "workflow",
      function: "git-branch",
      pipeline: "workflow",
      custom: "ship-wheel",
      unknown: "help-circle",
    };

    return iconMap[pluginType] || iconMap["unknown"];
  }

  /**
   * Get the plugin type color for theming
   */
  public static getPluginTypeColor(pluginType: string): string {
    const colorMap: Record<string, string> = {
      model_layer: "hsl(var(--primary))",
      sequence: "hsl(var(--secondary))",
      optimizer: "hsl(var(--accent))",
      criterion: "hsl(var(--destructive))",
      trainer: "hsl(var(--success))",
      dataloader: "hsl(var(--warning))",
      dataset: "hsl(var(--info))",
      metric: "hsl(var(--muted-foreground))",
      scheduler: "hsl(var(--chart-1))",
      regularizer: "hsl(var(--chart-2))",
      preprocessor: "hsl(var(--chart-3))",
      postprocessor: "hsl(var(--chart-4))",
      function: "hsl(var(--chart-5))",
      pipeline: "hsl(var(--primary))",
      custom: "hsl(var(--accent))",
      unknown: "hsl(var(--muted-foreground))",
    };

    return colorMap[pluginType] || colorMap["unknown"];
  }
}

/**
 * Enhanced VariableFlowService that includes edge data for accurate dependency tracking
 */
export class EnhancedVariableFlowService extends VariableFlowService {
  private edges: Array<{
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;

  constructor(
    nodes: WorkflowNode[],
    manifests: PluginManifest[],
    edges: Array<{
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>
  ) {
    super(nodes, manifests);
    this.edges = edges;
    this.buildAdjacencyMapsFromEdges();
  }

  /**
   * Build adjacency maps using actual edge data
   */
  private buildAdjacencyMapsFromEdges() {
    this.adjacencyMap.clear();
    this.reverseAdjacencyMap.clear();

    // Initialize maps
    this.nodes.forEach((node) => {
      this.adjacencyMap.set(node.id, []);
      this.reverseAdjacencyMap.set(node.id, []);
    });

    // Build adjacency based on edges
    this.edges.forEach((edge) => {
      // Forward adjacency (source -> target)
      const targets = this.adjacencyMap.get(edge.source) || [];
      if (!targets.includes(edge.target)) {
        targets.push(edge.target);
        this.adjacencyMap.set(edge.source, targets);
      }

      // Reverse adjacency (target <- source)
      const sources = this.reverseAdjacencyMap.get(edge.target) || [];
      if (!sources.includes(edge.source)) {
        sources.push(edge.source);
        this.reverseAdjacencyMap.set(edge.target, sources);
      }
    });
  }

  /**
   * Get upstream nodes using the enhanced non-recursive algorithm
   * Override to use the improved getAllPreviousNodes method
   */
  protected getUpstreamNodes(nodeId: string): string[] {
    // Use the enhanced getAllPreviousNodes method for better cross-route support
    return this.getAllPreviousNodes(nodeId);
  }
}
