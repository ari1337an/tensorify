"use client";

import { useEffect, useRef, useState } from "react";
import {
  Panel,
  useStore,
  useStoreApi,
  useReactFlow,
  useNodes,
  ViewportPortal,
  type OnNodesChange,
  type NodeChange,
  type XYPosition,
} from "@xyflow/react";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Separator } from "@/app/_components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import {
  Bug,
  Eye,
  Activity,
  Route,
  MousePointer,
  X,
  TestTube2,
  Copy,
  CheckCircle,
} from "lucide-react";
import useWorkflowStore from "../store/workflowStore";
import { type WorkflowNode } from "../store/workflowStore";
import useAppStore, { type PluginManifest } from "@/app/_store/store";
import { useShallow } from "zustand/react/shallow";

// Change Logger Component
function ChangeLogger({ limit = 6 }: { limit?: number }) {
  const [changes, setChanges] = useState<NodeChange[]>([]);
  const onNodesChangeIntercepted = useRef(false);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const store = useStoreApi();

  useEffect(() => {
    if (!onNodesChange || onNodesChangeIntercepted.current) {
      return;
    }

    onNodesChangeIntercepted.current = true;
    const userOnNodesChange = onNodesChange;

    const onNodesChangeLogger: OnNodesChange = (latestChanges) => {
      userOnNodesChange(latestChanges);
      setChanges((oldChanges) =>
        [...latestChanges, ...oldChanges].slice(0, limit)
      );
    };

    store.setState({ onNodesChange: onNodesChangeLogger });
  }, [onNodesChange, limit, store]);

  const ChangeInfo = ({ change }: { change: NodeChange }) => {
    const id = "id" in change ? change.id : "-";
    const { type } = change;

    return (
      <div className="bg-muted/50 border border-border/50 rounded-md p-2 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Node:</span>
          <Badge variant="outline" className="text-xs font-mono">
            {id}
          </Badge>
        </div>

        {type === "add" && (
          <div>
            <span className="text-green-500 font-medium">Added</span>
          </div>
        )}
        {type === "dimensions" && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Size:</span>
            <span className="text-xs font-mono">
              {change.dimensions?.width} × {change.dimensions?.height}
            </span>
          </div>
        )}
        {type === "position" && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Position:</span>
            <span className="text-xs font-mono">
              {change.position?.x.toFixed(1)}, {change.position?.y.toFixed(1)}
            </span>
          </div>
        )}
        {type === "remove" && (
          <div>
            <span className="text-red-500 font-medium">Removed</span>
          </div>
        )}
        {type === "select" && (
          <div>
            <span
              className={`font-medium ${change.selected ? "text-blue-500" : "text-muted-foreground"}`}
            >
              {change.selected ? "Selected" : "Deselected"}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Recent Changes</h4>
      <ScrollArea className="h-48">
        <div className="space-y-2">
          {changes.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">
              No changes yet
            </div>
          ) : (
            changes.map((change, index) => (
              <ChangeInfo key={index} change={change} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Node Inspector Component
function NodeInspector() {
  const { getInternalNode } = useReactFlow();
  const nodes = useNodes<WorkflowNode>();
  const pluginManifests = useAppStore((state: any) => state.pluginManifests);
  const [copiedNodeId, setCopiedNodeId] = useState<string | null>(null);

  const NodeInfo = ({
    id,
    type,
    selected,
    position,
    absPosition,
    width,
    height,
    route,
    version,
    nodeData,
  }: {
    id: string;
    type: string;
    selected: boolean;
    position: XYPosition;
    absPosition: XYPosition;
    width: number;
    height: number;
    route: string;
    version: string;
    nodeData: any;
  }) => {
    if (!width || !height) return null;

    // Find plugin manifest for this node
    const pluginId = nodeData.pluginId || type;
    const manifest = pluginManifests.find(
      (p: any) => p.slug === pluginId || p.id === pluginId || p.slug === type
    );

    const pluginSettings = nodeData.pluginSettings || {};
    const hasSettings = manifest?.manifest?.settingsFields?.length > 0;

    // Copy settings to clipboard
    const copySettings = async () => {
      const settingsData = {
        nodeId: id,
        nodeType: type,
        pluginId: pluginId,
        settings: pluginSettings,
        manifest: manifest?.manifest?.settingsFields || [],
        position: { x: position.x, y: position.y },
      };

      try {
        await navigator.clipboard.writeText(
          JSON.stringify(settingsData, null, 2)
        );
        setCopiedNodeId(id);
        setTimeout(() => setCopiedNodeId(null), 2000);
      } catch (err) {
        console.error("Failed to copy settings:", err);
      }
    };

    return (
      <div
        className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-md p-2 text-xs space-y-2 shadow-sm max-w-sm"
        style={{
          position: "absolute",
          transform: `translate(${absPosition.x}px, ${absPosition.y + height + 8}px)`,
          zIndex: 1000,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="font-medium text-foreground">
            Node: {id.slice(0, 8)}...
          </div>
          {hasSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copySettings}
              className="h-6 w-6 p-0 hover:bg-accent"
            >
              {copiedNodeId === id ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>

        <Separator />

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-mono text-xs">{type || "default"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span className="font-mono text-xs">{version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route:</span>
            <span className="font-mono text-xs">{route}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Selected:</span>
            <Badge
              variant={selected ? "default" : "secondary"}
              className="text-xs"
            >
              {selected ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position:</span>
            <span className="font-mono text-xs">
              {position.x.toFixed(1)}, {position.y.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-mono text-xs">
              {width.toFixed(0)}×{height.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Plugin Settings Section */}
        {manifest && hasSettings && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  Plugin Settings
                </span>
                <Badge variant="outline" className="text-xs">
                  {Object.keys(pluginSettings).length} values
                </Badge>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {manifest.manifest.settingsFields.map((field: any) => {
                  const value = pluginSettings[field.key];
                  const hasValue = value !== undefined && value !== null;

                  return (
                    <div
                      key={field.key}
                      className="flex justify-between items-start gap-2"
                    >
                      <span className="text-muted-foreground text-xs truncate">
                        {field.label || field.key}:
                      </span>
                      <span className="font-mono text-xs text-right">
                        {hasValue ? (
                          typeof value === "boolean" ? (
                            <Badge
                              variant={value ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {value ? "True" : "False"}
                            </Badge>
                          ) : (
                            String(value)
                          )
                        ) : (
                          <span className="text-muted-foreground">
                            {field.defaultValue !== undefined
                              ? String(field.defaultValue)
                              : "—"}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {copiedNodeId === id && (
                <div className="text-xs text-green-600 font-medium">
                  Settings copied to clipboard!
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <ViewportPortal>
      <div>
        {nodes.map((node) => {
          if (node.hidden) return null;
          const internalNode = getInternalNode(node.id);
          if (!internalNode) return null;

          const absPosition = internalNode?.internals.positionAbsolute;
          if (!absPosition) return null;

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
              route={node.route}
              version={node.version}
              nodeData={node.data}
            />
          );
        })}
      </div>
    </ViewportPortal>
  );
}

// Viewport Logger Component
function ViewportLogger() {
  const viewport = useStore(
    (s) =>
      `x: ${s.transform[0].toFixed(2)}, y: ${s.transform[1].toFixed(
        2
      )}, zoom: ${s.transform[2].toFixed(2)}`
  );

  return (
    <Panel position="bottom-center" className="z-10">
      <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2">
        <span className="text-xs font-mono text-foreground">{viewport}</span>
      </div>
    </Panel>
  );
}

// Route Inspector Component
function RouteInspector() {
  const currentRoute = useWorkflowStore((state) => state.currentRoute);

  return (
    <Panel position="bottom-right" className="z-10">
      <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2">
        <span className="text-xs font-mono text-foreground">
          {currentRoute}
        </span>
      </div>
    </Panel>
  );
}

// Sample plugin manifest for testing
const samplePluginManifest = {
  settingsFields: [
    {
      key: "modelName",
      label: "Model Name",
      type: "input-text",
      dataType: "string",
      defaultValue: "test_model_v1",
      required: true,
      description: "Name for the model",
      validation: {
        minLength: 3,
        maxLength: 50,
        pattern: "^[a-zA-Z0-9_]+$",
      },
      group: "model_config",
    },
    {
      key: "learningRate",
      label: "Learning Rate",
      type: "input-number",
      dataType: "number",
      defaultValue: 0.001,
      required: true,
      description: "Learning rate for training",
      validation: {
        min: 0.0001,
        max: 1.0,
      },
      group: "training_params",
    },
    {
      key: "batchSize",
      label: "Batch Size",
      type: "slider",
      dataType: "number",
      defaultValue: 32,
      required: true,
      description: "Training batch size",
      validation: {
        min: 1,
        max: 512,
      },
      group: "training_params",
    },
    {
      key: "useGpu",
      label: "Use GPU Acceleration",
      type: "toggle",
      dataType: "boolean",
      defaultValue: true,
      required: false,
      description: "Enable GPU acceleration for training",
      group: "performance",
    },
    {
      key: "optimizer",
      label: "Optimizer",
      type: "dropdown",
      dataType: "string",
      defaultValue: "adam",
      required: true,
      description: "Optimization algorithm",
      options: [
        {
          label: "Adam",
          value: "adam",
          description: "Adaptive Moment Estimation",
        },
        {
          label: "SGD",
          value: "sgd",
          description: "Stochastic Gradient Descent",
        },
        {
          label: "RMSprop",
          value: "rmsprop",
          description: "Root Mean Square Propagation",
        },
      ],
      group: "training_params",
    },
    {
      key: "metrics",
      label: "Evaluation Metrics",
      type: "multi-select",
      dataType: "array",
      defaultValue: ["accuracy", "loss"],
      required: true,
      description: "Metrics to track during training",
      options: [
        { label: "Accuracy", value: "accuracy" },
        { label: "Loss", value: "loss" },
        { label: "Precision", value: "precision" },
        { label: "Recall", value: "recall" },
        { label: "F1 Score", value: "f1" },
      ],
      group: "model_config",
    },
  ],
  settingsGroups: [
    {
      id: "model_config",
      label: "Model Configuration",
      description: "Basic model settings and metadata",
      collapsible: true,
      defaultExpanded: true,
      fields: ["modelName", "metrics"],
      order: 1,
    },
    {
      id: "training_params",
      label: "Training Parameters",
      description: "Hyperparameters for model training",
      collapsible: true,
      defaultExpanded: true,
      fields: ["learningRate", "batchSize", "optimizer"],
      order: 2,
    },
    {
      id: "performance",
      label: "Performance Settings",
      description: "GPU and performance configuration",
      collapsible: true,
      defaultExpanded: false,
      fields: ["useGpu"],
      order: 3,
    },
  ],
};

// Main DevTools Component
export default function DevTools() {
  const [isVisible, setIsVisible] = useState(false);
  const [nodeInspectorActive, setNodeInspectorActive] = useState(false);
  const [changeLoggerActive, setChangeLoggerActive] = useState(false);
  const [viewportLoggerActive, setViewportLoggerActive] = useState(false);
  const [routeInspectorActive, setRouteInspectorActive] = useState(false);

  const { nodes, edges, currentRoute, addNode } = useWorkflowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      currentRoute: state.currentRoute,
      addNode: state.addNode,
    }))
  );

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Function to create a test node with plugin settings
  const createTestPluginNode = () => {
    // Get the first available plugin manifest from the store
    const pluginManifests: PluginManifest[] =
      useAppStore.getState().pluginManifests || [];
    const firstPlugin: PluginManifest | undefined = pluginManifests[0];

    if (!firstPlugin) {
      console.warn("No plugin manifests available to create test node");
      return;
    }

    // Generate default settings from the manifest
    const defaultSettings: Record<string, any> = {};
    if (firstPlugin.manifest?.settingsFields) {
      (firstPlugin.manifest.settingsFields as any[]).forEach((field: any) => {
        if (field.defaultValue !== undefined) {
          defaultSettings[field.key] = field.defaultValue;
        }
      });
    }

    const testNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: firstPlugin.slug, // Use the actual plugin slug as type
      position: { x: 100, y: 100 },
      route: currentRoute,
      version: (firstPlugin.manifest?.version as string) || "1.0.0",
      data: {
        label: (firstPlugin.manifest?.name as string) || "Test Plugin Node",
        pluginId: firstPlugin.slug, // Set the pluginId for lookup
        pluginSettings: defaultSettings,
      },
      selected: false,
      dragging: false,
    };

    addNode(testNode);
  };

  // Function to create a test edge between existing nodes
  const createTestEdge = () => {
    if (nodes.length < 2) {
      console.warn("⚠️ Need at least 2 nodes to create an edge");
      return;
    }

    // Find a start node and an end node
    const startNode = nodes.find((n) => n.type === "@tensorify/core/StartNode");
    const endNode = nodes.find((n) => n.type === "@tensorify/core/EndNode");

    if (!startNode || !endNode) {
      console.warn("⚠️ Need both StartNode and EndNode to create test edge");
      return;
    }

    const testEdge = {
      id: `test-edge-${Date.now()}`,
      source: startNode.id,
      target: endNode.id,
      sourceHandle: "start-output",
      targetHandle: "end-input",
      type: "smoothstep",
    };

    console.log("🔗 Creating test edge:", testEdge);
    // Use the store's setEdges method to ensure proper state management
    const currentEdges = useWorkflowStore.getState().edges;
    useWorkflowStore.getState().setEdges([...currentEdges, testEdge]);

    // Debug DOM after edge creation
    setTimeout(() => {
      const edgeElements = document.querySelectorAll(".react-flow__edge");
      const edgePaths = document.querySelectorAll(".react-flow__edge path");
      console.log("🔍 DOM Debug after edge creation:", {
        edgeElements: edgeElements.length,
        edgePaths: edgePaths.length,
        edgeElementsArray: Array.from(edgeElements),
        edgePathsArray: Array.from(edgePaths).map((path) => ({
          d: path.getAttribute("d"),
          style: path.getAttribute("style"),
          className: path.className,
        })),
      });
    }, 100);
  };

  // Function to create a simple test edge without custom handles
  const createSimpleTestEdge = () => {
    if (nodes.length < 2) {
      console.warn("⚠️ Need at least 2 nodes to create a simple edge");
      return;
    }

    const firstNode = nodes[0];
    const secondNode = nodes[1];

    const simpleEdge = {
      id: `simple-edge-${Date.now()}`,
      source: firstNode.id,
      target: secondNode.id,
      // No custom handles - let React Flow use defaults
    };

    console.log(
      "🔗 Creating simple test edge (no custom handles):",
      simpleEdge
    );
    // Use the store's setEdges method to ensure proper state management
    const currentEdges = useWorkflowStore.getState().edges;
    useWorkflowStore.getState().setEdges([...currentEdges, simpleEdge]);
  };

  // Function to create a test node with visual configuration using real plugin
  const createVisualConfigTestNode = () => {
    // Get the first available plugin manifest from the store
    const pluginManifests: PluginManifest[] =
      useAppStore.getState().pluginManifests || [];
    const firstPlugin: PluginManifest | undefined = pluginManifests[0];

    if (!firstPlugin) {
      console.warn(
        "No plugin manifests available to create visual config test node"
      );
      return;
    }

    // Create a node that will use the plugin's manifest for visual config testing
    const testNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: firstPlugin.slug, // Use the actual plugin slug as type
      position: { x: 300, y: 100 },
      route: currentRoute,
      version: (firstPlugin.manifest?.version as string) || "1.0.0",
      data: {
        label: `${firstPlugin.manifest?.name || "Visual Test"} (Config Test)`,
        pluginId: firstPlugin.slug, // Set the pluginId for lookup
        // Don't set visualConfig - let it use the manifest defaults
        // Visual changes in the Info tab will update the manifest globally
      },
      selected: false,
      dragging: false,
    };

    addNode(testNode);
    console.log(
      `📦 Created visual config test node using plugin: ${firstPlugin.slug}`
    );
  };

  const ToolButton = ({
    icon: Icon,
    label,
    active,
    onClick,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="gap-1.5 text-xs h-7 px-2"
    >
      <Icon className="w-3 h-3" />
      {label}
    </Button>
  );

  return (
    <TooltipProvider>
      {!isVisible && (
        <Panel position="top-left" className="z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsVisible(true)}
                className="h-12 w-12 rounded-full backdrop-blur-sm bg-card/90 border-border/50 hover:bg-card shadow-sm transition-all duration-200 hover:scale-105"
              >
                <Bug className="size-5 text-card-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Dev Tools
            </TooltipContent>
          </Tooltip>
        </Panel>
      )}

      {isVisible && (
        <Panel position="top-left" className="z-20">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg w-80">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h3 className="font-semibold text-sm">Development Tools</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="flex w-fit mx-auto mt-3 mb-0 h-8 p-1">
                <TabsTrigger value="overview" className="text-xs px-3 py-1 h-6">
                  Info
                </TabsTrigger>
                <TabsTrigger value="tools" className="text-xs px-3 py-1 h-6">
                  Tools
                </TabsTrigger>
                <TabsTrigger value="changes" className="text-xs px-3 py-1 h-6">
                  Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="px-4 py-3 space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Route:</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {currentRoute}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Nodes:</span>
                    <Badge variant="secondary" className="text-xs">
                      {nodes.length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Visible Nodes:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {nodes.filter((n) => !n.hidden).length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Edges:</span>
                    <Badge variant="secondary" className="text-xs">
                      {edges.length}
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="px-4 py-3 space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Inspector Tools</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <ToolButton
                      icon={Eye}
                      label="Node Inspector"
                      active={nodeInspectorActive}
                      onClick={() =>
                        setNodeInspectorActive(!nodeInspectorActive)
                      }
                    />
                    <ToolButton
                      icon={MousePointer}
                      label="Viewport"
                      active={viewportLoggerActive}
                      onClick={() =>
                        setViewportLoggerActive(!viewportLoggerActive)
                      }
                    />
                    <ToolButton
                      icon={Route}
                      label="Route"
                      active={routeInspectorActive}
                      onClick={() =>
                        setRouteInspectorActive(!routeInspectorActive)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Test Tools</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createTestPluginNode}
                      className="gap-1.5 text-xs h-7 px-2"
                    >
                      <TestTube2 className="w-3 h-3" />
                      Create Test Plugin Node
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createVisualConfigTestNode}
                      className="gap-1.5 text-xs h-7 px-2"
                    >
                      <TestTube2 className="w-3 h-3" />
                      Create Visual Config Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createTestEdge}
                      className="gap-1.5 text-xs h-7 px-2"
                    >
                      <TestTube2 className="w-3 h-3" />
                      Create Test Edge
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={createSimpleTestEdge}
                      className="gap-1.5 text-xs h-7 px-2"
                    >
                      <TestTube2 className="w-3 h-3" />
                      Simple Edge (No Handles)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Test nodes: Plugin settings UI and global visual
                    configuration updates
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="changes" className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Change Logger</h4>
                  <Button
                    variant={changeLoggerActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChangeLoggerActive(!changeLoggerActive)}
                    className="gap-1.5 text-xs h-7 px-2"
                  >
                    <Activity className="w-3 h-3" />
                    {changeLoggerActive ? "Stop" : "Start"}
                  </Button>
                </div>

                {changeLoggerActive && <ChangeLogger limit={6} />}
              </TabsContent>
            </Tabs>
          </div>
        </Panel>
      )}

      {/* Conditionally render inspector tools */}
      {nodeInspectorActive && <NodeInspector />}
      {viewportLoggerActive && <ViewportLogger />}
      {routeInspectorActive && <RouteInspector />}
    </TooltipProvider>
  );
}
