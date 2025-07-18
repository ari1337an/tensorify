import {
  useNodes,
  ViewportPortal,
  useReactFlow,
  type XYPosition,
} from "@xyflow/react";
import { AppNode } from "../types/types";

export default function NodeInspector() {
  const { getInternalNode } = useReactFlow();
  const nodes = useNodes<AppNode>();

  return (
    <ViewportPortal>
      <div className="react-flow__devtools-nodeinspector">
        {nodes.map((node) => {
          if (node.hidden) return null;
          const internalNode = getInternalNode(node.id);
          if (!internalNode) {
            return null;
          }

          const absPosition = internalNode?.internals.positionAbsolute;

          return (
            <NodeInfo
              key={node.id}
              id={node.id}
              selected={!!node.selected}
              type={node.type || "default"}
              position={node.position}
              absPosition={absPosition}
              width={node.measured?.width ?? 0}
              height={node.measured?.height ?? 0}
              data={node.data}
              route={node.route}
              version={node.version}
              label={node.label}
            />
          );
        })}
      </div>
    </ViewportPortal>
  );
}

type NodeInfoProps = {
  id: string;
  type: string;
  selected: boolean;
  position: XYPosition;
  absPosition: XYPosition;
  width?: number;
  height?: number;
  data: any;
  route: string;
  version: string;
  label: string;
};

function NodeInfo({
  id,
  type,
  selected,
  position,
  absPosition,
  width,
  height,
  data,
  route,
  version,
  label
}: NodeInfoProps) {
  if (!width || !height) {
    return null;
  }
  return (
    <div
      className="react-flow__devtools-nodeinfo text-slate-600 bg-white rounded-sm mt-2 px-2 py-1"
      style={{
        position: "absolute",
        transform: `translate(${absPosition.x}px, ${absPosition.y + height}px)`,
      }}
    >
      <div>
        <strong>id:</strong> {id}
      </div>
      <div>
        <strong>type:</strong> {type}
      </div>
      <div>
        <strong>version:</strong> {version}
      </div>
      <div>
        <strong>route:</strong> {route}
      </div>
      <div>
        <strong>label:</strong> {label}
      </div>
      <div>
        <strong>selected:</strong> {selected ? "true" : "false"}
      </div>
      <div>
        <strong>position:</strong> {position.x.toFixed(1)},{" "}
        {position.y.toFixed(1)}
      </div>
      <div>
        <strong>dimensions:</strong> {width} × {height}
      </div>
      <pre>
        <strong>data:</strong> {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
