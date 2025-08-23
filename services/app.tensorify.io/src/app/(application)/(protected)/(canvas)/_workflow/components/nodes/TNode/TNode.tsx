import { type NodeProps } from "@xyflow/react";
import { ReactNode, useRef, useState, useEffect, useCallback } from "react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Switch } from "@/app/_components/ui/switch";
import { Slider } from "@/app/_components/ui/slider";
import { Separator } from "@/app/_components/ui/separator";
import {
  SettingsIcon,
  CodeIcon,
  TypeIcon,
  InfoIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { toast } from "sonner";
import useWorkflowStore, {
  addRouteLevel,
  type WorkflowNode,
  type VisualConfig,
  NodeMode,
} from "../../../store/workflowStore";
import { PluginSettingsSection } from "./PluginSettingsSection";
import { CustomCodeSettings } from "./CustomCodeSettings";
import { ClassNodeSettings } from "./ClassNodeSettings";
import { ConstantsNodeSettings } from "./ConstantsNodeSettings";
import useAppStore from "@/app/_store/store";
import { useUIEngine } from "../../../engine/ui-engine";
import { VariablesTab } from "./VariablesTab";

type TNodeProps = NodeProps<WorkflowNode> & {
  children: ReactNode;
};

export default function TNode({
  children,
  selected,
  data,
  id,
  type,
}: TNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editingLabel, setEditingLabel] = useState(data.label || id);
  const nodeRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const setRoute = useWorkflowStore((state) => state.setRoute);
  const currentRoute = useWorkflowStore((state) => state.currentRoute);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const nodeSettingsOpenById = useWorkflowStore(
    (state) => state.nodeSettingsOpenById
  );
  const openDialog = useWorkflowStore((state) => state.openNodeSettingsDialog);
  const closeDialog = useWorkflowStore(
    (state) => state.closeNodeSettingsDialog
  );
  const updatePluginManifest = useAppStore(
    (state) => state.updatePluginManifest
  );
  const savePluginManifest = useAppStore((state) => state.savePluginManifest);
  const pluginManifests = useAppStore((state) => state.pluginManifests);
  const currentWorkflow = useAppStore((state) => state.currentWorkflow);
  const registerRenderedNode = useWorkflowStore(
    (state) => state.registerRenderedNode
  );
  const unregisterRenderedNode = useWorkflowStore(
    (state) => state.unregisterRenderedNode
  );
  const setLastExportErrors = useWorkflowStore(
    (state) => state.setLastExportErrors
  );
  const setLastExportArtifactErrors = useWorkflowStore(
    (state) => state.setLastExportArtifactErrors
  );
  const openExportDialog = useWorkflowStore((state) => state.openExportDialog);
  const engine = useUIEngine();
  const nodeValidation = engine.nodes[id];
  const isFlashingError = Boolean(nodeValidation?.isTransientError);
  const hasExportError = Boolean(nodeValidation?.hasExportError);

  // Shape validation for this node
  const hasShapeValidationErrors = React.useMemo(() => {
    if (!engine?.nodeShapes?.[id] || !engine?.connectionShapeValidations) {
      return false;
    }

    // Check if this node has any incoming connections with shape validation errors
    const nodeEdges = edges.filter((edge) => edge.target === id);
    return nodeEdges.some((edge) => {
      const validationKey = `${edge.source}:${edge.sourceHandle}->${edge.target}:${edge.targetHandle}`;
      const validation = engine.connectionShapeValidations[validationKey];
      return validation && !validation.isValid;
    });
  }, [engine, id, edges]);
  const exportErrorMessage = nodeValidation?.exportErrorMessage;

  // Force re-render when plugin manifests change (for reactive form fields)
  const [, forceUpdate] = useState({});
  useEffect(() => {
    // console.log(`🔄 Plugin manifests updated, forcing re-render for node ${id}`);
    forceUpdate({});
  }, [pluginManifests, id]);

  // Debounced save function to prevent excessive API calls
  const debouncedSave = useCallback(
    (pluginId: string, manifest: Record<string, unknown>) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Show pending message immediately
      toast.loading("Saving preferences...", {
        id: `save-${pluginId}`,
        duration: 1200, // Will be dismissed when success/error shows
      });

      // Set new timeout for 1 second
      saveTimeoutRef.current = setTimeout(() => {
        console.log(`💾 Debounced save triggered for plugin ${pluginId}`);
        savePluginManifest(pluginId, manifest, currentWorkflow?.id)
          .then(() => {
            toast.dismiss(`save-${pluginId}`);
            toast.success("Preferences saved successfully!");
            console.log(
              `✅ Successfully saved manifest for plugin ${pluginId}`
            );
          })
          .catch((error) => {
            console.error("Failed to save plugin manifest:", error);
            toast.dismiss(`save-${pluginId}`);
            toast.error("Failed to save preferences. Please try again.");
          });
      }, 500); // 500ms debounce
    },
    [savePluginManifest, currentWorkflow?.id]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Register this node as rendered so global dialog logic can detect visibility
  useEffect(() => {
    registerRenderedNode(id);
    return () => {
      unregisterRenderedNode(id);
    };
  }, [id, registerRenderedNode, unregisterRenderedNode]);

  // Handle plugin settings change
  const handlePluginSettingsChange = (key: string, value: any) => {
    const newSettings = {
      ...(data.pluginSettings || {}),
      [key]: value,
    };
    updateNodeData(id, { pluginSettings: newSettings });
  };

  // Handle visual configuration changes - updates plugin manifest globally
  const handleVisualConfigChange = (
    section: keyof VisualConfig | "",
    key: string,
    value: any
  ) => {
    console.log(
      `🎨 Updating ${section ? `${section}.${key}` : key} = ${value}`
    );

    // Use reactive plugin manifests
    const pluginId = data.pluginId || type || id;

    // Find the plugin manifest for this node
    const pluginManifest = pluginManifests.find(
      (manifest) =>
        manifest.slug === pluginId ||
        manifest.id === pluginId ||
        manifest.slug === type
    );

    if (!pluginManifest) {
      console.warn(`No plugin manifest found for: ${pluginId}`);
      // Fallback: update only the current node
      const currentVisual = data.visualConfig || {};
      const updatedVisual =
        section === ""
          ? { ...currentVisual, [key]: value }
          : {
              ...currentVisual,
              [section]: {
                ...(currentVisual[section] as Record<string, any>),
                [key]: value,
              },
            };
      updateNodeData(id, { visualConfig: updatedVisual });
      return;
    }

    // Update the plugin manifest's visual configuration
    const currentManifest = (pluginManifest.manifest as any) || {};
    const frontendConfigs = currentManifest.frontendConfigs || {};
    const currentVisual = (frontendConfigs.visual ||
      currentManifest.visual ||
      {}) as Record<string, any>;

    let updatedVisual: any;
    if (section === "") {
      // Direct property on visual config (like containerType)
      updatedVisual = {
        ...currentVisual,
        [key]: value,
      };
    } else {
      // Nested property (like size.width, styling.borderRadius, etc.)
      updatedVisual = {
        ...currentVisual,
        [section]: {
          ...(currentVisual[section] || {}),
          [key]: value,
        },
      };
    }

    // Update the plugin manifest in the app store
    const updatedManifest = {
      ...currentManifest,
      frontendConfigs: {
        ...frontendConfigs,
        visual: updatedVisual,
      },
      // keep top-level visual in sync for backward compatibility
      visual: updatedVisual,
    };

    updatePluginManifest(pluginManifest.slug, {
      manifest: updatedManifest,
    });

    // Save the updated manifest to the database (debounced)
    debouncedSave(pluginManifest.id, updatedManifest);

    // Clear visualConfig from all nodes of this plugin type to use the updated manifest
    const nodesToUpdate = nodes.filter((node) => {
      const nodePluginId = node.data.pluginId || node.type || node.id;
      return (
        nodePluginId === pluginManifest.slug ||
        nodePluginId === pluginManifest.id ||
        node.type === pluginManifest.slug
      );
    });

    // Update all matching nodes to clear their individual visualConfig
    nodesToUpdate.forEach((node) => {
      updateNodeData(node.id, {
        visualConfig: undefined, // Clear individual config to use manifest
      });
    });

    console.log(
      `🎨 Updated visual config for plugin "${pluginManifest.slug}" affecting ${nodesToUpdate.length} nodes`
    );
  };

  // Get visual config value with fallbacks - now reads from plugin manifest (REACTIVE)
  const getVisualValue = (
    section: keyof VisualConfig | "",
    key: string,
    defaultValue: any = ""
  ) => {
    const pluginId = data.pluginId || type || id;

    // Find the plugin manifest for this node (using reactive pluginManifests)
    const pluginManifest = pluginManifests.find(
      (manifest) =>
        manifest.slug === pluginId ||
        manifest.id === pluginId ||
        manifest.slug === type
    );

    if (!pluginManifest) {
      return defaultValue;
    }

    // Get the visual config from the manifest (support contracts frontendConfigs)
    const fc = (pluginManifest?.manifest as any)?.frontendConfigs;
    const manifestVisual = (fc?.visual ||
      (pluginManifest?.manifest as any)?.visual) as any;

    let result;
    if (section === "") {
      // Direct property on VisualConfig (like containerType)
      result = manifestVisual?.[key] ?? defaultValue;
    } else {
      // Nested property (like size.width, styling.borderRadius, etc.)
      result = manifestVisual?.[section]?.[key] ?? defaultValue;
    }

    // Debug log only for issues or when using saved values
    if (!pluginManifest || !manifestVisual) {
      // console.log(`📖 No visual config found for ${pluginId}, using default`);
    } else if (result !== defaultValue) {
      // console.log(
      //   `📖 Using saved config: ${section || "root"}.${key} = ${result}`
      // );
    }

    return result;
  };

  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  const handleSettingsDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // console.log("🔥 TNode handleSettingsDoubleClick fired!", {
    //   id,
    //   selected,
    //   type,
    // });
    openDialog(id);
  };

  const handleNestedClick = () => {
    console.log("🔥 TNode handleNestedClick fired!", {
      id,
      currentRoute,
      nodeType: type,
    });

    // For sequence nodes, use sequence-{id} format for navigation
    const isSequenceNode = type?.includes("sequence");
    const routeSegment = isSequenceNode ? `sequence-${id}` : id;

    setRoute(addRouteLevel(currentRoute, routeSegment));
  };

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLabel(true);
    setEditingLabel(data.label || id);
  };

  const handleLabelSave = () => {
    const newLabel = editingLabel.trim() || id;
    updateNodeData(id, { label: newLabel });
    setIsEditingLabel(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLabelSave();
    } else if (e.key === "Escape") {
      setIsEditingLabel(false);
      setEditingLabel(data.label || id);
    }
  };

  const handleExportAgain = async () => {
    try {
      // Clear existing error states
      setLastExportErrors({});
      setLastExportArtifactErrors({});

      // Get the correct API base URL based on environment
      const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "/api";
      const exportUrl = `${apiBaseUrl}/v1/export`;

      const response = await fetch(exportUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        toast.error(`Export failed: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();

      // Handle errors if present
      if (data.errorsByNodeId) {
        setLastExportErrors(data.errorsByNodeId);
      }
      if (data.errorsByArtifactId) {
        setLastExportArtifactErrors(data.errorsByArtifactId);
      }

      if (Object.keys(data.errorsByNodeId || {}).length === 0) {
        toast.success("Export completed successfully!");
        // Close node settings dialog and open export dialog to show results
        closeDialog(id);
        openExportDialog();
      } else {
        toast.error(
          "Export completed with errors. Check the error details above."
        );
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export workflow");
    }
  };

  // Listen for open-node-settings events to open dialog programmatically
  // Sync with store-driven dialog open state
  useEffect(() => {
    const shouldOpen = Boolean(nodeSettingsOpenById?.[id]);
    if (shouldOpen !== isOpen) {
      setIsOpen(shouldOpen);
    }
  }, [nodeSettingsOpenById, id, isOpen]);

  return (
    <>
      <div
        className="relative"
        title={
          exportErrorMessage
            ? `Export Error: ${exportErrorMessage}`
            : nodeValidation?.missingPrev || nodeValidation?.missingNext
              ? "Missing required connections"
              : undefined
        }
      >
        {selected ? (
          type === "@tensorify/core/NestedNode" ? (
            <div
              ref={nodeRef}
              onClick={handleNestedClick}
              className={
                hasShapeValidationErrors
                  ? "ring-2 ring-red-500 ring-opacity-60 rounded-md"
                  : ""
              }
            >
              {children}
            </div>
          ) : (
            <div
              ref={nodeRef}
              onDoubleClick={handleSettingsDoubleClick}
              className={
                hasShapeValidationErrors
                  ? "ring-2 ring-red-500 ring-opacity-60 rounded-md"
                  : ""
              }
            >
              {children}
            </div>
          )
        ) : hasShapeValidationErrors ? (
          <div className="ring-2 ring-red-500 ring-opacity-60 rounded-md">
            {children}
          </div>
        ) : (
          children
        )}

        {/* Export Error Badge - Positioned on top-right corner */}
        {hasExportError && exportErrorMessage && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="relative">
                    <div className="w-6 h-6 bg-destructive rounded-full border-2 border-background shadow-lg flex items-center justify-center animate-pulse cursor-help">
                      <AlertCircle className="w-3 h-3 text-destructive-foreground" />
                    </div>
                    {/* Pulsing ring effect */}
                    <div className="absolute inset-0 w-6 h-6 bg-destructive rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-sm p-4 bg-background border border-destructive/20 shadow-2xl ring-4 ring-destructive/20"
                sideOffset={12}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-destructive/10 rounded-md">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      Export Error
                    </div>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                    <div className="text-xs font-mono text-destructive leading-relaxed">
                      {exportErrorMessage}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <div className="p-1 bg-muted rounded">
                      <span className="text-xs">💡</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Double-click node to open settings and fix
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Label below the node */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[120px]">
          {isEditingLabel ? (
            <input
              ref={labelInputRef}
              type="text"
              value={editingLabel}
              onChange={(e) => setEditingLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleLabelKeyDown}
              className="text-xs text-center w-full px-1 py-0.5 bg-background border border-border rounded text-foreground focus:outline-none focus:border-primary"
              maxLength={25}
            />
          ) : (
            <div className="flex items-center justify-center gap-1">
              <p
                className="text-xs text-center text-muted-foreground cursor-pointer hover:text-foreground transition-colors truncate px-1"
                onDoubleClick={handleLabelDoubleClick}
                title={`${data.label || id} - Double-click to edit`}
              >
                {data.label || id}
              </p>
              {hasExportError && (
                <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          console.log("🔥 Dialog onOpenChange:", { open, isOpen, nodeId: id });
          setIsOpen(open);
          if (open) {
            openDialog(id);
          } else {
            closeDialog(id);
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl w-[92vw] p-6 gap-0 overflow-hidden">
          <div className="flex flex-col h-[80vh]">
            <DialogHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SettingsIcon className="h-5 w-5 text-primary-readable" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-semibold">
                    Node Settings
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Configure properties and variables for this node
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {data.label || id}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {type?.split("/").pop() || "Node"}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs
              defaultValue="settings"
              className="flex flex-col flex-1 overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4" />
                  Info
                </TabsTrigger>
                <TabsTrigger value="scope" className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" />
                  Variables
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="flex-1 overflow-auto">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">
                      Node Information
                    </CardTitle>
                    <CardDescription>
                      Basic information about this node
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Node ID - First and Immutable */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="node-id"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <span>ID</span>
                        <Badge variant="secondary" className="text-xs">
                          Immutable
                        </Badge>
                      </Label>
                      <Input
                        id="node-id"
                        type="text"
                        value={id}
                        readOnly
                        disabled
                        className="transition-colors bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>

                    {/* Label - Editable Display Name */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="label"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <span>Label</span>
                        <Badge variant="outline" className="text-xs">
                          Display Name
                        </Badge>
                      </Label>
                      <Input
                        id="label"
                        type="text"
                        value={data.label}
                        onChange={(evt) =>
                          updateNodeData(id, { label: evt.target.value })
                        }
                        placeholder="Enter display name"
                        className="transition-colors"
                      />
                    </div>

                    {/* Node Mode - Variable Provider or Workflow */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="node-mode"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <span>Node Mode</span>
                        <Badge variant="outline" className="text-xs">
                          Handle Type
                        </Badge>
                      </Label>
                      <Select
                        value={data.nodeMode || NodeMode.WORKFLOW}
                        onValueChange={(value: NodeMode) =>
                          updateNodeData(id, { nodeMode: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select node mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NodeMode.WORKFLOW}>
                            Workflow Node
                          </SelectItem>
                          <SelectItem value={NodeMode.VARIABLE_PROVIDER}>
                            Variable Provider
                          </SelectItem>
                          <SelectItem value={NodeMode.CODE_PROVIDER}>
                            Code Provider
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground">
                        <strong>Workflow:</strong> Standard prev/next handles
                        for sequential flow
                        <br />
                        <strong>Variable Provider:</strong> Multiple handles
                        named after emitted variables
                        <br />
                        <strong>Code Provider:</strong> Provides generated code
                        to other nodes via custom handles
                      </div>
                    </div>

                    <Separator />

                    {/* Visual Configuration */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          Visual Configuration
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          Appearance
                        </Badge>
                      </div>

                      {/* Container Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Container Type
                        </Label>
                        <Select
                          value={getVisualValue("", "containerType", "default")}
                          onValueChange={(value) => {
                            handleVisualConfigChange(
                              "",
                              "containerType",
                              value
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select container type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="box">Box</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="left-round">
                              Left Round
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Size Configuration */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">
                          Size & Dimensions
                        </Label>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Width</Label>
                            <Input
                              type="number"
                              value={getVisualValue("size", "width", 200)}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "size",
                                  "width",
                                  parseInt(e.target.value) || 200
                                )
                              }
                              min="50"
                              max="800"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Height</Label>
                            <Input
                              type="number"
                              value={getVisualValue("size", "height", 100)}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "size",
                                  "height",
                                  parseInt(e.target.value) || 100
                                )
                              }
                              min="50"
                              max="600"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Min Width</Label>
                            <Input
                              type="number"
                              value={getVisualValue("size", "minWidth", "")}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "size",
                                  "minWidth",
                                  parseInt(e.target.value) || undefined
                                )
                              }
                              placeholder="Auto"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Max Width</Label>
                            <Input
                              type="number"
                              value={getVisualValue("size", "maxWidth", "")}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "size",
                                  "maxWidth",
                                  parseInt(e.target.value) || undefined
                                )
                              }
                              placeholder="Auto"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Aspect Ratio</Label>
                          <Select
                            value={getVisualValue(
                              "size",
                              "aspectRatio",
                              "flexible"
                            )}
                            onValueChange={(value) =>
                              handleVisualConfigChange(
                                "size",
                                "aspectRatio",
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flexible">Flexible</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Padding Configuration */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Padding</Label>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Inner Padding</Label>
                            <Input
                              type="number"
                              value={getVisualValue("padding", "inner", 16)}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "padding",
                                  "inner",
                                  parseInt(e.target.value) || 16
                                )
                              }
                              min="0"
                              max="50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Outer Padding</Label>
                            <Input
                              type="number"
                              value={getVisualValue("padding", "outer", 8)}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "padding",
                                  "outer",
                                  parseInt(e.target.value) || 8
                                )
                              }
                              min="0"
                              max="30"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={getVisualValue(
                              "padding",
                              "extraPadding",
                              false
                            )}
                            onCheckedChange={(checked) =>
                              handleVisualConfigChange(
                                "padding",
                                "extraPadding",
                                checked
                              )
                            }
                          />
                          <Label className="text-xs">Extra Padding</Label>
                        </div>
                      </div>

                      {/* Styling Configuration */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Styling</Label>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Border Radius</Label>
                            <Input
                              type="number"
                              value={getVisualValue(
                                "styling",
                                "borderRadius",
                                8
                              )}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "styling",
                                  "borderRadius",
                                  parseInt(e.target.value) || 8
                                )
                              }
                              min="0"
                              max="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Border Width</Label>
                            <Input
                              type="number"
                              value={getVisualValue(
                                "styling",
                                "borderWidth",
                                2
                              )}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "styling",
                                  "borderWidth",
                                  parseInt(e.target.value) || 2
                                )
                              }
                              min="0"
                              max="10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Shadow Level</Label>
                          <div className="px-3">
                            <Slider
                              value={[
                                getVisualValue("styling", "shadowLevel", 1),
                              ]}
                              onValueChange={([value]) =>
                                handleVisualConfigChange(
                                  "styling",
                                  "shadowLevel",
                                  value
                                )
                              }
                              max={3}
                              min={0}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>None</span>
                            <span>Light</span>
                            <span>Medium</span>
                            <span>Strong</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Theme</Label>
                          <Select
                            value={getVisualValue("styling", "theme", "auto")}
                            onValueChange={(value) =>
                              handleVisualConfigChange(
                                "styling",
                                "theme",
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Border Color</Label>
                            <Input
                              type="color"
                              value={getVisualValue(
                                "styling",
                                "borderColor",
                                "#e5e7eb"
                              )}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "styling",
                                  "borderColor",
                                  e.target.value
                                )
                              }
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Background Color</Label>
                            <Input
                              type="color"
                              value={getVisualValue(
                                "styling",
                                "backgroundColor",
                                "#ffffff"
                              )}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "styling",
                                  "backgroundColor",
                                  e.target.value
                                )
                              }
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Icons Configuration */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Icons</Label>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Primary Icon Type</Label>
                            <Select
                              value={getVisualValue(
                                "icons",
                                "primaryType",
                                "lucide"
                              )}
                              onValueChange={(value) =>
                                handleVisualConfigChange(
                                  "icons",
                                  "primaryType",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lucide">Lucide</SelectItem>
                                <SelectItem value="fontawesome">
                                  FontAwesome
                                </SelectItem>
                                <SelectItem value="svg">Custom SVG</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">
                              Primary Icon Value
                            </Label>
                            <Input
                              type="text"
                              value={getVisualValue(
                                "icons",
                                "primaryValue",
                                "box"
                              )}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "icons",
                                  "primaryValue",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., brain, cog, fa-solid fa-gear"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Icon Size</Label>
                            <Select
                              value={getVisualValue(
                                "icons",
                                "iconSize",
                                "medium"
                              )}
                              onValueChange={(value) =>
                                handleVisualConfigChange(
                                  "icons",
                                  "iconSize",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={getVisualValue(
                                "icons",
                                "showIconBackground",
                                true
                              )}
                              onCheckedChange={(checked) =>
                                handleVisualConfigChange(
                                  "icons",
                                  "showIconBackground",
                                  checked
                                )
                              }
                            />
                            <Label className="text-xs">
                              Show Icon Background
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Labels Configuration */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Labels</Label>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Title</Label>
                            <Input
                              type="text"
                              value={getVisualValue(
                                "labels",
                                "title",
                                data.label || "Node"
                              )}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "labels",
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Node title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Title Description</Label>
                            <Input
                              type="text"
                              value={getVisualValue(
                                "labels",
                                "titleDescription",
                                ""
                              )}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "labels",
                                  "titleDescription",
                                  e.target.value
                                )
                              }
                              placeholder="Optional description"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">
                              Dynamic Label Template
                            </Label>
                            <Input
                              type="text"
                              value={getVisualValue(
                                "labels",
                                "dynamicLabelTemplate",
                                ""
                              )}
                              onChange={(e) =>
                                handleVisualConfigChange(
                                  "labels",
                                  "dynamicLabelTemplate",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Processing {dataType} with {modelName}"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Label Position</Label>
                            <Select
                              value={getVisualValue(
                                "labels",
                                "labelPosition",
                                "top"
                              )}
                              onValueChange={(value) =>
                                handleVisualConfigChange(
                                  "labels",
                                  "labelPosition",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                                <SelectItem value="overlay">Overlay</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={getVisualValue(
                                "labels",
                                "showLabels",
                                true
                              )}
                              onCheckedChange={(checked) =>
                                handleVisualConfigChange(
                                  "labels",
                                  "showLabels",
                                  checked
                                )
                              }
                            />
                            <Label className="text-xs">Show Labels</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="flex-1 overflow-auto">
                {/* Export Error Alert */}
                {hasExportError && exportErrorMessage && (
                  <Card className="mb-6 border-destructive/50 bg-destructive/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm text-destructive">
                            Export Error
                          </CardTitle>
                          <CardDescription className="text-destructive/80">
                            This node caused the following problem in code
                            export
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="bg-muted/50 rounded-lg p-3 border border-destructive/20">
                        <code className="text-xs text-destructive font-mono break-all">
                          {exportErrorMessage}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportAgain}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Export Again
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Custom Code Settings for CustomCodeNode */}
                {type === "@tensorify/core/CustomCodeNode" ? (
                  <CustomCodeSettings
                    nodeId={id}
                    onSettingsChange={(newData) => {
                      updateNodeData(id, newData);
                    }}
                  />
                ) : type === "@tensorify/core/ClassNode" ? (
                  /* Class Node Settings for ClassNode */
                  <ClassNodeSettings
                    nodeId={id}
                    onSettingsChange={(newData) => {
                      updateNodeData(id, newData);
                    }}
                  />
                ) : type === "@tensorify/core/ConstantsNode" ? (
                  /* Constants Node Settings for ConstantsNode */
                  <ConstantsNodeSettings
                    nodeId={id}
                    onSettingsChange={(newData) => {
                      updateNodeData(id, newData);
                    }}
                  />
                ) : (
                  /* Plugin Settings Section for other nodes */
                  <PluginSettingsSection
                    nodeId={id}
                    onSettingsChange={handlePluginSettingsChange}
                  />
                )}
              </TabsContent>

              <TabsContent value="scope" className="flex-1 overflow-auto">
                <VariablesTab
                  node={{
                    id,
                    data,
                    type: type || "",
                    selected: selected || false,
                    route: "",
                    version: "1.0.0",
                    position: { x: 0, y: 0 },
                  }}
                  nodeId={id}
                />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
