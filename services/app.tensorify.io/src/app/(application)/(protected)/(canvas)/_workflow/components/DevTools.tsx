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
import { Bug, Eye, Activity, Route, MousePointer, X } from "lucide-react";
import useWorkflowStore from "../store/workflowStore";
import { type WorkflowNode } from "../store/workflowStore";

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
  }) => {
    if (!width || !height) return null;

    return (
      <div
        className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-md p-2 text-xs space-y-1 shadow-sm max-w-xs"
        style={{
          position: "absolute",
          transform: `translate(${absPosition.x}px, ${absPosition.y + height + 8}px)`,
          zIndex: 1000,
        }}
      >
        <div className="font-medium text-foreground">Node: {id}</div>
        <Separator />
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-mono">{type || "default"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span className="font-mono">{version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route:</span>
            <span className="font-mono">{route}</span>
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
            <span className="font-mono">
              {position.x.toFixed(1)}, {position.y.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-mono">
              {width} × {height}
            </span>
          </div>
        </div>
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

// Main DevTools Component
export default function DevTools() {
  const [isVisible, setIsVisible] = useState(false);
  const [nodeInspectorActive, setNodeInspectorActive] = useState(false);
  const [changeLoggerActive, setChangeLoggerActive] = useState(false);
  const [viewportLoggerActive, setViewportLoggerActive] = useState(false);
  const [routeInspectorActive, setRouteInspectorActive] = useState(false);

  const { nodes, edges, currentRoute } = useWorkflowStore();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

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
