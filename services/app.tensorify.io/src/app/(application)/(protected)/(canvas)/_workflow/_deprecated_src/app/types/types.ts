import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnNodesDelete
} from "@xyflow/react";
import { CSSProperties } from "react";

export interface TNodeType<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string = string
> {
  id: string; // Unique identifier for the node
  type: NodeType; // Type of the node, constrained to a string
  data: NodeData; // Generic data type for the node's custom data
  route: string;
  version: string;
  label: string;
  position: {
    x: number;
    y: number;
  };
  style?: CSSProperties; // Optional CSS styles for the node
}

export type CustomStandaloneNodeType = Node<
  {
    translatedCode: string;
  },
  "customStandaloneNode"
>;

export type CustomNestedNodeType = Node<
  {
    info: string;
  },
  "customNestedNode"
>;

// Define the base node structure
export type BaseAppNode = Node<{
  position: { x: number; y: number };
  route: string;
  version: string;
  [key: string]: any; // Allow additional data fields
}>;


// TODO: when deleting the parent the child should also be deleted using the parentId, so incorporate parentId here also for childs along with route
// Define the node variations
export type AppNode = BaseAppNode &
  TNodeType &
  (TNodeType | CustomStandaloneNodeType | CustomNestedNodeType);

export type AppState = {
  route: string;
  nodes: AppNode[];
  edges: Edge[];
  setRoute: (newRoute: string) => void;
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodesDelete: OnNodesDelete;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: Node["data"]) => void;
  addNewNode: (node: AppNode) => void;
};
