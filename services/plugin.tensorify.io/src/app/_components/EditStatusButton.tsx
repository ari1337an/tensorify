"use client";

import { useState } from "react";
import { Pencil, X, Check, Loader2 } from "lucide-react";
import { updatePluginStatus } from "@/server/actions/plugin-actions";
import { useRouter } from "next/navigation";

// Define the result type
type ActionResult = {
  success: boolean;
  error?: string | { message: string; code: string };
};

// Available statuses with their colors
const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    activeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  },
  {
    value: "beta",
    label: "Beta",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    activeColor: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  },
  {
    value: "deprecated",
    label: "Deprecated",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    activeColor: "bg-red-500/15 text-red-500 border-red-500/30",
  },
];

interface EditStatusButtonProps {
  pluginSlug: string;
  initialStatus: string;
  isOwner?: boolean;
}

export function EditStatusButton({
  pluginSlug,
  initialStatus,
  isOwner = false,
}: EditStatusButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>(initialStatus || "active");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = (await updatePluginStatus(
        pluginSlug,
        status
      )) as ActionResult;

      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Failed to update status"
        );
        return;
      }

      setIsEditing(false);
      router.refresh(); // Refresh the page to show updated status
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStatus(initialStatus || "active"); // Reset to initial status
    setIsEditing(false);
    setError(null);
  };

  // Find the status object for the current status
  const currentStatus =
    STATUS_OPTIONS.find(
      (option) => option.value === (initialStatus || "active")
    ) || STATUS_OPTIONS[0];

  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 relative">
      {isOwner && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground
                     hover:bg-secondary/50 rounded-md transition-colors"
          aria-label="Edit status"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <dt className="text-sm text-muted-foreground mb-3">Status</dt>

      <dd>
        {isEditing ? (
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4">
            <div className="flex flex-col space-y-2 mb-4">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={`p-2.5 rounded-md border transition-all duration-200 flex items-center justify-center
                    ${
                      status === option.value
                        ? `${option.activeColor} border-transparent shadow-sm`
                        : `${option.color} hover:shadow-sm`
                    }`}
                >
                  {status === option.value && (
                    <Check className="h-4 w-4 mr-1.5 opacity-90" />
                  )}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            {error && <p className="text-xs text-destructive mb-3">{error}</p>}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground 
                          px-3 py-1.5 rounded-md text-sm font-medium hover:bg-secondary/80
                          transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 
                          rounded-md text-sm font-medium hover:bg-primary/90 transition-colors 
                          disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <span
              className={`px-2.5 py-1 rounded-md text-sm font-medium ${currentStatus.color}`}
            >
              {currentStatus.label}
            </span>
          </div>
        )}
      </dd>
    </div>
  );
}
