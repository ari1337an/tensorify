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
  
  // Node base styles
  const nodeBaseStyle = {
    padding: '14px',
    borderRadius: '12px',
    minWidth: '180px',
    fontSize: '12px',
    backgroundColor: 'rgba(32, 32, 40, 0.8)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${colors.primary.replace('0.9', '0.2')}`,
    boxShadow: `0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px ${colors.primary.replace('0.9', '0.1')}`,
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    color: 'rgba(255, 255, 255, 0.8)',
  };
  
  // Apply selection styles
  const selectedStyle = selected ? {
    boxShadow: `0 12px 32px ${colors.primary.replace('0.9', '0.3')}, 0 0 0 2px ${colors.primary.replace('0.9', '0.5')}`,
    transform: 'translateY(-5px) scale(1.03)',
  } : {};
  
  return (
    <div
      style={{ ...nodeBaseStyle, ...selectedStyle }}
      className="group"
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 rounded-full border-2 -ml-1.5`}
        style={{ 
          backgroundColor: colors.primary, 
          borderColor: colors.secondary 
        }}
        isConnectable={isConnectable}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 rounded-full border-2 -mr-1.5`}
        style={{ 
          backgroundColor: colors.primary, 
          borderColor: colors.secondary 
        }}
        isConnectable={isConnectable}
      />
      
      {data.conditional && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700 -mb-1.5 left-1/3"
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700 -mb-1.5 left-2/3"
            isConnectable={isConnectable}
          />
        </>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg flex items-center justify-center" 
          style={{ backgroundColor: colors.primary.replace('0.9', '0.2') }}>
          <Icon className={`h-5 w-5 ${selected ? 'text-white' : colors.icon}`} />
        </div>
        <div className="font-bold text-sm text-white">{data.label}</div>
      </div>
      
      {data.description && (
        <div className="text-xs opacity-70 mb-3">{data.description}</div>
      )}
      
      {data.params && (
        <div className="mt-2 pt-3 border-t w-full" 
          style={{ borderColor: colors.primary.replace('0.9', '0.2') }}>
          {Object.entries(data.params).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center mb-2 text-xs">
              <span className="opacity-70">{key}:</span>
              <code className="px-2 py-1 rounded-md text-xs"
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
          zIndex: -1
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
      persona: persona
    }
  }));

  // Create edges from connections
  const edges: Edge[] = connections.map((connection, index) => {
    // Handle connections with position objects
    let source, target;
    
    if (typeof connection.from === 'number') {
      source = `${connection.from}`;
      // sourcePosition kept for future use if needed
      // const sourcePosition = Position.Right;
    } else {
      // For direct position objects, we'd need a different approach
      // This case handles legacy connections
      return null;
    }
    
    if (typeof connection.to === 'number') {
      target = `${connection.to}`;
      // targetPosition kept for future use if needed
      // const targetPosition = Position.Left;
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
      animated: connection.animated,
      style: { 
        stroke: edgeColor, 
        strokeWidth: connection.animated ? 2 : 1.5,
        strokeDasharray: connection.dashed ? '5,5' : undefined
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeColor,
      },
      type: 'smoothstep'
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
  onNodeClick?: (nodeId: string) => void;
}

const nodeTypes = {
  flowNode: FlowNode,
};

// Inner component to handle ReactFlow logic
const InteractiveFlowInner = ({ 
  flowItems,
  connections,
  persona = "default",
  onNodeClick
}: InteractiveFlowProps) => {
  const [containerDimensions, setContainerDimensions] = useState({ width: 600, height: 400 });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
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
  
  // Handle node click
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  }, [onNodeClick]);
  
  // Auto-cycle through nodes
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((nds) => {
        if (nds.length === 0) return nds;
        
        const randomNodeIdx = Math.floor(Math.random() * nds.length);
        const newActiveId = nds[randomNodeIdx].id;
        
        if (onNodeClick) {
          onNodeClick(newActiveId);
        }
        
        return nds;
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [setNodes, onNodeClick]);
  
  return (
    <div ref={containerRef} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        connectionLineType={ConnectionLineType.SmoothStep}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background 
          color="rgba(255, 255, 255, 0.05)" 
          gap={25} 
          variant="dots" 
        />
      </ReactFlow>
    </div>
  );
};

// Export wrapped component with provider
export function InteractiveFlow(props: InteractiveFlowProps) {
  return (
    <div className={`w-full h-full bg-gray-950/50 backdrop-blur-sm rounded-xl overflow-hidden border border-primary/10 relative ${props.className || ''}`}>
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
  const [activeNodeIdx, setActiveNodeIdx] = useState<number | null>(null);
  
  const handleNodeClick = (nodeId: string) => {
    const idx = flowItems.findIndex(item => `${item.id}` === nodeId);
    setActiveNodeIdx(idx >= 0 ? idx : null);
  };
  
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
          onNodeClick={handleNodeClick}
        />
        
        {/* Node details */}
        {activeNodeIdx !== null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950/90 to-gray-950/0 backdrop-blur-sm p-4">
            <div className="bg-gray-900/70 border border-primary/20 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                {flowItems[activeNodeIdx]?.icon && React.createElement(flowItems[activeNodeIdx].icon, {
                  className: "h-4 w-4 text-primary"
                })}
                <span className="font-medium">{flowItems[activeNodeIdx]?.label}</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Connect and visualize your AI workflow components
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 