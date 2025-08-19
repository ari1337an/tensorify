"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/_components/ui/tabs";
import {
  InfoIcon,
  SettingsIcon,
  TypeIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import useWorkflowStore from "../store/workflowStore";
import useAppStore from "@/app/_store/store";
import { PluginSettingsSection } from "./nodes/TNode/PluginSettingsSection";
import { useUIEngine } from "../engine/ui-engine";
import { toast } from "sonner";
import { VariablesTab } from "./nodes/TNode/VariablesTab";

export default function GlobalNodeSettingsDialog() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const globalNodeId = useWorkflowStore((s) => s.globalNodeSettingsNodeId);
  const closeGlobal = useWorkflowStore((s) => s.closeGlobalNodeSettingsDialog);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const setLastExportErrors = useWorkflowStore((s) => s.setLastExportErrors);
  const setLastExportArtifactErrors = useWorkflowStore(
    (s) => s.setLastExportArtifactErrors
  );
  const openExportDialog = useWorkflowStore((s) => s.openExportDialog);
  const engine = useUIEngine();

  const node = React.useMemo(
    () => nodes.find((n) => n.id === globalNodeId) || null,
    [nodes, globalNodeId]
  );

  // Get error information from UI engine
  const nodeValidation = globalNodeId ? engine.nodes[globalNodeId] : null;
  const hasExportError = Boolean(nodeValidation?.hasExportError);
  const exportErrorMessage = nodeValidation?.exportErrorMessage;

  const onOpenChange = (open: boolean) => {
    if (!open) closeGlobal();
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
        closeGlobal();
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

  if (!globalNodeId || !node) return null;

  return (
    <Dialog open={Boolean(globalNodeId)} onOpenChange={onOpenChange}>
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
                {node.data.label || node.id}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {node.type?.split("/").pop() || "Node"}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs
            defaultValue="settings"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" /> Settings
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4" /> Info
              </TabsTrigger>
              <TabsTrigger value="scope" className="flex items-center gap-2">
                <TypeIcon className="h-4 w-4" /> Variables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="flex-1 overflow-auto">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Node Information</CardTitle>
                  <CardDescription>
                    Basic information about this node
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                      value={node.id}
                      readOnly
                      disabled
                      className="transition-colors bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>

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
                      value={node.data.label}
                      onChange={(evt) =>
                        updateNodeData(node.id, { label: evt.target.value })
                      }
                      placeholder="Enter display name"
                      className="transition-colors"
                    />
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
                          This node caused the following problem in code export
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

              <PluginSettingsSection
                nodeId={node.id}
                onSettingsChange={(key, value) => {
                  const current = (node.data as any).pluginSettings || {};
                  const next = { ...current, [key]: value };
                  updateNodeData(node.id, { pluginSettings: next });
                }}
              />
            </TabsContent>

            <TabsContent value="scope" className="flex-1 overflow-auto">
              {node && <VariablesTab node={node} nodeId={node.id} />}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
