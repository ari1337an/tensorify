'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  LucideIcon,
  Database, 
  Brain, 
  Share2, 
  GitBranch, 
  Workflow,
  Zap,
  BarChart,
  Users as UsersIcon
} from 'lucide-react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  ConnectionLineType,
  MarkerType,
  Handle,
  ReactFlowProvider,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';

// Node colors for different personas
export const personaColors = {
  "researcher": {
    primary: "rgba(139, 92, 246, 0.9)",
    secondary: "rgba(124, 58, 237, 0.9)",
    gradient: "from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border-violet-400/30",
    bg: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)",
    border: "border-violet-500/30 hover:border-violet-500/50",
    icon: "text-violet-300"
  },
  "engineer": {
    primary: "rgba(251, 191, 36, 0.9)",
    secondary: "rgba(234, 88, 12, 0.9)",
    gradient: "from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-400/30",
    bg: "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)",
    border: "border-amber-500/30 hover:border-amber-500/50",
    icon: "text-amber-300"
  },
  "lead": {
    primary: "rgba(16, 185, 129, 0.9)",
    secondary: "rgba(5, 150, 105, 0.9)",
    gradient: "from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-emerald-400/30",
    bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    icon: "text-emerald-300"
  },
  "default": {
    primary: "rgba(99, 102, 241, 0.9)",
    secondary: "rgba(67, 56, 202, 0.9)",
    gradient: "from-primary/20 to-violet-500/20 hover:from-primary/30 hover:to-violet-500/30 border-primary/30",
    bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(67, 56, 202, 0.15) 100%)",
    border: "border-primary/30 hover:border-primary/50",
    icon: "text-primary-foreground"
  }
};

// FlowNode component for use in ReactFlow
export const FlowNode = ({ 
  data, 
  isConnectable,
  selected
}: { 
  data: { 
    icon: LucideIcon;
    label: string;
    persona: string;
    description?: string;
    params?: Record<string, string>;
    conditional?: boolean;
  };
  isConnectable: boolean;
  selected: boolean;
}) => {
  const Icon = data.icon;
  const colors = personaColors[data.persona as keyof typeof personaColors] || personaColors.default;
  
  // Node base styles - reduced size
  const nodeBaseStyle = {
    padding: '10px',
    borderRadius: '10px',
    minWidth: '140px', // Reduced from 180px
    maxWidth: '160px', // Added max width
    fontSize: '11px', // Reduced from 12px
    backgroundColor: 'rgba(20, 20, 28, 0.8)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${colors.primary.replace('0.9', '0.2')}`,
    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`, // Reduced shadow
    transition: 'all 0.3s ease',
    color: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1, // Lower z-index to ensure edges appear above
  };
  
  // Apply selection styles
  const selectedStyle = selected ? {
    boxShadow: `0 8px 16px ${colors.primary.replace('0.9', '0.3')}, 0 0 0 2px ${colors.primary.replace('0.9', '0.5')}`,
    transform: 'translateY(-3px) scale(1.02)', // Reduced transform
  } : {};
  
  return (
    <div
      style={{ ...nodeBaseStyle, ...selectedStyle }}
      className="group"
    >
      {/* Improved handle positioning to extend beyond node */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 rounded-full border-2 -ml-2" // Extended more to the left
        style={{ 
          backgroundColor: colors.primary, 
          borderColor: colors.secondary,
          zIndex: 10 // Ensure handles are above edges
        }}
        isConnectable={isConnectable}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 rounded-full border-2 -mr-2" // Extended more to the right
        style={{ 
          backgroundColor: colors.primary, 
          borderColor: colors.secondary,
          zIndex: 10 // Ensure handles are above edges
        }}
        isConnectable={isConnectable}
      />
      
      {data.conditional && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700 -mb-2 left-1/3" // Extended more
            style={{ zIndex: 10 }}
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700 -mb-2 left-2/3" // Extended more
            style={{ zIndex: 10 }}
            isConnectable={isConnectable}
          />
        </>
      )}

      <div className="flex items-center gap-2 mb-1.5"> {/* Reduced gap and margin */}
        <div className="p-1.5 rounded-lg flex items-center justify-center" // Reduced padding
          style={{ backgroundColor: colors.primary.replace('0.9', '0.2') }}>
          <Icon className={`h-4 w-4 ${selected ? 'text-white' : colors.icon}`} /> {/* Reduced icon size */}
        </div>
        <div className="font-bold text-xs text-white">{data.label}</div> {/* Reduced font size */}
      </div>
      
      {data.description && (
        <div className="text-[10px] opacity-70 mb-2">{data.description}</div> // Further reduced description text size
      )}
      
      {data.params && (
        <div className="mt-1.5 pt-1.5 border-t w-full" // Reduced margins
          style={{ borderColor: colors.primary.replace('0.9', '0.2') }}>
          {Object.entries(data.params).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center mb-1 text-[10px]"> {/* Reduced text size */}
              <span className="opacity-70">{key}:</span>
              <code className="px-1.5 py-0.5 rounded-md text-[10px]" // Reduced padding
                style={{ 
                  backgroundColor: colors.primary.replace('0.9', '0.1'),
                  color: colors.primary.replace('0.9', '1.0')
                }}
              >
                {String(value)}
              </code>
            </div>
          ))}
        </div>
      )}

      {/* Glow effect on hover */}
      <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        style={{ 
          background: `radial-gradient(circle at center, ${colors.primary}, transparent 70%)`,
          filter: 'blur(8px)',
          zIndex: 0 // Ensure glow is below content
        }} 
      ></div>
    </div>
  );
};

// Interface for flow items
export interface FlowItem {
  id: number;
  icon: LucideIcon;
  label: string;
  position: { x: number; y: number };
  description?: string;
  params?: Record<string, string | undefined>;
  conditional?: boolean;
}

export interface Connection {
  from: { x: number; y: number } | number;
  to: { x: number; y: number } | number;
  animated?: boolean;
  dashed?: boolean;
  color?: string;
}

// Map icons to their components
export const iconMap: Record<string, LucideIcon> = {
  Database,
  Brain,
  Share2,
  GitBranch,
  Workflow,
  Zap,
  BarChart,
  UsersIcon
};

// Convert our flow data to ReactFlow nodes and edges
const createNodesAndEdges = (
  flowItems: FlowItem[], 
  connections: Connection[],
  persona: string,
  containerWidth: number,
  containerHeight: number
) => {
  // Create nodes from flow items
  const nodes: Node[] = flowItems.map((item) => ({
    id: `${item.id}`,
    type: 'flowNode',
    position: { 
      x: (item.position.x / 100) * containerWidth, 
      y: (item.position.y / 100) * containerHeight 
    },
    data: {
      icon: item.icon,
      label: item.label,
      description: item.description,
      params: item.params,
      conditional: item.conditional,
      persona: persona
    },
    // Ensure nodes are positioned on lower z-index layer
    style: { zIndex: 1 }
  }));

  // Create edges from connections
  const edges: Edge[] = connections.map((connection, index) => {
    // Handle connections with position objects
    let source, target;
    
    if (typeof connection.from === 'number') {
      source = `${connection.from}`;
      // Find the actual node to ensure it exists before creating the edge
      const sourceNode = flowItems.find(item => item.id === connection.from);
      if (!sourceNode) return null;
    } else {
      // For direct position objects, we'd need a different approach
      // This case handles legacy connections
      return null;
    }
    
    if (typeof connection.to === 'number') {
      target = `${connection.to}`;
      // Find the actual node to ensure it exists before creating the edge
      const targetNode = flowItems.find(item => item.id === connection.to);
      if (!targetNode) return null;
    } else {
      // For direct position objects
      return null;
    }
    
    const colorMap = personaColors[persona as keyof typeof personaColors] || personaColors.default;
    const edgeColor = connection.color || colorMap.primary;
    
    return {
      id: `e${index}`,
      source,
      target,
      sourceHandle: null, // Let React Flow automatically connect to the closest handle
      targetHandle: null, // Let React Flow automatically connect to the closest handle
      animated: connection.animated,
      // Enhanced edge styling for better visibility
      style: { 
        stroke: edgeColor, 
        strokeWidth: connection.animated ? 3 : 2, // Increased stroke width
        strokeDasharray: connection.dashed ? '5,5' : undefined,
        strokeOpacity: 0.9, // Increased opacity
        zIndex: 5, // Ensure edges appear above nodes
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeColor,
        width: 15, // Larger arrow
        height: 15, // Larger arrow
      },
      // Add a slight curve to edges to avoid direct overlapping
      type: 'smoothstep',
    };
  }).filter(Boolean) as Edge[];

  return { nodes, edges };
};

// Convert node indices to actual nodes
export const prepareConnections = (
  connections: Array<{
    from: number;
    to: number;
    animated?: boolean;
    dashed?: boolean;
    color?: string;
  }>
): Connection[] => {
  return connections.map(conn => ({
    from: conn.from,
    to: conn.to,
    animated: conn.animated,
    dashed: conn.dashed,
    color: conn.color
  }));
};

// Interactive flow component
interface InteractiveFlowProps {
  flowItems: FlowItem[];
  connections: Array<{
    from: number;
    to: number;
    animated?: boolean;
    dashed?: boolean;
    color?: string;
  }>;
  persona?: string;
  className?: string;
}

const nodeTypes = {
  flowNode: FlowNode,
};

// Inner component to handle ReactFlow logic
const InteractiveFlowInner = ({ 
  flowItems,
  connections,
  persona = "default",
}: InteractiveFlowProps) => {
  const [containerDimensions, setContainerDimensions] = useState({ width: 600, height: 400 });
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  
  // Set up container ref to measure dimensions
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const { width, height } = node.getBoundingClientRect();
      setContainerDimensions({ width, height });
    }
  }, []);
  
  // Generate nodes and edges when dimensions are available
  useEffect(() => {
    if (containerDimensions.width > 0 && containerDimensions.height > 0) {
      const preparedConnections = prepareConnections(connections);
      const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(
        flowItems,
        preparedConnections,
        persona,
        containerDimensions.width,
        containerDimensions.height
      );
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [containerDimensions, flowItems, connections, persona, setNodes, setEdges]);
  
  return (
    <div ref={containerRef} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        panOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        connectionLineType={ConnectionLineType.SmoothStep}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={1}
        maxZoom={1}
        className="react-flow-edges-on-top" // Add custom class to ensure edges are on top
      >
        {/* Add subtle background dots that won't interfere with edges */}
        <Background 
          color="rgba(255, 255, 255, 0.025)" 
          gap={15} 
          size={1}
          variant={"dots" as BackgroundVariant}
        />
      </ReactFlow>
    </div>
  );
};

// Export wrapped component with provider
export function InteractiveFlow(props: InteractiveFlowProps) {
  return (
    <div className={`w-full h-full bg-transparent rounded-xl overflow-hidden ${props.className || ''}`}>
      {/* Add custom style to ensure edges render on top of nodes */}
      <style jsx global>{`
        .react-flow-edges-on-top .react-flow__edges {
          z-index: 5;
        }
        .react-flow-edges-on-top .react-flow__edge-path {
          stroke-width: 2px;
        }
        .react-flow-edges-on-top .react-flow__edge.animated path {
          stroke-width: 3px;
        }
        .react-flow-edges-on-top .react-flow__nodes {
          z-index: 1;
        }
      `}</style>
      <ReactFlowProvider>
        <InteractiveFlowInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}

// Reusable persona card component
interface PersonaCardProps {
  title: string;
  icon: LucideIcon;
  challenge: string;
  quote: string;
  benefits: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
  }>;
  persona: string;
  flowItems: FlowItem[];
  connections: Array<{
    from: number;
    to: number;
    animated?: boolean;
    dashed?: boolean;
    color?: string;
  }>;
  className?: string;
}

export function PersonaCard({
  title,
  icon: Icon,
  challenge,
  quote,
  benefits,
  persona,
  flowItems,
  connections,
  className
}: PersonaCardProps) {
  const colors = personaColors[persona as keyof typeof personaColors] || personaColors.default;
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center rounded-xl overflow-hidden border-primary/10 bg-gray-950/20 backdrop-blur-xl p-8 sm:p-10 ${className || ''}`}>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg bg-gray-900/60 flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">{title}</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-foreground">Your Current Challenge:</h4>
            <p className="text-muted-foreground leading-relaxed">
              {challenge}
            </p>
          </div>
          
          <blockquote className="border-l-4 border-primary/60 pl-6 py-3 italic text-muted-foreground bg-primary/5 rounded-r-md">
            &ldquo;{quote}&rdquo;
          </blockquote>
          
          <div>
            <h4 className="font-semibold text-lg text-foreground">
              How Tensorify Helps:
            </h4>
            <ul className="space-y-3 mt-4">
              {benefits.map((benefit, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <benefit.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-primary block">{benefit.title}</span>
                    <span className="text-sm text-muted-foreground">{benefit.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="relative h-[500px]">
        {/* Flow visualization */}
        <InteractiveFlow 
          flowItems={flowItems}
          connections={connections}
          persona={persona}
        />
      </div>
    </div>
  );
} 