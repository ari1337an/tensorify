"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { ProcessingStatus } from "@/server/models/plugin";
import { cn } from "@/lib/utils";

const statusConfig = {
  queued: {
    icon: Clock,
    color: "text-muted-foreground",
    label: "Queued",
  },
  processing: {
    icon: LoadingCircle,
    color: "text-primary",
    label: "Processing",
  },
  published: {
    icon: CheckCircle,
    color: "text-green-500",
    label: "Published",
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-500 bg-red-500/10 border-red-500/20 border rounded-sm px-3 py-1",
    label: "Failed",
  },
} as const;

function LoadingCircle({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface StatusBadgeProps {
  status: ProcessingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status || "queued"];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        className,
        config.color
      )}
      data-testid={`plugin-status-badge-${status}`}
    >
      <Icon className={cn("h-4 w-4")} />
      <span className={cn("text-sm font-medium")}>{config.label}</span>
    </div>
  );
}
