import InstalledNodes from "@/instances/installed-nodes";
import INode from "@/interfaces/INode";

export default function createNodeInstance(type: string): INode<any> {
  const NodeClass = InstalledNodes[type];
  if (!NodeClass) {
    throw new Error(`Unknown type: ${type}`);
  }
  return new NodeClass();
}
