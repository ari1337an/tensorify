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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/_components/ui/tabs";
import { InfoIcon, SettingsIcon, TypeIcon } from "lucide-react";
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

export default function GlobalNodeSettingsDialog() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const globalNodeId = useWorkflowStore((s) => s.globalNodeSettingsNodeId);
  const closeGlobal = useWorkflowStore((s) => s.closeGlobalNodeSettingsDialog);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const node = React.useMemo(
    () => nodes.find((n) => n.id === globalNodeId) || null,
    [nodes, globalNodeId]
  );

  const onOpenChange = (open: boolean) => {
    if (!open) closeGlobal();
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
              <PluginSettingsSection
                nodeId={node.id}
                onSettingsChange={(key, value) => {
                  const current = (node.data as any).pluginSettings || {};
                  const next = { ...current, [key]: value };
                  updateNodeData(node.id, { pluginSettings: next });
                }}
              />
            </TabsContent>

            <TabsContent value="scope" className="flex-1">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Scope Variables</CardTitle>
                  <CardDescription>
                    Variables available in the current execution context
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 text-center">
                    <div className="space-y-2">
                      <TypeIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        No variables available in current scope
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Variables will appear here during execution
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

