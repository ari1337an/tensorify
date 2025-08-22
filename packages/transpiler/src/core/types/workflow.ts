// Workflow node and edge types
export interface NodePosition {
  x: number;
  y: number;
}

export interface WorkflowNodeData {
  label: string;
  visualConfig?: any;
  [key: string]: unknown;
}

export interface WorkflowNode {
  id: string;
  type?: string;
  position: NodePosition;
  data: WorkflowNodeData;
  route: string;
  version: string;
  [key: string]: unknown;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  [key: string]: unknown;
}

// Special node types that don't produce code chunks
export enum SpecialNodeType {
  Start = "start",
  End = "end",
  Branch = "branch",
  Nested = "nested",
  Multiplexer = "multiplexer",
  Demultiplexer = "demultiplexer",
}

// Special node types that DO produce code chunks (handled differently from plugins)
export enum CodeGeneratingNodeType {
  CustomCode = "@tensorify/core/CustomCodeNode",
  ClassNode = "@tensorify/core/ClassNode",
}

// Helper to check if a node is a special type
export function isSpecialNode(nodeType?: string): boolean {
  if (!nodeType) return false;

  // Check exact matches first
  if (Object.values(SpecialNodeType).includes(nodeType as SpecialNodeType)) {
    return true;
  }

  // Check for @tensorify/core patterns
  if (nodeType.startsWith("@tensorify/core/")) {
    const coreType = nodeType.replace("@tensorify/core/", "").toLowerCase();
    return (
      coreType === "startnode" ||
      coreType === "endnode" ||
      coreType === "branchnode" ||
      coreType === "nestednode" ||
      coreType === "multiplexernode" ||
      coreType === "demultiplexernode" ||
      coreType === "classnode" ||
      coreType === "customcodenode"
    );
  }

  return false;
}

// Helper to check if a node is a code-generating type
export function isCodeGeneratingNode(nodeType?: string): boolean {
  if (!nodeType) return false;
  return Object.values(CodeGeneratingNodeType).includes(
    nodeType as CodeGeneratingNodeType
  );
}

// Helper to check if a node produces code
export function isPluginNode(nodeType?: string): boolean {
  return nodeType !== undefined && !isSpecialNode(nodeType);
}
