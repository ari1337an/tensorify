"use client";

import { ProcessingStatus } from "@/server/models/plugin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AutoRefreshStatusProps {
  processingStatus: ProcessingStatus;
}

export function AutoRefreshStatus({
  processingStatus,
}: AutoRefreshStatusProps) {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    // Only refresh if status is queued or processing
    if (processingStatus === "queued" || processingStatus === "processing") {
      timeoutId = setTimeout(() => {
        router.refresh();
      }, 5000); // Refresh every 5 seconds
    }

    // Clean up timeout on unmount or when status changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [processingStatus, router]);

  // This component doesn't render anything visible
  return null;
}
