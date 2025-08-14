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
}

// Path finding result
export interface Path {
  endNodeId: string;
  nodes: string[]; // Array of node IDs in order from start to end
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
