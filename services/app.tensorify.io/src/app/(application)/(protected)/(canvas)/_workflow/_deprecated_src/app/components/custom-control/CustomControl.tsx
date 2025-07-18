import React, { useCallback, useState, useRef } from "react";
import { Panel, useReactFlow, useStore, useStoreApi } from "@xyflow/react";
import { Plus, Minus, Maximize, Lock, Unlock } from "lucide-react";

const CustomControl: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const storeApi = useStoreApi();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { nodesDraggable, nodesConnectable, elementsSelectable } =
    storeApi.getState();
  const isInteractive = nodesDraggable || nodesConnectable || elementsSelectable;

  const zoomPercent = useStore((s) =>
    ((s.transform[2] * 100) / 2.0).toFixed(0)
  );

  const [showZoom, setShowZoom] = useState(false);

  const onToggleInteractivity = useCallback(() => {
    const currentState = storeApi.getState();
    const currentIsInteractive =
      currentState.nodesDraggable ||
      currentState.nodesConnectable ||
      currentState.elementsSelectable;

    storeApi.setState({
      nodesDraggable: !currentIsInteractive,
      nodesConnectable: !currentIsInteractive,
      elementsSelectable: !currentIsInteractive,
    });
  }, [storeApi]);

  const handleShowZoom = useCallback(() => {
    setShowZoom(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowZoom(false);
    }, 500);
  }, []);

  const handleZoomIn = () => {
    zoomIn();
    handleShowZoom();
  };

  const handleZoomOut = () => {
    zoomOut();
    handleShowZoom();
  };

  return (
    <Panel position="bottom-left">
      <div className="custom-control flex gap-2 items-center p-2">
        <button
          onClick={handleZoomIn}
          className="border border-white rounded-sm p-1"
        >
          <Plus size={16} />
        </button>

        <button
          onClick={handleZoomOut}
          className="border border-white rounded-sm p-1"
        >
          <Minus size={16} />
        </button>

        <button
          onClick={() => fitView({ padding: 0.1 })}
          className="border border-white rounded-sm p-1"
        >
          <Maximize size={16} />
        </button>
        <button
          onClick={onToggleInteractivity}
          className="border border-white rounded-sm p-1"
        >
          {isInteractive ? <Lock size={16} /> : <Unlock size={16} />}
        </button>

        {/* Zoom label always rendered, fade controlled by class */}
        <span
          className={`zoom-label ${showZoom ? 'visible' : ''}`}
          style={{ userSelect: "none" }}
        >
          {zoomPercent}%
        </span>
      </div>
      <style jsx>{`
        .zoom-label {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .zoom-label.visible {
          opacity: 1;
        }
      `}</style>
    </Panel>
  );
};

export default CustomControl;
