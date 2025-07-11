"use client";

import { ProcessingStatus } from "@/server/models/plugin";
import { StatusBadge } from "./ui/status-badge";
import { LivePluginStatus } from "./LivePluginStatus";

interface PluginStatusIndicatorProps {
  processingStatus: ProcessingStatus;
}

export function PluginStatusIndicator({
  processingStatus,
}: PluginStatusIndicatorProps) {
  // For published plugins, just render the static badge
  if (processingStatus === "published") {
    return <StatusBadge status="published" />;
  }

  // For other statuses, use the live component
  return <LivePluginStatus processingStatus={processingStatus} />;
}
