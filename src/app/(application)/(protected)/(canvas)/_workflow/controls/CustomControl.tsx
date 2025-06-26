import React, { useCallback, useState, useRef } from "react";
import { Panel, useReactFlow, useStore, useStoreApi } from "@xyflow/react";
import { Plus, Minus, Maximize, Lock, Unlock } from "lucide-react";

const ControlButton = ({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="ring-1 ring-card-foreground hover:ring-2 hover:ring-primary rounded-sm p-1"
    >
      {icon}
    </button>
  );
};

const CustomControl: React.FC = () => {
  const { zoomIn, zoomOut, zoomTo } = useReactFlow();
  const storeApi = useStoreApi();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInteractive = useStore(
    (s) => s.nodesDraggable || s.nodesConnectable || s.elementsSelectable
  );

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
        <ControlButton onClick={handleZoomIn} icon={<Plus size={16} />} />

        <ControlButton onClick={handleZoomOut} icon={<Minus size={16} />} />

        <ControlButton
          onClick={() => zoomTo(0)}
          icon={<Maximize size={16} />}
        />

        <ControlButton
          onClick={onToggleInteractivity}
          icon={isInteractive ? <Lock size={16} /> : <Unlock size={16} />}
        />

        {/* Zoom label always rendered, fade controlled by class */}
        <span
          className={`zoom-label ${showZoom ? "visible" : ""}`}
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
