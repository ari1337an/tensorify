"use client";

import React, { useEffect, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { WorkflowNode } from "@workflow/store/workflowStore";
import { cn } from "@/app/_lib/utils";

interface ProximityConnectIndicatorProps {
  draggedNode: WorkflowNode | null;
  targetNode: WorkflowNode | null;
  isActive: boolean;
  minDistance: number;
}

export function ProximityConnectIndicator({
  draggedNode,
  targetNode,
  isActive,
  minDistance,
}: ProximityConnectIndicatorProps) {
  const { getInternalNode } = useReactFlow();
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const [showRipple, setShowRipple] = useState(false);

  useEffect(() => {
    if (!isActive || !draggedNode || !targetNode) {
      setShowRipple(false);
      return;
    }

    const draggedInternalNode = getInternalNode(draggedNode.id);
    const targetInternalNode = getInternalNode(targetNode.id);

    if (!draggedInternalNode?.internals?.positionAbsolute || !targetInternalNode?.internals?.positionAbsolute) {
      return;
    }

    // Calculate the midpoint between the two nodes
    const draggedPos = draggedInternalNode.internals.positionAbsolute;
    const targetPos = targetInternalNode.internals.positionAbsolute;
    
    const midpointX = (draggedPos.x + targetPos.x) / 2;
    const midpointY = (draggedPos.y + targetPos.y) / 2;

    // Calculate actual distance
    const dx = draggedPos.x - targetPos.x;
    const dy = draggedPos.y - targetPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Create a visual indicator at the midpoint
    setIndicatorStyle({
      position: 'absolute',
      left: `${midpointX}px`,
      top: `${midpointY}px`,
      width: '20px',
      height: '20px',
      marginLeft: '-10px',
      marginTop: '-10px',
      borderRadius: '50%',
      border: '2px solid hsl(var(--primary))',
      backgroundColor: 'hsla(var(--primary), 0.2)',
      pointerEvents: 'none',
      zIndex: 1000,
      transition: 'all 0.2s ease-in-out',
    });

    setShowRipple(true);

    // Add a slight delay for visual effect
    const timer = setTimeout(() => {
      setShowRipple(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, draggedNode, targetNode, getInternalNode]);

  if (!isActive || !showRipple) {
    return null;
  }

  return (
    <div
      className="proximity-indicator"
      style={indicatorStyle}
    >
      {/* Connection success icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M8 12h8" />
          <path d="m12 16 4-4-4-4" />
        </svg>
      </div>
    </div>
  );
}

interface ProximityThresholdIndicatorProps {
  draggedNode: WorkflowNode | null;
  isActive: boolean;
  minDistance: number;
}

export function ProximityThresholdIndicator({
  draggedNode,
  isActive,
  minDistance,
}: ProximityThresholdIndicatorProps) {
  const { getInternalNode } = useReactFlow();
  const [thresholdStyle, setThresholdStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isActive || !draggedNode) {
      return;
    }

    const draggedInternalNode = getInternalNode(draggedNode.id);

    if (!draggedInternalNode?.internals?.positionAbsolute) {
      return;
    }

    const draggedPos = draggedInternalNode.internals.positionAbsolute;
    const nodeWidth = draggedInternalNode.measured?.width || 200;
    const nodeHeight = draggedInternalNode.measured?.height || 120;

    // Center the threshold indicator on the dragged node
    const centerX = draggedPos.x + nodeWidth / 2;
    const centerY = draggedPos.y + nodeHeight / 2;

    setThresholdStyle({
      position: 'absolute',
      left: `${centerX - minDistance}px`,
      top: `${centerY - minDistance}px`,
      width: `${minDistance * 2}px`,
      height: `${minDistance * 2}px`,
      border: '1px dashed hsla(var(--muted-foreground), 0.3)',
      borderRadius: '50%',
      pointerEvents: 'none',
      backgroundColor: 'hsla(var(--muted), 0.05)',
      zIndex: 999,
    });
  }, [isActive, draggedNode, minDistance, getInternalNode]);

  if (!isActive) {
    return null;
  }

  return (
    <div
      className={cn(
        "proximity-threshold-indicator",
        isActive && "active"
      )}
      style={thresholdStyle}
    />
  );
}

interface ProximityFeedbackProps {
  draggedNode: WorkflowNode | null;
  targetNode: WorkflowNode | null;
  isActive: boolean;
  minDistance: number;
  showThreshold?: boolean;
}

export function ProximityFeedback({
  draggedNode,
  targetNode,
  isActive,
  minDistance,
  showThreshold = false,
}: ProximityFeedbackProps) {
  return (
    <>
      {/* Connection indicator between nodes */}
      <ProximityConnectIndicator
        draggedNode={draggedNode}
        targetNode={targetNode}
        isActive={isActive && !!targetNode}
        minDistance={minDistance}
      />
      
      {/* Threshold visualization (optional, can be enabled for better UX) */}
      {showThreshold && (
        <ProximityThresholdIndicator
          draggedNode={draggedNode}
          isActive={isActive}
          minDistance={minDistance}
        />
      )}
    </>
  );
}

