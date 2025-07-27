import InstalledNodes from "./installed-nodes";
import { TensorifyPlugin } from "@tensorify.io/sdk";

export default function createNodeInstance(type: string): TensorifyPlugin {
  const NodeClass = InstalledNodes[type];
  if (!NodeClass) {
    throw new Error(`Unknown type: ${type}`);
  }
  return new NodeClass();
}
