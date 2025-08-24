"use client";

import React, { useState } from "react";
import { type NodeProps } from "@xyflow/react";
import { AlertTriangle, Download, ExternalLink, Package } from "lucide-react";
import TNode from "./TNode/TNode";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";

import CustomHandle from "./handles/CustomHandle";
import { type WorkflowNode } from "../../store/workflowStore";
import {
  HandleViewType,
  HandlePosition,
  EdgeType,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";
import { toast } from "sonner";
import { postWorkflowPlugin } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

interface MissingPluginNodeProps extends NodeProps<WorkflowNode> {
  missingPluginSlug?: string;
}

export default function MissingPluginNode(props: MissingPluginNodeProps) {
  const { selected, id, data, missingPluginSlug } = props;
  const [isInstalling, setIsInstalling] = useState(false);

  const { currentWorkflow, triggerPluginRefresh, fetchPluginManifests } =
    useStore();

  // Extract plugin info from slug or node data
  const pluginSlug = (missingPluginSlug ||
    data.pluginId ||
    props.type ||
    "unknown-plugin") as string;
  const pluginName = pluginSlug.includes("/")
    ? pluginSlug.split("/").pop()?.split(":")[0] || pluginSlug
    : pluginSlug;

  // Define the output handle for missing plugin node
  const outputHandle: OutputHandle = {
    id: "next",
    label: "Next",
    position: HandlePosition.RIGHT,
    viewType: HandleViewType.VERTICAL_BOX,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
  };

  const handleInstallPlugin = async () => {
    if (!currentWorkflow?.id) {
      toast.error("No workflow selected. Please select a workflow first.");
      return;
    }

    if (!pluginSlug || pluginSlug === "unknown-plugin") {
      toast.error("Cannot install plugin: invalid plugin slug");
      return;
    }

    setIsInstalling(true);

    try {
      const response = await postWorkflowPlugin({
        params: { workflowId: currentWorkflow.id },
        body: { slug: pluginSlug },
      });

      if (response.status === 201) {
        toast.success(`Plugin ${pluginName} installed successfully!`);

        // Trigger plugin refresh to reload manifests
        triggerPluginRefresh();

        // Force fetch plugin manifests to update nodeTypes immediately
        await fetchPluginManifests(currentWorkflow.id);
      } else {
        toast.error(response.body.message || "Failed to install plugin");
      }
    } catch (error) {
      console.error("Error installing plugin:", error);
      toast.error("An unexpected error occurred while installing the plugin.");
    } finally {
      setIsInstalling(false);
    }
  };

  const openPluginRegistry = () => {
    // Open plugin registry in a new tab
    const isDevelopment = process.env.NODE_ENV === "development";
    const baseUrl = isDevelopment
      ? "http://localhost:3004"
      : "https://plugins.tensorify.io";

    window.open(`${baseUrl}`, "_blank", "noopener,noreferrer");
  };

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-orange-50 dark:bg-orange-950 border-2 border-orange-200 dark:border-orange-800
          rounded-lg shadow-sm
          min-w-[200px] max-w-[240px] min-h-[120px]
          transition-all duration-200
          ${selected ? "shadow-lg shadow-orange-500/20" : ""}
        `}
      >
        {/* Warning indicator */}
        <div className="absolute -top-2 -right-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-orange-500 text-white rounded-full p-1.5 shadow-md">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" align="center" className="max-w-xs">
                <div className="text-xs space-y-1">
                  <p className="font-medium">Plugin Missing</p>
                  <p>This node requires a plugin that is not installed.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-center space-x-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded-md">
              <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-orange-800 dark:text-orange-200">
                Missing Plugin
              </p>
            </div>
          </div>

          {/* Plugin info */}
          <div className="text-center space-y-1">
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Uses{" "}
              <Badge variant="outline" className="mx-1 text-xs">
                {pluginName}
              </Badge>{" "}
              plugin
            </p>
            <p className="text-orange-600 dark:text-orange-400 font-mono text-xs break-all truncate">
              {pluginSlug}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col space-y-1.5">
            <Button
              onClick={handleInstallPlugin}
              disabled={isInstalling || pluginSlug === "unknown-plugin"}
              size="sm"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs py-1.5"
            >
              {isInstalling ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-1.5" />
                  Install
                </>
              )}
            </Button>

            <Button
              onClick={openPluginRegistry}
              variant="outline"
              size="sm"
              className="w-full text-xs py-1 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Browse
            </Button>
          </div>
        </div>

        <CustomHandle
          handle={outputHandle}
          type="source"
          nodeId={id}
          index={0}
          totalHandles={1}
        />
      </div>
    </TNode>
  );
}
