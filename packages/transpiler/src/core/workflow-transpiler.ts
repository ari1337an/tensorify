import { createPluginEngine, PluginEngine } from "@tensorify.io/plugin-engine";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { LocalFileStorageService } = require("@tensorify.io/plugin-engine");
import fs from "fs";
import path from "path";
import {
  WorkflowNode,
  WorkflowEdge,
  SpecialNodeType,
  CodeGeneratingNodeType,
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

  // console.log("Generating code with config:", {
  //   nodeCount: nodes.length,
  //   edgeCount: edges.length,
  //   debug,
  // });

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
    // console.log("Found paths:", paths.length, "paths:");
    // paths.forEach((path, i) => {
    //   console.log(
    //     `  Path ${i + 1}: ${path.nodes.join(" → ")} (ends at ${path.endNodeId})`
    //   );
    // });

    // Get plugin results for all plugin nodes in the paths
    const collectedChildErrors: Record<string, string> = {};
    const pluginResults = await getPluginResults(
      nodes,
      paths,
      engine,
      collectedChildErrors
    );
    // console.log("Plugin results:", pluginResults);

    // Generate artifacts for each path
    const artifacts = generateArtifacts(paths, pluginResults);
    // console.log("Generated artifacts:", Object.keys(artifacts));

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
  // console.log("Finding paths with enhanced nested node support");
  // console.log(
  //   "Input nodes:",
  //   nodes.map((n) => ({ id: n.id, type: n.type, route: n.route }))
  // );

  // First, discover all routes and their structure
  const routeInfo = discoverRoutes(nodes, edges);
  // console.log("Discovered routes:", routeInfo);

  // Find paths within each route
  const allRoutePaths: Path[] = [];
  for (const route of Object.values(routeInfo)) {
    const routePaths = findPathsInRoute(route, nodes, edges);
    allRoutePaths.push(...routePaths);
  }

  // console.log("Found route paths:", allRoutePaths);

  // Expand nested paths to create final artifacts
  const expandedPaths = expandNestedPaths(
    allRoutePaths,
    routeInfo,
    nodes,
    edges
  );
  // console.log("Final expanded paths:", expandedPaths);

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

  // console.log(`Finding paths in route ${route}:`, { startNodes, endNodes });

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

  // console.log(`Found ${paths.length} paths in route ${route}`);
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
    // console.log("No root paths found, returning all route paths as-is");
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
      // console.log(
      //   `No internal paths found for nested node ${nestedNodeId} in route ${nestedRoute}`
      // );
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
 * Generate Python class code from ClassNode data with support for constructor items and @classnodeself
 */
function generatePythonClassCode(data: {
  className: string;
  baseClass?: { name: string; importPath?: string } | null;
  constructorParameters?: Array<{
    name: string;
    type: string;
    value: string;
    defaultValue?: string;
    propertyName?: string;
  }>;
  constructorItems?: Array<{
    id: string;
    type: "parameter" | "code";
    parameter?: {
      name: string;
      type: string;
      value: string;
      defaultValue?: string;
      propertyName?: string;
    };
    code?: string;
  }>;
  methods: Array<{
    name: string;
    parameters: Array<{
      name: string;
      type: string;
      value: string;
      defaultValue?: string;
    }>;
    code: string;
  }>;
}): string {
  const {
    className,
    baseClass,
    constructorParameters = [],
    constructorItems = [],
    methods,
  } = data;
  const lines: string[] = [];

  // Class definition
  const classLine = baseClass
    ? `class ${className}(${baseClass.name}):`
    : `class ${className}:`;
  lines.push(classLine);

  // Collect all constructor parameters (legacy + new items)
  const allConstructorParams: Array<{
    name: string;
    defaultValue?: string;
  }> = [];

  // Add legacy constructor parameters
  constructorParameters.forEach((p) => {
    allConstructorParams.push({
      name: p.name,
      defaultValue: p.defaultValue,
    });
  });

  // Add parameters from constructor items
  constructorItems.forEach((item) => {
    if (item.type === "parameter" && item.parameter) {
      allConstructorParams.push({
        name: item.parameter.name,
        defaultValue: item.parameter.defaultValue,
      });
    }
  });

  // Constructor signature
  const hasParams = allConstructorParams.length > 0;
  if (hasParams) {
    const paramList = [
      "self",
      ...allConstructorParams.map((p) => {
        const defaultPart = p.defaultValue ? `=${p.defaultValue}` : "";
        return `${p.name}${defaultPart}`;
      }),
    ].join(", ");
    lines.push(`    def __init__(${paramList}):`);
  } else {
    lines.push("    def __init__(self):");
  }

  // Add super() call if base class exists
  if (baseClass) {
    lines.push("        super().__init__()");
  }

  // Constructor body - legacy parameters first
  let hasConstructorBody = false;
  constructorParameters.forEach((param) => {
    const propertyName = param.propertyName || param.name;
    lines.push(`        self.${propertyName} = ${param.name}`);
    hasConstructorBody = true;
  });

  // Constructor body - process constructor items
  constructorItems.forEach((item) => {
    if (item.type === "parameter" && item.parameter) {
      const propertyName = item.parameter.propertyName || item.parameter.name;
      lines.push(`        self.${propertyName} = ${item.parameter.name}`);
      hasConstructorBody = true;
    } else if (item.type === "code" && item.code) {
      // Process code block - remove @classnodeself decorators
      const processedCode = removeClassNodeSelfDecorators(item.code);
      const codeLines = processedCode.split("\n");
      codeLines.forEach((line) => {
        if (line.trim()) {
          lines.push(`        ${line}`);
          hasConstructorBody = true;
        }
      });
    }
  });

  // Add pass if no constructor body
  if (!hasConstructorBody) {
    lines.push("        pass");
  }

  // Add auto-methods for base classes if they don't exist
  const autoMethods = getAutoMethodsForBaseClass(baseClass, methods);
  const allMethods = [...autoMethods, ...methods];

  // Methods
  allMethods.forEach((method) => {
    lines.push("");
    const methodParamList = [
      "self",
      ...method.parameters.map((p) => {
        const defaultPart = p.defaultValue ? `=${p.defaultValue}` : "";
        return `${p.name}${defaultPart}`;
      }),
    ].join(", ");
    lines.push(`    def ${method.name}(${methodParamList}):`);

    if (method.code.trim()) {
      const codeLines = method.code.split("\n");
      codeLines.forEach((line) => {
        lines.push(`        ${line}`);
      });
    } else {
      lines.push("        pass");
    }
  });

  return lines.join("\n");
}

/**
 * Remove @classnodeself decorators from code blocks (they're for UI intellisense only)
 */
function removeClassNodeSelfDecorators(code: string): string {
  const lines = code.split("\n");
  const filteredLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip @classnodeself decorator lines
    if (line.trim() === "@classnodeself") {
      continue;
    }
    filteredLines.push(line);
  }

  return filteredLines.join("\n");
}

/**
 * Get auto-methods for base classes (torch.nn.Module, Dataset, etc.)
 */
function getAutoMethodsForBaseClass(
  baseClass: { name: string; importPath?: string } | null | undefined,
  existingMethods: Array<{ name: string; parameters: any[]; code: string }>
): Array<{ name: string; parameters: any[]; code: string }> {
  if (!baseClass || baseClass.name === "No base class") {
    return [];
  }

  const autoMethods: Array<{ name: string; parameters: any[]; code: string }> =
    [];
  const existingMethodNames = existingMethods.map((m) => m.name);

  if (baseClass.name === "torch.nn.Module") {
    // Add forward method if it doesn't exist
    if (!existingMethodNames.includes("forward")) {
      autoMethods.push({
        name: "forward",
        parameters: [
          { name: "x", type: "variable", value: "", defaultValue: "" },
        ],
        code: "        # Define the forward pass of your neural network\n        # Example:\n        # x = self.layer1(x)\n        # return x\n        pass",
      });
    }
  } else if (baseClass.name === "torch.utils.data.Dataset") {
    // Add __len__ method if it doesn't exist
    if (!existingMethodNames.includes("__len__")) {
      autoMethods.push({
        name: "__len__",
        parameters: [],
        code: "        # Return the size of the dataset\n        # Example:\n        # return len(self.data)\n        pass",
      });
    }

    // Add __getitem__ method if it doesn't exist
    if (!existingMethodNames.includes("__getitem__")) {
      autoMethods.push({
        name: "__getitem__",
        parameters: [
          { name: "idx", type: "variable", value: "", defaultValue: "" },
        ],
        code: "        # Return a single item from the dataset\n        # Example:\n        # return self.data[idx], self.labels[idx]\n        pass",
      });
    }
  }

  return autoMethods;
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
      // Handle CustomCodeNode differently from regular plugin nodes
      if (node.type === CodeGeneratingNodeType.CustomCode) {
        const customCodeData = node.data as any;
        const code = customCodeData?.code || "";
        const customImports = customCodeData?.customImports || [];
        const emitsImports = customCodeData?.emitsConfig?.imports || [];

        // Process the code to replace $variable_name with actual variable references
        let processedCode = code;

        // Find all variables in format $variable_name and replace them
        // This is a simple implementation - could be enhanced with proper parsing
        const variablePattern = /\$(\w+)/g;
        processedCode = processedCode.replace(
          variablePattern,
          (match: string, varName: string) => {
            // Replace $variable_name with just variable_name
            // The actual variable should be available in the execution context
            return varName;
          }
        );

        // Combine all imports
        const allImports = [...emitsImports, ...customImports];

        // Store the result for this custom code node
        results[nodeId] = {
          nodeId: nodeId,
          code: processedCode,
          imports: allImports,
          error: undefined,
        };

        continue; // Skip the plugin execution for CustomCodeNode
      }

      // Handle ClassNode differently from regular plugin nodes
      if (node.type === CodeGeneratingNodeType.ClassNode) {
        const classNodeData = node.data as any;
        const className = classNodeData?.className || "MyClass";
        const baseClass = classNodeData?.baseClass;
        const constructorParameters =
          classNodeData?.constructorParameters || [];
        const constructorItems = classNodeData?.constructorItems || [];
        const methods = classNodeData?.methods || [];
        const customImports = classNodeData?.customImports || [];
        const emitsImports = classNodeData?.emitsConfig?.imports || [];

        // Generate Python class code with new constructor items support
        const classCode = generatePythonClassCode({
          className,
          baseClass,
          constructorParameters,
          constructorItems,
          methods,
        });

        // Process the class code to replace $variable_name with actual variable references
        let processedCode = classCode;
        const variablePattern = /\$(\w+)/g;
        processedCode = processedCode.replace(
          variablePattern,
          (match: string, varName: string) => {
            return varName;
          }
        );

        // Enhanced import handling with proper base class imports
        let allImports = [...emitsImports];

        // Add custom imports with alias support
        customImports.forEach((customImport: any) => {
          const importObj: any = {
            path: customImport.path,
            items: customImport.items || [],
          };

          // Handle import aliases
          if (customImport.alias) {
            importObj.alias = customImport.alias;
          }

          allImports.push(importObj);
        });

        // Add base class import with correct handling for torch.nn.Module, etc.
        if (baseClass && baseClass.name !== "No base class") {
          let baseClassImport: any = null;

          if (baseClass.name === "torch.nn.Module") {
            baseClassImport = {
              path: "torch",
              items: [],
              alias: undefined,
            };
          } else if (baseClass.name === "torch.utils.data.Dataset") {
            baseClassImport = {
              path: "torch",
              items: [],
              alias: undefined,
            };
          } else if (baseClass.importPath) {
            // Custom base class
            baseClassImport = {
              path: baseClass.importPath,
              items: [baseClass.name],
              alias: undefined,
            };
          }

          // Check if this import already exists to avoid duplication
          if (baseClassImport) {
            const existsAlready = allImports.some(
              (imp) =>
                imp.path === baseClassImport.path &&
                (baseClassImport.items.length === 0 ||
                  (imp.items && imp.items.includes(baseClass.name)))
            );
            if (!existsAlready) {
              allImports.unshift(baseClassImport);
            }
          }
        }

        // Store the result for this class node
        results[nodeId] = {
          nodeId: nodeId,
          code: processedCode,
          imports: allImports,
          error: undefined,
        };

        continue; // Skip the plugin execution for ClassNode
      }

      // Get the plugin slug from node data (pluginId field)
      const slug = (node.data as any)?.pluginId || node.type;

      // Get plugin settings from node data (pluginSettings field)
      const baseSettings = (node.data as any)?.pluginSettings || {};

      // console.log({ baseSettings });

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

      // console.log(`Executing plugin for node ${nodeId}:`, { slug, payload });

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

      // Build import header intelligently with conflict resolution
      const { importHeader, aliasReplacements } =
        buildIntelligentPythonImports(importConfigs);

      // Apply alias replacements to code chunks
      const processedCodeChunks = codeChunks.map((code) =>
        applyAliasReplacements(code, aliasReplacements)
      );

      // Combine header + processed code chunks with an empty line after imports when present
      let combinedCode = "";
      if (importHeader && processedCodeChunks.length > 0) {
        // Join code chunks with empty lines between them, then combine with imports
        const codeWithSpacing = processedCodeChunks.join("\n\n");
        combinedCode = [importHeader, "", codeWithSpacing].join("\n");
      } else if (importHeader) {
        combinedCode = importHeader;
      } else {
        // Join code chunks with empty lines between them for consistent spacing
        combinedCode = processedCodeChunks.join("\n\n");
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

/**
 * Generate a unique alias by appending a number to avoid conflicts
 */
function generateUniqueAlias(
  originalAlias: string,
  conflictCount: number
): string {
  // Convert camelCase/PascalCase to snake_case for Python conventions
  const pythonAlias = originalAlias
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, ""); // remove leading underscore

  return `${pythonAlias}${conflictCount}`;
}

/**
 * Enhanced import builder that returns both import header and replacement mappings
 */
function buildIntelligentPythonImports(
  configs: Array<{
    path: string;
    items?: string[];
    alias?: string;
    as?: Record<string, string>;
  }>
): { importHeader: string; aliasReplacements: Map<string, string> } {
  if (!configs || configs.length === 0) {
    return { importHeader: "", aliasReplacements: new Map() };
  }

  // Track imports and detect conflicts
  const pathOrder: string[] = [];
  const basicImports = new Set<string>();
  const fromImports: Map<
    string,
    {
      items: Set<string>;
      aliases: Map<string, string>;
      order: number;
    }
  > = new Map();

  // Track all used aliases globally to detect conflicts
  const globalAliases = new Map<string, { path: string; item: string }>();
  const aliasConflicts = new Map<string, number>(); // alias -> conflict count
  const aliasReplacements = new Map<string, string>(); // originalAlias -> newAlias

  // First pass: collect all imports and detect conflicts
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i] || ({} as any);
    const { path, items, alias, as = {} } = config;
    if (!path) continue;

    // Handle basic imports (import path [as alias])
    if (!items || items.length === 0) {
      const importStatement = alias ? `${path} as ${alias}` : path;
      basicImports.add(importStatement);
      if (!pathOrder.includes("__basic__")) pathOrder.push("__basic__");
      continue;
    }

    // Handle from imports (from path import items [as aliases])
    if (!fromImports.has(path)) {
      fromImports.set(path, {
        items: new Set(),
        aliases: new Map(),
        order: i,
      });
      pathOrder.push(path);
    }

    const group = fromImports.get(path)!;

    // Add items and detect alias conflicts
    items.forEach((item) => {
      group.items.add(item);

      const itemAlias = as[item];
      if (itemAlias) {
        const aliasKey = itemAlias.toLowerCase();
        const existingAlias = globalAliases.get(aliasKey);

        if (existingAlias) {
          // Check if this is a real conflict (different path/item with same alias)
          if (existingAlias.path !== path || existingAlias.item !== item) {
            // This is a conflict - increment counter
            const currentCount = aliasConflicts.get(aliasKey) || 1;
            aliasConflicts.set(aliasKey, currentCount + 1);

            // Generate new alias for this conflicting import
            const newAlias = generateUniqueAlias(itemAlias, currentCount);
            group.aliases.set(item, newAlias);

            // Track replacement mapping (original -> new)
            aliasReplacements.set(itemAlias, newAlias);

            // Register the new alias to prevent future conflicts
            globalAliases.set(newAlias.toLowerCase(), { path, item });
          } else {
            // Same path/item with same alias - no conflict, reuse existing
            group.aliases.set(item, itemAlias);
          }
        } else {
          // No conflict, use the alias as-is
          group.aliases.set(item, itemAlias);
          globalAliases.set(aliasKey, { path, item });
        }
      }
    });
  }

  // Second pass: build the import statements with enhanced grouping
  const result: string[] = [];

  for (const pathKey of pathOrder) {
    if (pathKey === "__basic__") {
      if (basicImports.size > 0) {
        // Option 1: Grouped basic imports (as user requested)
        const sortedBasicImports = Array.from(basicImports).sort();
        if (sortedBasicImports.length > 3) {
          // For many imports, use separate lines for readability
          sortedBasicImports.forEach((imp) => {
            result.push(`import ${imp}`);
          });
        } else {
          // For few imports, group them
          result.push(`import ${sortedBasicImports.join(", ")}`);
        }
      }
    } else {
      const group = fromImports.get(pathKey)!;

      if (group.items.size > 0) {
        // Build import items with resolved aliases
        const importItems: string[] = [];
        const sortedItems = Array.from(group.items).sort();

        sortedItems.forEach((item) => {
          const alias = group.aliases.get(item);
          if (alias) {
            importItems.push(`${item} as ${alias}`);
          } else {
            importItems.push(item);
          }
        });

        // Remove duplicates and sort
        const uniqueImportItems = Array.from(new Set(importItems)).sort();

        // Group imports from same path
        result.push(`from ${pathKey} import ${uniqueImportItems.join(", ")}`);
      }
    }
  }

  return {
    importHeader: result.join("\n"),
    aliasReplacements,
  };
}

/**
 * Apply alias replacements to code, replacing old aliases with new ones
 */
function applyAliasReplacements(
  code: string,
  replacements: Map<string, string>
): string {
  let modifiedCode = code;

  // Apply each replacement with intelligent pattern matching
  for (const [originalAlias, newAlias] of replacements.entries()) {
    // Create regex patterns to match the alias in different contexts
    const patterns = [
      // Match standalone usage: alias(
      new RegExp(`\\b${escapeRegex(originalAlias)}\\(`, "g"),
      // Match attribute access: alias.something
      new RegExp(`\\b${escapeRegex(originalAlias)}\\.`, "g"),
      // Match in assignments: = alias
      new RegExp(`=\\s*${escapeRegex(originalAlias)}\\b`, "g"),
      // Match as standalone word: alias (but not in strings)
      new RegExp(`\\b${escapeRegex(originalAlias)}\\b(?=\\s*[^"']|$)`, "g"),
    ];

    patterns.forEach((pattern) => {
      modifiedCode = modifiedCode.replace(pattern, (match) => {
        return match.replace(originalAlias, newAlias);
      });
    });
  }

  return modifiedCode;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
