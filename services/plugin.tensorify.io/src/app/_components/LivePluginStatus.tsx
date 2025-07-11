"use client";

import { ProcessingStatus } from "@/server/models/plugin";
import { StatusBadge } from "./ui/status-badge";

interface LivePluginStatusProps {
  processingStatus: ProcessingStatus;
}

export function LivePluginStatus({ processingStatus }: LivePluginStatusProps) {
  const currentStatus = processingStatus;

  return <StatusBadge status={currentStatus} data-testid="plugin-status-badge" />;
}
