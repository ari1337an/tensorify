"use client";

import React, { useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Background,
  BackgroundVariant,
  SelectionMode,
  useReactFlow,
  NodeProps,
} from "@xyflow/react";
import { DnDProvider, useDnD } from "@/context/DnDContext";
import { useShallow } from "zustand/react/shallow";
import "@xyflow/react/dist/style.css";
import useMiniMapFade from "@/app/hooks/useMiniMapFade";
import LeftPanel from "./components/left-panel/LeftPanel";
import useStore from "@/app/store/store";
import ExportPanel from "./components/export-panel/ExportPanel";
import DevTools from "./devtools/Devtools";
import CustomControl from "./components/custom-control/CustomControl";
import CanvasBreadcrump from "./components/canvas-breadcrump/CanvasBreadcrump";
import CustomStandaloneNode from "@/app/nodes/core/CustomStandaloneNode";
import CustomNestedNode from "@/app/nodes/core/CustomNestedNode";
import { AppNode } from "./types/types";

const selector = (state: {
  nodes: any;
  edges: any;
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  addNewNode: any;
  onNodesDelete: any;
  route: any;
}) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  onNodesDelete: state.onNodesDelete,
  addNewNode: state.addNewNode,
  route: state.route,
});

let id = 0;
const getId = () => `dndnode_${id++}`; // TODO: later figure out how to handle this using useNodeId from xyflow

// TODO: any canvas should be shareable with a unique link
const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    addNewNode,
    route,
  } = useStore(useShallow(selector));
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const { showMiniMap, onMoveStart, onMoveEnd } = useMiniMapFade();
  const defaultEdgeOptions = { type: "smoothstep" };

  const onDragOver = useCallback(
    (event: {
      preventDefault: () => void;
      stopPropagation: () => void;
      dataTransfer: { dropEffect: string };
    }) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    []
  );

  const onDrop = useCallback(
    (event: { preventDefault: () => void; clientX: any; clientY: any }) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }
      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        route: route,
        version: "1.0.0",
        label: `${type} node`,
        data: { label: `${type} node` }, // TODO: later I have to visit this to make sure this is the correct node data
        // TODO: NOT FOR NOW
      };

      addNewNode(newNode);
    },
    [screenToFlowPosition, type, addNewNode, route]
  );

  const nodeTypes = useMemo(
    () => ({
      "@tensorify/core/CustomStandaloneNode": CustomStandaloneNode,
      "@tensorify/core/CustomNestedNode": CustomNestedNode,
    }),
    []
  );

  return (
    <div className="dndflow">
      <div
        style={{ width: "100vw", height: "100vh" }}
        className="reactflow-wrapper" // important, do not remove (it enables you to drop from shadcn sidebar into the reactflow canvas)
        ref={reactFlowWrapper}
      >
        <ReactFlow
          colorMode="dark"
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          defaultEdgeOptions={defaultEdgeOptions}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          fitView={true}
          panOnScroll={true}
          selectionOnDrag={true}
          selectionMode={SelectionMode.Partial}
          proOptions={{ hideAttribution: true }}
          nodeTypes={
            // TODO: remove unknown
            nodeTypes as unknown as Record<any, React.ComponentType<NodeProps<AppNode>>>
          }
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <CustomControl />
          <CanvasBreadcrump />

          <div
            style={{
              position: "absolute",
              bottom: "50px",
              opacity: showMiniMap ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            <MiniMap position="bottom-left" zoomable pannable />
          </div>

          <LeftPanel />
          <ExportPanel />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

          {process.env.NEXT_PUBLIC_ENV == "development" && <DevTools />}
        </ReactFlow>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <DnDFlow />
      </DnDProvider>
    </ReactFlowProvider>
  );
}
