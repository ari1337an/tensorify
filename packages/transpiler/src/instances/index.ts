import InstalledNodes from "./installed-nodes";
import { BaseNode } from "@tensorify.io/sdk";

export default function createNodeInstance(type: string): BaseNode {
  const NodeClass = InstalledNodes[type];
  if (!NodeClass) {
    throw new Error(`Unknown type: ${type}`);
  }
  return new NodeClass();
}
