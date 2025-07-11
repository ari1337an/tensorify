"use client";

import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { ProcessingStatus } from "@/server/models/plugin";

interface PluginProcessingBannerProps {
  pluginId: string;
  processingStatus: ProcessingStatus;
  processingTitle: string | null;
  processingMessage: string | null;
}

export function PluginProcessingBanner({
  processingStatus,
  processingTitle,
  processingMessage,
}: PluginProcessingBannerProps) {
  const currentStatus = processingStatus;

  if (currentStatus === "published") {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground mb-1">
            {processingTitle || "Plugin published!"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {processingMessage || "Plugin published successfully!"}
          </p>
        </div>
      </div>
    );
  } else if (currentStatus === "failed") {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
        <div className="flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h3 className="font-extrabold text-foreground mb-1 text-red-500 ">
            {processingTitle || "Publication failed"}
          </h3>
          <p className="text-red-500 text-sm">
            {processingMessage || "Please try again later."}
          </p>
        </div>
      </div>
    );
  } else if (currentStatus === "processing") {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Loader2 className="h-5 w-5 text-yellow-500 mt-0.5 animate-spin" />
        <div>
          <h3 className="font-medium text-foreground mb-1">
            {processingTitle || "Processing plugin"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {processingMessage || "This plugin is currently being processed."}
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className=" border border-blue-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Clock className="h-5 w-5 text-white mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground mb-1">
            {processingTitle || "Plugin is queued"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {processingMessage ||
              "This plugin is currently queued for processing. You'll be able to install it once it's published."}
          </p>
        </div>
      </div>
    );
  }
}
