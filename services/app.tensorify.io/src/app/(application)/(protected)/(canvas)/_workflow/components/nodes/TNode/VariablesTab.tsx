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
import {
  TypeIcon,
  ArrowRightIcon,
  LayersIcon,
  BrainIcon,
  ZapIcon,
  TargetIcon,
  PlayIcon,
  DatabaseIcon,
  TableIcon,
  BarChartIcon,
  CalendarIcon,
  ShieldIcon,
  FilterIcon,
  SendIcon,
  CodeIcon,
  WorkflowIcon,
  PuzzleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { EmittedVariable } from "../../../services/VariableFlowService";
import { WorkflowNode } from "../../../store/workflowStore";
import { PluginManifest } from "@/app/_store/store";
import useWorkflowStore from "../../../store/workflowStore";
import useAppStore from "@/app/_store/store";
import { useUIEngine } from "@workflow/engine";

interface VariablesTabProps {
  node: WorkflowNode;
  nodeId: string;
}

export function VariablesTab({ node, nodeId }: VariablesTabProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    new Set()
  );
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

    // Group variables by type for organized display
    const variablesByType = availableVariables.reduce(
      (acc, variable) => {
        const type = variable.pluginType || "unknown";
        if (!acc[type]) acc[type] = [];
        acc[type].push(variable);
        return acc;
      },
      {} as Record<string, EmittedVariable[]>
    );

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
      variablesByType,
      variableNames: names,
      variableCount: names.length,
    });

    return {
      availableVariables,
      variablesByType,
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
    const iconMap: Record<string, React.ReactNode> = {
      model_layer: <BrainIcon className="h-3 w-3" />,
      sequence: <LayersIcon className="h-3 w-3" />,
      optimizer: <ZapIcon className="h-3 w-3" />,
      criterion: <TargetIcon className="h-3 w-3" />,
      trainer: <PlayIcon className="h-3 w-3" />,
      dataloader: <DatabaseIcon className="h-3 w-3" />,
      dataset: <TableIcon className="h-3 w-3" />,
      metric: <BarChartIcon className="h-3 w-3" />,
      scheduler: <CalendarIcon className="h-3 w-3" />,
      regularizer: <ShieldIcon className="h-3 w-3" />,
      preprocessor: <FilterIcon className="h-3 w-3" />,
      postprocessor: <SendIcon className="h-3 w-3" />,
      function: <CodeIcon className="h-3 w-3" />,
      pipeline: <WorkflowIcon className="h-3 w-3" />,
      custom: <PuzzleIcon className="h-3 w-3" />,
      unknown: <TypeIcon className="h-3 w-3" />,
    };
    return iconMap[pluginType] || iconMap["unknown"];
  };

  // Get display name for a plugin type
  const getPluginTypeDisplayName = (pluginType: string) => {
    const nameMap: Record<string, string> = {
      model_layer: "Model Layers",
      sequence: "Sequences",
      optimizer: "Optimizers",
      criterion: "Loss Functions",
      trainer: "Trainers",
      dataloader: "Data Loaders",
      dataset: "Datasets",
      metric: "Metrics",
      scheduler: "Schedulers",
      regularizer: "Regularizers",
      preprocessor: "Preprocessors",
      postprocessor: "Postprocessors",
      function: "Functions",
      pipeline: "Pipelines",
      custom: "Custom",
      unknown: "Unknown",
    };
    return (
      nameMap[pluginType] ||
      pluginType.charAt(0).toUpperCase() + pluginType.slice(1)
    );
  };

  // Toggle section collapse
  const toggleSection = (sectionType: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionType)) {
      newCollapsed.delete(sectionType);
    } else {
      newCollapsed.add(sectionType);
    }
    setCollapsedSections(newCollapsed);
  };

  const getPluginTypeColor = (pluginType: string) => {
    const colorMap: Record<string, string> = {
      model_layer: "var(--primary-readable)",
      sequence: "var(--chart-2)",
      optimizer: "var(--chart-1)",
      criterion: "var(--destructive)",
      trainer: "var(--chart-3)",
      dataloader: "var(--chart-4)",
      dataset: "var(--chart-5)",
      metric: "var(--accent)",
      scheduler: "var(--primary-readable)",
      regularizer: "var(--chart-2)",
      preprocessor: "var(--chart-3)",
      postprocessor: "var(--chart-4)",
      function: "var(--chart-5)",
      pipeline: "var(--primary-readable)",
      custom: "var(--accent)",
      unknown: "var(--muted-foreground)",
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
                "group relative flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                "hover:shadow-md",
                isEmitted
                  ? "bg-card border-border hover:bg-muted/20"
                  : "bg-card border-border hover:bg-muted/40 hover:border-primary/40",
                !variable.isEnabled && "opacity-60"
              )}
              onClick={() => !isEmitted && handleVariableClick(variable)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="p-1 rounded-md flex-shrink-0 bg-muted/50"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${pluginTypeColor} 15%, transparent)`,
                  }}
                >
                  {getPluginTypeIcon(variable.pluginType)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground block truncate">
                    {variable.name}
                  </span>
                  <span className="text-xs text-muted-foreground block truncate">
                    from {variable.sourceNodeType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!isEmitted && (
                  <ArrowRightIcon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                )}

                {isEmitted && variable.isEnabled && (
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm" />
                )}

                {isEmitted && !variable.isEnabled && (
                  <div className="w-2 h-2 bg-muted-foreground rounded-full shadow-sm" />
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="p-1 rounded bg-muted/50"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${pluginTypeColor} 20%, transparent)`,
                  }}
                >
                  {getPluginTypeIcon(variable.pluginType)}
                </div>
                <span className="font-medium">{variable.name}</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-muted-foreground">
                  <span className="font-medium">Source:</span>{" "}
                  {variable.sourceNodeType}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Type:</span>{" "}
                  {getPluginTypeDisplayName(variable.pluginType)}
                </p>
                {!isEmitted && (
                  <p className="text-primary font-medium">
                    Click to navigate to source node
                  </p>
                )}
                {isEmitted && (
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={
                        variable.isEnabled
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }
                    >
                      {variable.isEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-6">
      {/* Available Variables Section */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4 bg-card rounded-t-lg">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightIcon className="h-4 w-4 text-primary" />
            Available Variables
          </CardTitle>
          <CardDescription>
            Variables from upstream nodes that can be used in this node
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {variableInfo.availableVariables.length > 0 ? (
            <div className="space-y-1">
              {Object.entries(variableInfo.variablesByType)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([type, variables]) => {
                  const isCollapsed = collapsedSections.has(type);
                  const typeColor = getPluginTypeColor(type);

                  return (
                    <div
                      key={type}
                      className="border-b border-border last:border-b-0"
                    >
                      {/* Type Header */}
                      <button
                        onClick={() => toggleSection(type)}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="p-1.5 rounded-md bg-muted/50"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${typeColor} 15%, transparent)`,
                            }}
                          >
                            {getPluginTypeIcon(type)}
                          </div>
                          <div className="text-left">
                            <h3
                              className="font-medium text-sm text-primary-readable"
                              style={{ color: typeColor }}
                            >
                              {getPluginTypeDisplayName(type)}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {variables.length} variable
                              {variables.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 border"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${typeColor} 20%, transparent)`,
                              color: typeColor,
                              borderColor: `color-mix(in srgb, ${typeColor} 30%, transparent)`,
                            }}
                          >
                            {variables.length}
                          </Badge>
                          {isCollapsed ? (
                            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Variables Grid */}
                      {!isCollapsed && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {variables.map((variable) =>
                              renderVariableBadge(variable, false)
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-center p-6">
              <div className="space-y-3">
                <div className="relative">
                  <TypeIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    No variables available
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Connect upstream nodes to see their variables here
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
