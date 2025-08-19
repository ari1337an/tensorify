import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { TypeIcon, ArrowRightIcon, LayersIcon } from "lucide-react";
import { EmittedVariable } from "../../../services/VariableFlowService";
import { WorkflowNode } from "../../../store/workflowStore";
import { PluginManifest } from "@/app/_store/store";
import useWorkflowStore from "../../../store/workflowStore";
import useAppStore from "@/app/_store/store";
import { useUIEngine } from "@workflow/engine";
import { cn } from "@/app/_lib/utils";

interface VariablesTabProps {
  node: WorkflowNode;
  nodeId: string;
}

export function VariablesTab({ node, nodeId }: VariablesTabProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const currentRoute = useWorkflowStore((s) => s.currentRoute);
  const setRoute = useWorkflowStore((s) => s.setRoute);
  const focusOnNode = useWorkflowStore((s) => s.focusOnNode);
  const closeNodeSettingsDialog = useWorkflowStore(
    (s) => s.closeNodeSettingsDialog
  );
  const closeGlobalNodeSettingsDialog = useWorkflowStore(
    (s) => s.closeGlobalNodeSettingsDialog
  );
  const pluginManifests = useAppStore((s) => s.pluginManifests);
  const engine = useUIEngine();

  // Get variable flow information for this node from the UI engine
  const variableInfo = useMemo(() => {
    console.log(`🔍 [VariablesTab] Opening Variables tab for node: ${nodeId}`);
    const names = engine.availableVariablesByNodeId[nodeId] || [];
    const details = engine.availableVariableDetailsByNodeId[nodeId] || [];

    // Debug manifest data for this node
    const nodeData = node.data as any;
    const pluginId = nodeData?.pluginId || node.type;
    const matchingManifest = pluginManifests.find(
      (pm) => (pm as any)?.slug === pluginId || (pm as any)?.id === pluginId
    );

    console.log(`🔍 [VariablesTab] DEBUG manifest for node ${nodeId}:`, {
      nodeId,
      nodeType: node.type,
      pluginId,
      matchingManifest,
      manifestEmits: matchingManifest
        ? (matchingManifest as any)?.manifest?.emits
        : "No matching manifest",
      allManifests: pluginManifests.map((pm) => ({
        slug: (pm as any)?.slug,
        pluginType: (pm as any)?.pluginType,
        manifestEmits: (pm as any)?.manifest?.emits,
      })),
    });

    const availableVariables: EmittedVariable[] = details.map((d) => ({
      name: d.name,
      sourceNodeId: d.sourceNodeId,
      sourceNodeType: d.sourceNodeType,
      pluginType: d.pluginType,
      switchKey: "",
      isEnabled: d.isEnabled,
      isOnByDefault: true,
    }));

    console.log(`📊 [VariablesTab] Variables for node ${nodeId}:`, {
      nodeId,
      nodeRoute: node.route,
      nodeType: node.type,
      availableVariables: availableVariables.map((v) => ({
        name: v.name,
        sourceNodeId: v.sourceNodeId,
        sourceNodeType: v.sourceNodeType,
        pluginType: v.pluginType,
        isEnabled: v.isEnabled,
      })),
      variableNames: names,
      variableCount: names.length,
    });

    return {
      availableVariables,
      emittedVariables: [],
      imports: [],
    };
  }, [engine, nodeId, node.route, node.type]);

  // Handle variable emission toggle
  const handleVariableToggle = (
    emittedVar: EmittedVariable,
    enabled: boolean
  ) => {
    const settingsKey = emittedVar.switchKey.includes(".")
      ? emittedVar.switchKey.split(".").pop()!
      : emittedVar.switchKey;

    const currentSettings = node.data.pluginSettings || {};
    updateNodeData(nodeId, {
      pluginSettings: {
        ...currentSettings,
        [settingsKey]: enabled,
      },
    });
  };

  // Handle navigation to variable source node
  const handleVariableClick = (variable: EmittedVariable) => {
    const sourceNode = nodes.find((n) => n.id === variable.sourceNodeId);
    if (!sourceNode) return;

    // Close current node settings dialog
    closeNodeSettingsDialog(nodeId);
    closeGlobalNodeSettingsDialog();

    // If source node is in a different route, switch routes first
    if (sourceNode.route !== currentRoute) {
      setRoute(sourceNode.route);
      // Add a delay to let the route change complete before focusing
      setTimeout(() => {
        focusOnNode(variable.sourceNodeId);
      }, 100);
    } else {
      // Same route, focus immediately
      focusOnNode(variable.sourceNodeId);
    }
  };

  // Get icon for a plugin type
  const getPluginTypeIcon = (pluginType: string) => {
    return <LayersIcon className="h-3 w-3" />;
  };

  const getPluginTypeColor = (pluginType: string) => {
    const colorMap: Record<string, string> = {
      model_layer: "hsl(var(--primary))",
      sequence: "hsl(var(--secondary))",
      optimizer: "hsl(var(--accent))",
      criterion: "hsl(var(--destructive))",
      trainer: "hsl(var(--success))",
      dataloader: "hsl(var(--warning))",
      dataset: "hsl(var(--info))",
      metric: "hsl(var(--muted-foreground))",
      scheduler: "hsl(var(--chart-1))",
      regularizer: "hsl(var(--chart-2))",
      preprocessor: "hsl(var(--chart-3))",
      postprocessor: "hsl(var(--chart-4))",
      function: "hsl(var(--chart-5))",
      pipeline: "hsl(var(--primary))",
      custom: "hsl(var(--accent))",
      unknown: "hsl(var(--muted-foreground))",
    };
    return colorMap[pluginType] || colorMap["unknown"];
  };

  // Render a variable badge with source information
  const renderVariableBadge = (
    variable: EmittedVariable,
    isEmitted: boolean = false
  ) => {
    const pluginTypeColor = getPluginTypeColor(variable.pluginType);

    return (
      <TooltipProvider key={`${variable.sourceNodeId}-${variable.name}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 cursor-pointer",
                isEmitted
                  ? "bg-primary/10 border-primary/20 hover:bg-primary/15"
                  : "bg-muted/50 border-border hover:bg-muted hover:border-primary/30",
                !variable.isEnabled && "opacity-50"
              )}
              onClick={() => !isEmitted && handleVariableClick(variable)}
            >
              <div className="flex items-center gap-1">
                {getPluginTypeIcon(variable.pluginType)}
                <span className="text-xs font-medium text-foreground">
                  {variable.name}
                </span>
              </div>

              {isEmitted && (
                <div className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="text-xs px-1 py-0"
                    style={{
                      backgroundColor: `${pluginTypeColor}20`,
                      color: pluginTypeColor,
                    }}
                  >
                    {variable.pluginType}
                  </Badge>
                  {variable.isEnabled ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
              )}

              {!isEmitted && (
                <Badge
                  variant="outline"
                  className="text-xs px-1 py-0"
                  style={{
                    borderColor: pluginTypeColor,
                    color: pluginTypeColor,
                  }}
                >
                  {variable.pluginType}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">Variable: {variable.name}</p>
              <p className="text-xs text-muted-foreground">
                Source: {variable.sourceNodeType}
              </p>
              <p className="text-xs text-muted-foreground">
                Type: {variable.pluginType}
              </p>
              {!isEmitted && (
                <p className="text-xs text-primary">
                  Click to navigate to source node
                </p>
              )}
              {isEmitted && (
                <p className="text-xs">
                  Status: {variable.isEnabled ? "Enabled" : "Disabled"}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-6">
      {/* Available Variables Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightIcon className="h-4 w-4 text-primary" />
            Available Variables
          </CardTitle>
          <CardDescription>
            Variables from upstream nodes that can be used in this node
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variableInfo.availableVariables.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {variableInfo.availableVariables.map((variable) =>
                  renderVariableBadge(variable, false)
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-center">
              <div className="space-y-2">
                <TypeIcon className="h-6 w-6 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  No variables available
                </p>
                <p className="text-xs text-muted-foreground">
                  Connect upstream nodes to see their variables here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
