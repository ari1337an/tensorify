import React from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { AppNode, CustomStandaloneNodeType } from "@/app/types/types";
import { Package } from "lucide-react";
import TNode from "../TNode/TNode";

export default function CustomNestedNode(
  props: NodeProps<CustomStandaloneNodeType> & AppNode
) {
  const { id, data, selected } = props;
  return (
    <TNode {...props}>
      {/* Must give full props */}
      <div
        className={`bg-secondary border-2 ${
          selected ? "border-orange-500" : "border-primary"
        } px-2 py-1 rounded-sm w-full min-w-12 min-h-6 h-full`}
      >
        <Handle type="target" position={Position.Left} />
        <div className="text-white px-5 py-4">
          <Package />
        </div>
        <Handle type="source" position={Position.Right} />
      </div>
    </TNode>
  );
}
