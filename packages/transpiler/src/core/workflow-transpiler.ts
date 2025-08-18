import { createPluginEngine, PluginEngine } from "@tensorify.io/plugin-engine";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { LocalFileStorageService } = require("@tensorify.io/plugin-engine");
import fs from "fs";
import path from "path";
import {
  WorkflowNode,
  WorkflowEdge,
  SpecialNodeType,
  isPluginNode,
  isSpecialNode,
} from "./types/workflow";
import {
  TranspilerConfig,
  TranspilerResult,
  Path,
  RouteInfo,
  PluginResult,
} from "./types/transpiler";

// Helper functions to detect specific node types
function isStartNode(nodeType?: string): boolean {
  if (!nodeType) return false;
  return (
    nodeType === SpecialNodeType.Start ||
    nodeType === "@tensorify/core/StartNode"
  );
}

function isEndNode(nodeType?: string): boolean {
  if (!nodeType) return false;
  return (
    nodeType === SpecialNodeType.End || nodeType === "@tensorify/core/EndNode"
  );
}

function isNestedNode(nodeType?: string): boolean {
  if (!nodeType) return false;
  return (
    nodeType === SpecialNodeType.Nested ||
    nodeType === "@tensorify/core/NestedNode"
  );
}

/**
 * Main function to generate code from a workflow
 */
export async function generateCode(
  config: TranspilerConfig
): Promise<TranspilerResult> {
  const { nodes, edges, s3Config, bucketName, debug } = config;

  console.log("Generating code with config:", {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    debug,
  });

  // Create plugin engine with offline-first in development when bucketName points to a local folder
  let engine: any;
  const isDev = process.env.NODE_ENV === "development";
  if (isDev && bucketName && fs.existsSync(bucketName)) {
    engine = new PluginEngine({
      storageService: new LocalFileStorageService(),
      bucketName,
      debug: true,
    });
  } else {
    engine = createPluginEngine(s3Config, bucketName, { debug });
  }

  try {
    // Find all paths from start nodes to end nodes in root route
    const paths = findAllPaths(nodes, edges);
    console.log("Found paths:", paths.length, "paths:");
    paths.forEach((path, i) => {
      console.log(
        `  Path ${i + 1}: ${path.nodes.join(" → ")} (ends at ${path.endNodeId})`
      );
    });

    // Get plugin results for all plugin nodes in the paths
    const collectedChildErrors: Record<string, string> = {};
    const pluginResults = await getPluginResults(
      nodes,
      paths,
      engine,
      collectedChildErrors
    );
    console.log("Plugin results:", pluginResults);

    // Generate artifacts for each path
    const artifacts = generateArtifacts(paths, pluginResults);
    console.log("Generated artifacts:", Object.keys(artifacts));

    // Convert paths to simple format for response
    const pathsSimple: Record<string, string[]> = {};

    // Group paths by endNodeId to handle multiple paths to same endpoint
    const pathsByEndNode: Record<string, Path[]> = {};
    paths.forEach((path) => {
      if (!pathsByEndNode[path.endNodeId]) {
        pathsByEndNode[path.endNodeId] = [];
      }
      pathsByEndNode[path.endNodeId].push(path);
    });

    // Create path entries with unique keys for multiple paths to same endpoint
    Object.entries(pathsByEndNode).forEach(([endNodeId, pathsToEndNode]) => {
      pathsToEndNode.forEach((path, index) => {
        // Create unique path key: use endNodeId for single path, add suffix for multiple paths
        const pathKey =
          pathsToEndNode.length === 1
            ? endNodeId
            : `${endNodeId}_path${index + 1}`;

        pathsSimple[pathKey] = path.nodes;
      });
    });

    // Collect node execution errors (if any)
    const errorsByNodeId: Record<string, string> = { ...collectedChildErrors };
    for (const [nid, result] of Object.entries(pluginResults)) {
      if ((result as any)?.error) {
        errorsByNodeId[nid] = String((result as any).error);
      }
    }

    // Build errorsByArtifactId mapping: artifactId -> { nodeId -> error message }
    const errorsByArtifactId: Record<string, Record<string, string>> = {};
    Object.entries(pathsByEndNode).forEach(([endNodeId, pathsToEndNode]) => {
      pathsToEndNode.forEach((path, index) => {
        // Create unique artifact key: use endNodeId for single path, add suffix for multiple paths
        const artifactId =
          pathsToEndNode.length === 1
            ? endNodeId
            : `${endNodeId}_path${index + 1}`;

        const artifactErrors: Record<string, string> = {};

        // Check each node in this path for errors
        path.nodes.forEach((nodeId) => {
          if (errorsByNodeId[nodeId]) {
            artifactErrors[nodeId] = errorsByNodeId[nodeId];
          }
        });

        // Also check for child node errors from sequence nodes in this path
        path.nodes.forEach((nodeId) => {
          const node = nodes.find((n) => n.id === nodeId);
          if (node && Array.isArray((node.data as any)?.sequenceItems)) {
            const sequenceItems: any[] = (node.data as any).sequenceItems;
            sequenceItems.forEach((child) => {
              const childNodeId = child.nodeId;
              if (childNodeId && errorsByNodeId[childNodeId]) {
                artifactErrors[childNodeId] = errorsByNodeId[childNodeId];
              }
            });
          }
        });

        // Only include artifacts that have errors
        if (Object.keys(artifactErrors).length > 0) {
          errorsByArtifactId[artifactId] = artifactErrors;
        }
      });
    });

    return {
      artifacts,
      paths: pathsSimple,
      errorsByNodeId: Object.keys(errorsByNodeId).length
        ? errorsByNodeId
        : undefined,
      errorsByArtifactId: Object.keys(errorsByArtifactId).length
        ? errorsByArtifactId
        : undefined,
    };
  } finally {
    // Clean up engine resources
    await engine.dispose();
  }
}

/**
 * Find all paths from start nodes to end nodes, handling nested workflows
 * Uses DFS with stack-based approach for server safety
 */
function findAllPaths(nodes: WorkflowNode[], edges: WorkflowEdge[]): Path[] {
  console.log("Finding paths with enhanced nested node support");
  console.log(
    "Input nodes:",
    nodes.map((n) => ({ id: n.id, type: n.type, route: n.route }))
  );

  // First, discover all routes and their structure
  const routeInfo = discoverRoutes(nodes, edges);
  console.log("Discovered routes:", routeInfo);

  // Find paths within each route
  const allRoutePaths: Path[] = [];
  for (const route of Object.values(routeInfo)) {
    const routePaths = findPathsInRoute(route, nodes, edges);
    allRoutePaths.push(...routePaths);
  }

  console.log("Found route paths:", allRoutePaths);

  // Expand nested paths to create final artifacts
  const expandedPaths = expandNestedPaths(
    allRoutePaths,
    routeInfo,
    nodes,
    edges
  );
  console.log("Final expanded paths:", expandedPaths);

  return expandedPaths;
}

/**
 * Discover all routes in the workflow and their hierarchical structure
 */
function discoverRoutes(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Record<string, RouteInfo> {
  const routeInfo: Record<string, RouteInfo> = {};

  // Group nodes by route
  const nodesByRoute: Record<string, WorkflowNode[]> = {};
  nodes.forEach((node) => {
    const route = node.route || "/";
    if (!nodesByRoute[route]) {
      nodesByRoute[route] = [];
    }
    nodesByRoute[route].push(node);
  });

  // Create route info for each route
  Object.entries(nodesByRoute).forEach(([route, routeNodes]) => {
    const startNodes = routeNodes
      .filter((node) => isStartNode(node.type))
      .map((n) => n.id);
    const endNodes = routeNodes
      .filter((node) => isEndNode(node.type))
      .map((n) => n.id);

    // Determine parent route and nested node ID
    let parentRoute: string | undefined;
    let nestedNodeId: string | undefined;

    if (route !== "/") {
      const pathParts = route.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        nestedNodeId = pathParts[pathParts.length - 1];
        parentRoute =
          pathParts.length > 1 ? "/" + pathParts.slice(0, -1).join("/") : "/";
      }
    }

    routeInfo[route] = {
      route,
      parentRoute,
      nestedNodeId,
      startNodes,
      endNodes,
      nodes: routeNodes.map((n) => n.id),
    };
  });

  return routeInfo;
}

/**
 * Find all paths within a specific route using DFS with stack
 */
function findPathsInRoute(
  routeInfo: RouteInfo,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Path[] {
  const paths: Path[] = [];
  const { route, startNodes, endNodes } = routeInfo;

  console.log(`Finding paths in route ${route}:`, { startNodes, endNodes });

  // Build adjacency list for this route only
  const adjacency = buildAdjacencyForRoute(route, nodes, edges);
  const nodeMap = createNodeMap(nodes);

  // Use DFS with stack for each start node (server-safe, no recursion)
  startNodes.forEach((startNodeId) => {
    const stack: { nodeId: string; path: string[]; visited: Set<string> }[] = [
      {
        nodeId: startNodeId,
        path: [startNodeId],
        visited: new Set([startNodeId]),
      },
    ];

    while (stack.length > 0) {
      const { nodeId, path, visited } = stack.pop()!;
      const node = nodeMap[nodeId];

      if (!node) continue;

      // If we reached an end node in this route, save the path
      if (endNodes.includes(nodeId)) {
        paths.push({
          endNodeId: nodeId,
          nodes: path,
          route: route,
        });
        continue;
      }

      // Add neighbors to stack (cycle detection via visited set)
      const neighbors = adjacency[nodeId] || [];
      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          const newVisited = new Set(visited);
          newVisited.add(neighborId);
          stack.push({
            nodeId: neighborId,
            path: [...path, neighborId],
            visited: newVisited,
          });
        }
      });
    }
  });

  console.log(`Found ${paths.length} paths in route ${route}`);
  return paths;
}

/**
 * Build adjacency list for nodes within a specific route
 */
function buildAdjacencyForRoute(
  route: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Record<string, string[]> {
  const adjacency: Record<string, string[]> = {};

  // Get nodes in this route
  const routeNodes = nodes.filter((n) => n.route === route);
  const routeNodeIds = new Set(routeNodes.map((n) => n.id));

  // Initialize adjacency
  routeNodes.forEach((n) => {
    adjacency[n.id] = [];
  });

  // Add edges that connect nodes within this route
  edges.forEach((edge) => {
    // Only include edges where both nodes are in this route
    if (routeNodeIds.has(edge.source) && routeNodeIds.has(edge.target)) {
      // Handle both explicit handle types and fallback
      const sourceHandle = (edge as any).sourceHandle;
      const targetHandle = (edge as any).targetHandle;

      // Helper function to check if a handle is a Branch node numbered output
      const isBranchNextHandle = (handleId: string) =>
        /^next-\d+$/.test(handleId);

      // Prefer next->prev flow, but allow nested node handles, Branch node numbered handles, and fallback to any connection
      const isValidFlow =
        (sourceHandle === "next" && targetHandle === "prev") ||
        (isBranchNextHandle(sourceHandle) && targetHandle === "prev") ||
        (sourceHandle === "nested-output" && targetHandle === "nested-input") ||
        (sourceHandle === "next" && targetHandle === "nested-input") ||
        (isBranchNextHandle(sourceHandle) && targetHandle === "nested-input") ||
        (sourceHandle === "nested-output" && targetHandle === "prev") ||
        (!sourceHandle && !targetHandle); // Fallback for untyped edges

      if (isValidFlow) {
        if (!adjacency[edge.source]) adjacency[edge.source] = [];
        adjacency[edge.source].push(edge.target);
      }
    }
  });

  // If no valid flows found, fallback to all edges within route
  const hasAnyAdjacency = Object.values(adjacency).some(
    (arr) => arr.length > 0
  );
  if (!hasAnyAdjacency) {
    edges.forEach((edge) => {
      if (routeNodeIds.has(edge.source) && routeNodeIds.has(edge.target)) {
        if (!adjacency[edge.source]) adjacency[edge.source] = [];
        adjacency[edge.source].push(edge.target);
      }
    });
  }

  return adjacency;
}

/**
 * Expand nested paths by replacing nested nodes with their internal workflows
 */
function expandNestedPaths(
  routePaths: Path[],
  routeInfo: Record<string, RouteInfo>,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Path[] {
  const nodeMap = createNodeMap(nodes);
  const expandedPaths: Path[] = [];

  // Group paths by route
  const pathsByRoute: Record<string, Path[]> = {};
  routePaths.forEach((path) => {
    if (!pathsByRoute[path.route]) {
      pathsByRoute[path.route] = [];
    }
    pathsByRoute[path.route].push(path);
  });

  // Start with root route paths
  const rootPaths = pathsByRoute["/"] || [];

  if (rootPaths.length === 0) {
    console.log("No root paths found, returning all route paths as-is");
    return routePaths;
  }

  // Expand each root path
  rootPaths.forEach((rootPath) => {
    const expansions = expandSinglePath(
      rootPath,
      pathsByRoute,
      routeInfo,
      nodeMap
    );
    expandedPaths.push(...expansions);
  });

  return expandedPaths;
}

/**
 * Expand a single path by replacing nested nodes with their internal workflows
 */
function expandSinglePath(
  path: Path,
  pathsByRoute: Record<string, Path[]>,
  routeInfo: Record<string, RouteInfo>,
  nodeMap: Record<string, WorkflowNode>
): Path[] {
  // Check if path contains any nested nodes
  const nestedNodeIds = path.nodes.filter((nodeId) => {
    const node = nodeMap[nodeId];
    return node && isNestedNode(node.type);
  });

  if (nestedNodeIds.length === 0) {
    // No nested nodes, return as-is
    return [{ ...path, isExpanded: true }];
  }

  // For each nested node, find its internal paths and create combinations
  let expandedPaths = [path];

  nestedNodeIds.forEach((nestedNodeId) => {
    const nestedRoute = `${path.route === "/" ? "" : path.route}/${nestedNodeId}`;
    const nestedPaths = pathsByRoute[nestedRoute] || [];

    if (nestedPaths.length === 0) {
      console.log(
        `No internal paths found for nested node ${nestedNodeId} in route ${nestedRoute}`
      );
      return;
    }

    // Create new combinations by replacing the nested node with each internal path
    const newExpandedPaths: Path[] = [];

    expandedPaths.forEach((currentPath) => {
      nestedPaths.forEach((nestedPath) => {
        const newNodes = [...currentPath.nodes];
        const nestedIndex = newNodes.indexOf(nestedNodeId);

        if (nestedIndex !== -1) {
          // Replace the nested node with the internal path (excluding nested start/end nodes)
          const internalNodes = nestedPath.nodes.filter((nodeId) => {
            const node = nodeMap[nodeId];
            return node && !isStartNode(node.type) && !isEndNode(node.type);
          });

          newNodes.splice(nestedIndex, 1, ...internalNodes);

          newExpandedPaths.push({
            endNodeId: currentPath.endNodeId,
            nodes: newNodes,
            route: currentPath.route,
            isExpanded: true,
          });
        }
      });
    });

    expandedPaths = newExpandedPaths;
  });

  return expandedPaths;
}

/**
 * Create a node lookup map
 */
function createNodeMap(nodes: WorkflowNode[]): Record<string, WorkflowNode> {
  const nodeMap: Record<string, WorkflowNode> = {};
  nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });
  return nodeMap;
}

/**
 * Get plugin results for all plugin nodes in the paths
 */
async function getPluginResults(
  nodes: WorkflowNode[],
  paths: Path[],
  engine: any,
  childErrors?: Record<string, string>
): Promise<Record<string, PluginResult>> {
  const results: Record<string, PluginResult> = {};
  const processedNodes = new Set<string>();

  // Create node lookup
  const nodeMap: Record<string, WorkflowNode> = {};
  nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });

  // Collect all plugin nodes from all paths
  const pluginNodeIds = new Set<string>();
  paths.forEach((path) => {
    path.nodes.forEach((nodeId) => {
      const node = nodeMap[nodeId];
      if (node && isPluginNode(node.type)) {
        pluginNodeIds.add(nodeId);
      }
    });
  });

  // Process each plugin node
  for (const nodeId of pluginNodeIds) {
    if (processedNodes.has(nodeId)) {
      continue;
    }
    processedNodes.add(nodeId);

    const node = nodeMap[nodeId];
    if (!node || !node.type) {
      continue;
    }

    try {
      // Get the plugin slug from node data (pluginId field)
      const slug = (node.data as any)?.pluginId || node.type;

      // Get plugin settings from node data (pluginSettings field)
      const baseSettings = (node.data as any)?.pluginSettings || {};

      console.log({ baseSettings });

      // Include the label in the plugin settings and pass children code if defined (for sequence-like plugins)
      const payload: any = {
        ...baseSettings,
        labelName: (node.data as any)?.label, // Some plugins might expect labelName
      };

      // If node carries sequence items in data.sequenceItems, execute them first and pass their code + settings
      if (Array.isArray((node.data as any)?.sequenceItems)) {
        const sequenceItems: any[] = (node.data as any).sequenceItems;
        const childrenResults: {
          slug: string;
          code: string;
          settings?: any;
          nodeId?: string;
          labelName?: string;
        }[] = [];
        const collectedChildImports: Array<{
          path: string;
          items?: string[];
          alias?: string;
          as?: Record<string, string>;
        }> = [];
        for (const child of sequenceItems) {
          try {
            // Prefer the actual canvas node for settings (referenced by nodeId)
            const childNodeId: string | undefined = child.nodeId;
            const childNode = childNodeId ? nodeMap[childNodeId] : undefined;
            const childSlug =
              (childNode?.data as any)?.pluginId ||
              childNode?.type ||
              child.slug ||
              child.pluginId ||
              child.type;
            const childSettings =
              (childNode?.data as any)?.pluginSettings ||
              child.pluginSettings ||
              child.settings ||
              {};

            const childPayload = {
              ...childSettings,
              labelName:
                (childNode?.data as any)?.label || child.name || undefined,
            };

            const childResult = await engine.getExecutionResult(
              childSlug,
              childPayload,
              "TensorifyPlugin"
            );
            const childCode = childResult.code || "";
            childrenResults.push({
              slug: childSlug,
              code: childCode,
              settings: childSettings,
              nodeId: childNodeId,
              labelName:
                (childNode?.data as any)?.label || child.name || undefined,
            });

            // Heuristic: if plugin returned an error-like string instead of throwing,
            // capture it as an error for UI consumption
            if (childErrors && childNodeId) {
              const trimmed = (childCode || "").trim();
              if (
                trimmed.startsWith("Error:") ||
                trimmed.startsWith("# Error")
              ) {
                childErrors[childNodeId] = trimmed;
              }
            }

            // Collect child's imports from its manifest
            try {
              const childManifest = await engine.getPluginManifest(childSlug);
              const childImports =
                (childManifest?.emits?.imports as any[]) ||
                (childManifest?.frontendConfigs?.emits?.imports as any[]) ||
                [];
              if (Array.isArray(childImports)) {
                collectedChildImports.push(...childImports);
              }
            } catch {}
          } catch (childError) {
            console.error("Failed to execute sequence child:", childError);
            childrenResults.push({
              slug: String(child.slug || child.pluginId || "unknown"),
              code: `# Error executing child ${child.slug || child.pluginId}: ${childError}`,
              nodeId: child.nodeId,
            });
            if (childErrors && child.nodeId) {
              childErrors[child.nodeId] = String(
                childError instanceof Error ? childError.message : childError
              );
            }
          }
        }
        payload.children = childrenResults;
        (payload as any).childrenImports = collectedChildImports;
        // Keep itemsCount accurate for sequence plugins
        if ((node.data as any)?.pluginSettings?.itemsCount !== undefined) {
          payload.itemsCount = (node.data as any).pluginSettings.itemsCount;
        } else {
          payload.itemsCount = childrenResults.length;
        }
      }

      console.log(`Executing plugin for node ${nodeId}:`, { slug, payload });

      // Execute the plugin
      const result = await engine.getExecutionResult(
        slug,
        payload,
        "TensorifyPlugin"
      );

      // Fetch manifest to pull imports configuration (emits.imports)
      let manifestImports: Array<{
        path: string;
        items?: string[];
        alias?: string;
        as?: Record<string, string>;
      }> = [];
      try {
        const manifest = await engine.getPluginManifest(slug);
        manifestImports =
          (manifest?.emits?.imports as any[]) ||
          (manifest?.frontendConfigs?.emits?.imports as any[]) ||
          [];
      } catch {}

      // If this node is a sequence, include collected child imports as well
      const combinedImports = Array.isArray((payload as any).children)
        ? [
            ...(((payload as any).childrenImports as any[]) || []),
            ...manifestImports,
          ]
        : manifestImports;

      const topLevelCode = result.code || "";
      const base: PluginResult = {
        nodeId,
        code: topLevelCode,
        imports: combinedImports,
      };
      const trimmedTop = topLevelCode.trim();
      if (trimmedTop.startsWith("Error:") || trimmedTop.startsWith("# Error")) {
        (base as any).error = trimmedTop;
      }
      results[nodeId] = base;
    } catch (error) {
      console.error(`Failed to execute plugin for node ${nodeId}:`, error);
      results[nodeId] = {
        nodeId,
        code: `# Error executing plugin for node ${nodeId}: ${error}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return results;
}

/**
 * Generate artifacts by combining plugin results for each path
 */
function generateArtifacts(
  paths: Path[],
  pluginResults: Record<string, PluginResult>
): Record<string, string> {
  const artifacts: Record<string, string> = {};

  // Group paths by endNodeId to handle multiple paths to same endpoint
  const pathsByEndNode: Record<string, Path[]> = {};
  paths.forEach((path) => {
    if (!pathsByEndNode[path.endNodeId]) {
      pathsByEndNode[path.endNodeId] = [];
    }
    pathsByEndNode[path.endNodeId].push(path);
  });

  // Generate artifacts with unique keys for multiple paths to same endpoint
  Object.entries(pathsByEndNode).forEach(([endNodeId, pathsToEndNode]) => {
    pathsToEndNode.forEach((path, index) => {
      const codeChunks: string[] = [];
      const importConfigs: Array<{
        path: string;
        items?: string[];
        alias?: string;
        as?: Record<string, string>;
      }> = [];

      // Collect code chunks from plugin nodes in the path
      path.nodes.forEach((nodeId) => {
        const result = pluginResults[nodeId];
        if (result) {
          if (result.code) codeChunks.push(result.code);
          if (Array.isArray(result.imports))
            importConfigs.push(...result.imports);
        }
      });

      // Build import header intelligently
      const header = buildPythonImports(importConfigs);

      // Combine header + code chunks with an empty line after imports when present
      let combinedCode = "";
      if (header && codeChunks.length > 0) {
        combinedCode = [header, "", ...codeChunks].join("\n");
      } else if (header) {
        combinedCode = header;
      } else {
        combinedCode = codeChunks.join("\n");
      }

      // Format the code (you could use a formatter here)
      const formattedCode = formatCode(combinedCode);

      // Create unique artifact key: use endNodeId for single path, add suffix for multiple paths
      const artifactKey =
        pathsToEndNode.length === 1
          ? endNodeId
          : `${endNodeId}_path${index + 1}`;

      artifacts[artifactKey] = formattedCode;
    });
  });

  return artifacts;
}

function buildPythonImports(
  configs: Array<{
    path: string;
    items?: string[];
    alias?: string;
    as?: Record<string, string>;
  }>
): string {
  if (!configs || configs.length === 0) return "";

  // Track order and group by path
  const pathOrder: string[] = [];
  const basicImports: string[] = [];
  const fromImports: Map<
    string,
    { items: string[]; aliases: Record<string, string>; order: number }
  > = new Map();

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i] || ({} as any);
    const { path, items, alias, as = {} } = config;
    if (!path) continue;

    if (!items && !alias) {
      basicImports.push(path);
      if (!pathOrder.includes("__basic__")) pathOrder.push("__basic__");
    } else if (!items && alias) {
      basicImports.push(`${path} as ${alias}`);
      if (!pathOrder.includes("__basic__")) pathOrder.push("__basic__");
    } else if (items) {
      if (!fromImports.has(path)) {
        fromImports.set(path, { items: [], aliases: {}, order: i });
        pathOrder.push(path);
      }
      const existing = fromImports.get(path)!;
      existing.items.push(...items);
      Object.assign(existing.aliases, as);
    }
  }

  const result: string[] = [];
  for (const pathKey of pathOrder) {
    if (pathKey === "__basic__") {
      if (basicImports.length > 0) {
        result.push(`import ${basicImports.join(", ")}`);
      }
    } else {
      const group = fromImports.get(pathKey)!;
      const importItems = group.items.map((item) => {
        const alias = group.aliases[item];
        return alias ? `${item} as ${alias}` : item;
      });
      result.push(`from ${pathKey} import ${importItems.join(", ")}`);
    }
  }

  return result.join("\n");
}

/**
 * Format the combined code
 * This is a simple implementation - you could integrate with Black or other formatters
 */
function formatCode(code: string): string {
  // Remove multiple empty lines
  const lines = code.split("\n");
  const formattedLines: string[] = [];
  let prevEmpty = false;

  lines.forEach((line) => {
    const isEmpty = line.trim() === "";
    if (isEmpty && prevEmpty) {
      return; // Skip multiple empty lines
    }
    formattedLines.push(line);
    prevEmpty = isEmpty;
  });

  return formattedLines.join("\n").trim();
}
