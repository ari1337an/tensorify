"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { retryPluginPublication } from "@/server/actions/plugin-actions";
import { toast } from "sonner";

interface RetryPublishButtonProps {
  slug: string;
  githubUrl: string;
}

export function RetryPublishButton({
  slug,
  githubUrl,
}: RetryPublishButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await retryPluginPublication(slug, githubUrl);

      if (!result.success) {
        toast.error("Failed to retry publication", {
          description: result.error,
        });
        return;
      }

      toast.success("Publication retry started", {
        description: "Your plugin is being processed again.",
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      toast.error("Failed to retry publication", {
        description: "An unexpected error occurred. Please try again later.",
      });
      console.error("Failed to retry plugin publication:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button
      onClick={handleRetry}
      disabled={isRetrying}
      variant="secondary"
      size="sm"
    >
      {isRetrying ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Retrying...
        </>
      ) : (
        "Retry Publication"
      )}
    </Button>
  );
}
