'use client';

import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  ConnectionLineType,
  MarkerType,
  Handle,
} from 'reactflow';
import { 
  Brain, 
  BarChart, 
  Code, 
  Database, 
  GitMerge, 
  Layers, 
  Zap, 
  CheckCircle2, 
  GanttChart, 
  Cylinder, 
  Share2, 
  GitBranch, 
  Workflow,
  ServerCog
} from 'lucide-react';
import 'reactflow/dist/style.css';

// Custom node styles
const nodeStyles = {
  base: {
    padding: '14px',
    borderRadius: '12px',
    minWidth: '180px',
    fontSize: '12px',
    backgroundColor: 'rgba(32, 32, 40, 0.8)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.1)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  input: {
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
    borderTop: '1px solid rgba(124, 58, 237, 0.5)',
    borderLeft: '1px solid rgba(124, 58, 237, 0.5)',
    borderRight: '1px solid rgba(99, 102, 241, 0.3)',
    borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.15)',
  },
  model: {
    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)',
    borderTop: '1px solid rgba(249, 115, 22, 0.5)',
    borderLeft: '1px solid rgba(249, 115, 22, 0.5)',
    borderRight: '1px solid rgba(234, 88, 12, 0.3)',
    borderBottom: '1px solid rgba(234, 88, 12, 0.3)',
    boxShadow: '0 8px 24px rgba(249, 115, 22, 0.15)',
  },
  process: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
    borderTop: '1px solid rgba(16, 185, 129, 0.5)',
    borderLeft: '1px solid rgba(16, 185, 129, 0.5)',
    borderRight: '1px solid rgba(5, 150, 105, 0.3)',
    borderBottom: '1px solid rgba(5, 150, 105, 0.3)',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
  },
  condition: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
    borderTop: '1px solid rgba(59, 130, 246, 0.5)',
    borderLeft: '1px solid rgba(59, 130, 246, 0.5)',
    borderRight: '1px solid rgba(37, 99, 235, 0.3)',
    borderBottom: '1px solid rgba(37, 99, 235, 0.3)',
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
  },
  output: {
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
    borderTop: '1px solid rgba(139, 92, 246, 0.5)',
    borderLeft: '1px solid rgba(139, 92, 246, 0.5)',
    borderRight: '1px solid rgba(124, 58, 237, 0.3)',
    borderBottom: '1px solid rgba(124, 58, 237, 0.3)',
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)',
  },
  selected: {
    boxShadow: '0 12px 32px rgba(99, 102, 241, 0.3), 0 0 0 2px rgba(99, 102, 241, 0.5)',
    transform: 'translateY(-5px) scale(1.03)',
  },
};

// Icons for the nodes
const NodeIcon = ({ type }) => {
  const icons = {
    input: <Database className="h-5 w-5" />,
    model: <Brain className="h-5 w-5" />,
    process: <Workflow className="h-5 w-5" />,
    condition: <GitBranch className="h-5 w-5" />,
    output: <Share2 className="h-5 w-5" />,
    default: <ServerCog className="h-5 w-5" />
  };
  
  return icons[type] || icons.default;
};

// Custom node component
const CustomNode = ({ data, selected, id }) => {
  return (
    <>
      <div
        style={{
          ...nodeStyles.base,
          ...(data.type && nodeStyles[data.type]),
          ...(selected && nodeStyles.selected),
        }}
        className="group"
      >
        {data.handles?.input !== false && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-indigo-700 -ml-1.5"
          />
        )}

        {data.handles?.output !== false && (
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-indigo-700 -mr-1.5"
          />
        )}

        {data.conditional && (
          <>
            <Handle
              type="source"
              position={Position.Bottom}
              id="yes"
              className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700 -mb-1.5 left-1/3"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id="no"
              className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700 -mb-1.5 left-2/3"
            />
          </>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <NodeIcon type={data.type} />
          </div>
          <div className="font-bold text-sm text-white">{data.label}</div>
        </div>

        {data.description && (
          <div className="text-xs opacity-70 mb-3">{data.description}</div>
        )}

        {data.params && (
          <div className="mt-2 pt-3 border-t border-indigo-500/20 w-full">
            {Object.entries(data.params).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center mb-2 text-xs">
                <span className="opacity-70">{key}:</span>
                <code className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300">{value}</code>
              </div>
            ))}
          </div>
        )}
        
        {data.conditional && (
          <div className="flex justify-around mt-3 pt-2 border-t border-indigo-500/20">
            <div className="text-xs flex items-center text-green-400">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
              Yes
            </div>
            <div className="text-xs flex items-center text-red-400">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
              No
            </div>
          </div>
        )}
        
        <div className="absolute -bottom-1 left-0 right-0 h-1 mx-auto w-16 bg-indigo-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </>
  );
};

// Initial nodes for the demo
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { 
      label: 'Dataset Input', 
      type: 'input',
      description: 'Load and preprocess training data',
      params: { 'format': 'Tensor', 'size': '10GB' }
    },
    position: { x: 100, y: 150 },
  },
  {
    id: '2',
    type: 'custom',
    data: { 
      label: 'Feature Extraction', 
      type: 'process',
      description: 'Transform raw data into features',
      params: { 'method': 'CNN', 'dim': '768' }
    },
    position: { x: 350, y: 50 },
  },
  {
    id: '3',
    type: 'custom',
    data: { 
      label: 'Model Architecture', 
      type: 'model',
      description: 'Define neural network structure',
      params: { 'type': 'Transformer', 'layers': '12' }
    },
    position: { x: 350, y: 250 },
  },
  {
    id: '4',
    type: 'custom',
    data: { 
      label: 'Training Pipeline', 
      type: 'process',
      description: 'Optimize model parameters',
      params: { 'optimizer': 'Adam', 'epochs': '100' }
    },
    position: { x: 650, y: 150 },
  },
  {
    id: '5',
    type: 'custom',
    data: { 
      label: 'Evaluation Check', 
      type: 'condition',
      description: 'Validate model performance',
      params: { 'metric': 'F1 Score', 'threshold': '0.85' },
      conditional: true
    },
    position: { x: 950, y: 150 },
  },
  {
    id: '6',
    type: 'custom',
    data: { 
      label: 'Model Deployment', 
      type: 'output',
      description: 'Deploy to production',
      params: { 'target': 'API', 'version': 'v1.0' }
    },
    position: { x: 1200, y: 50 },
  },
  {
    id: '7',
    type: 'custom',
    data: { 
      label: 'Retraining', 
      type: 'process',
      description: 'Adjust hyperparameters',
      params: { 'learning_rate': '0.0001', 'batch': '64' }
    },
    position: { x: 1200, y: 250 },
  }
];

// Initial edges for the demo
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: 'rgba(99, 102, 241, 0.6)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(99, 102, 241, 0.6)',
    },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    animated: true,
    style: { stroke: 'rgba(99, 102, 241, 0.6)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(99, 102, 241, 0.6)',
    },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    animated: true,
    style: { stroke: 'rgba(99, 102, 241, 0.6)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(99, 102, 241, 0.6)',
    },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    animated: true,
    style: { stroke: 'rgba(99, 102, 241, 0.6)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(99, 102, 241, 0.6)',
    },
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    animated: true,
    style: { stroke: 'rgba(99, 102, 241, 0.6)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(99, 102, 241, 0.6)',
    },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    sourceHandle: 'yes',
    animated: true,
    style: { stroke: 'rgba(16, 185, 129, 0.6)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(16, 185, 129, 0.6)',
    },
    label: 'Pass',
    labelStyle: { fill: 'rgba(16, 185, 129, 0.9)', fontWeight: 500, fontSize: 12 },
    labelBgStyle: { fill: 'rgba(16, 185, 129, 0.1)', fillOpacity: 0.7 },
  },
  {
    id: 'e5-7',
    source: '5',
    target: '7',
    sourceHandle: 'no',
    animated: true,
    style: { stroke: 'rgba(239, 68, 68, 0.6)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(239, 68, 68, 0.6)',
    },
    label: 'Fail',
    labelStyle: { fill: 'rgba(239, 68, 68, 0.9)', fontWeight: 500, fontSize: 12 },
    labelBgStyle: { fill: 'rgba(239, 68, 68, 0.1)', fillOpacity: 0.7 },
  },
  {
    id: 'e7-4',
    source: '7',
    target: '4',
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'rgba(99, 102, 241, 0.6)', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(99, 102, 241, 0.6)',
    },
  },
];

const nodeTypes = {
  custom: CustomNode,
};

export function InteractiveFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isClient, setIsClient] = useState(false);
  
  // Handle node click for interactive effect
  const onNodeClick = useCallback((_, node) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: n.id === node.id,
        },
      }))
    );
  }, [setNodes]);
  
  // Animate nodes periodically
  useEffect(() => {
    setIsClient(true);
    
    const interval = setInterval(() => {
      const randomNodeId = Math.floor(Math.random() * initialNodes.length) + 1;
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            selected: n.id === String(randomNodeId),
          },
        }))
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [setNodes]);
  
  if (!isClient) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '400px', backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultZoom={0.85}
        proOptions={{ hideAttribution: true }}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: 'rgba(99, 102, 241, 0.6)', strokeWidth: 2 }}
      >
        <Background color="rgba(255, 255, 255, 0.05)" gap={25} variant="dots" />
        <Controls className="bg-indigo-900/20 rounded-md border border-indigo-500/20" showInteractive={false} />
      </ReactFlow>
    </div>
  );
} 