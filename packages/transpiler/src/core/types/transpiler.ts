// Transpiler configuration and result types
export interface TranspilerConfig {
  nodes: any[];
  edges: any[];
  s3Config: any;
  bucketName: string;
  debug?: boolean;
}

export interface TranspilerResult {
  artifacts: Record<string, string>; // endNodeId -> generated code
  paths: Record<string, string[]>; // endNodeId -> array of nodeIds in path
  errorsByNodeId?: Record<string, string>; // nodeId -> error message
  errorsByArtifactId?: Record<string, Record<string, string>>; // artifactId -> { nodeId -> error message }
}

// Path finding result
export interface Path {
  endNodeId: string;
  nodes: string[]; // Array of node IDs in order from start to end
  route: string; // The route this path belongs to
  isExpanded?: boolean; // Whether this path has been expanded from nested nodes
}

// Route information for nested workflow handling
export interface RouteInfo {
  route: string;
  parentRoute?: string;
  nestedNodeId?: string; // The nested node that contains this route
  startNodes: string[];
  endNodes: string[];
  nodes: string[];
}

// Plugin execution result
export interface PluginResult {
  nodeId: string;
  code: string;
  error?: string;
  imports?: Array<{
    path: string;
    items?: string[];
    alias?: string;
    as?: Record<string, string>;
  }>;
}
