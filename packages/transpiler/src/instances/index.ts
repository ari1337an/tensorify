import InstalledNodes from "./installed-nodes";
import { IUniversalNode } from "@tensorify.io/sdk";

export default function createNodeInstance(type: string): IUniversalNode<any> {
  const NodeClass = InstalledNodes[type];
  if (!NodeClass) {
    throw new Error(`Unknown type: ${type}`);
  }
  return new NodeClass();
}
