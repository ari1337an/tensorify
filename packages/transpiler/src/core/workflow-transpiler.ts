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
    console.log("Found paths:", paths);

    // Get plugin results for all plugin nodes in the paths
    const pluginResults = await getPluginResults(nodes, paths, engine);
    console.log("Plugin results:", pluginResults);

    // Generate artifacts for each path
    const artifacts = generateArtifacts(paths, pluginResults);
    console.log("Generated artifacts:", Object.keys(artifacts));

    // Convert paths to simple format for response
    const pathsSimple: Record<string, string[]> = {};
    paths.forEach((path) => {
      pathsSimple[path.endNodeId] = path.nodes;
    });

    return {
      artifacts,
      paths: pathsSimple,
    };
  } finally {
    // Clean up engine resources
    await engine.dispose();
  }
}

/**
 * Find all paths from start nodes to end nodes in the root route
 * Uses BFS to traverse the graph
 */
function findAllPaths(nodes: WorkflowNode[], edges: WorkflowEdge[]): Path[] {
  const paths: Path[] = [];

  console.log(
    "Finding paths with nodes:",
    nodes.map((n) => ({ id: n.id, type: n.type, route: n.route }))
  );

  // Build adjacency list
  const adjacency: Record<string, string[]> = {};
  edges.forEach((edge) => {
    if (!adjacency[edge.source]) {
      adjacency[edge.source] = [];
    }
    adjacency[edge.source].push(edge.target);
  });

  console.log("Adjacency list:", adjacency);

  // Create node lookup
  const nodeMap: Record<string, WorkflowNode> = {};
  nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });

  // Find all start nodes in root route
  const startNodes = nodes.filter(
    (node) =>
      isStartNode(node.type) && (node.route === "/" || node.route === "root")
  );

  console.log(
    "Found start nodes:",
    startNodes.map((n) => ({ id: n.id, type: n.type }))
  );

  // BFS from each start node
  startNodes.forEach((startNode) => {
    const queue: { nodeId: string; path: string[] }[] = [
      { nodeId: startNode.id, path: [startNode.id] },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (visited.has(nodeId)) {
        continue;
      }
      visited.add(nodeId);

      const node = nodeMap[nodeId];
      if (!node) {
        continue;
      }

      // If this is an end node in root route, we found a complete path
      if (
        isEndNode(node.type) &&
        (node.route === "/" || node.route === "root")
      ) {
        paths.push({
          endNodeId: nodeId,
          nodes: path,
        });
        continue;
      }

      // Handle nested nodes specially
      if (node.type === SpecialNodeType.Nested) {
        // For simplicity, we'll traverse through nested nodes
        // In a real implementation, you'd need to handle the internal structure
        const neighbors = adjacency[nodeId] || [];
        neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            queue.push({
              nodeId: neighborId,
              path: [...path, neighborId],
            });
          }
        });
      } else {
        // Add all neighbors to the queue
        const neighbors = adjacency[nodeId] || [];
        neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            queue.push({
              nodeId: neighborId,
              path: [...path, neighborId],
            });
          }
        });
      }
    }
  });

  return paths;
}

/**
 * Get plugin results for all plugin nodes in the paths
 */
async function getPluginResults(
  nodes: WorkflowNode[],
  paths: Path[],
  engine: any
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

      // Include the label in the plugin settings
      const payload = {
        ...baseSettings,
        labelName: (node.data as any)?.label, // Some plugins might expect labelName
      };

      console.log(`Executing plugin for node ${nodeId}:`, { slug, payload });

      // Execute the plugin
      const result = await engine.getExecutionResult(
        slug,
        payload,
        "TensorifyPlugin"
      );

      results[nodeId] = {
        nodeId,
        code: result.code || "",
      };
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

  paths.forEach((path) => {
    const codeChunks: string[] = [];

    // Collect code chunks from plugin nodes in the path
    path.nodes.forEach((nodeId) => {
      const result = pluginResults[nodeId];
      if (result && result.code) {
        codeChunks.push(result.code);
      }
    });

    // Combine all code chunks
    const combinedCode = codeChunks.join("\n");

    // Format the code (you could use a formatter here)
    const formattedCode = formatCode(combinedCode);

    artifacts[path.endNodeId] = formattedCode;
  });

  return artifacts;
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
