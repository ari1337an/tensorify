"use client";

import { useState, useEffect } from "react";
import { Pencil, X, Check, Loader2, ChevronDown } from "lucide-react";
import { updatePluginTensorifyVersion } from "@/server/actions/plugin-actions";
import {
  getTensorifyVersions,
  TensorifyVersion,
} from "@/server/actions/tensorify-actions";
import { useRouter } from "next/navigation";

// Define the result type
type ActionResult = {
  success: boolean;
  error?: string | { message: string; code: string };
};

interface EditTensorifyVersionButtonProps {
  pluginSlug: string;
  initialVersion: string;
  isOwner?: boolean;
}

export function EditTensorifyVersionButton({
  pluginSlug,
  initialVersion,
  isOwner = false,
}: EditTensorifyVersionButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [version, setVersion] = useState<string>(initialVersion);
  const [availableVersions, setAvailableVersions] = useState<
    TensorifyVersion[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch available Tensorify versions
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      getTensorifyVersions()
        .then((versions) => {
          setAvailableVersions(versions);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch Tensorify versions:", err);
          setError("Failed to load available versions");
          setIsLoading(false);
        });
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = (await updatePluginTensorifyVersion(
        pluginSlug,
        version
      )) as ActionResult;

      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Failed to update Tensorify version"
        );
        return;
      }

      setIsEditing(false);
      router.refresh(); // Refresh the page to show updated version
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setVersion(initialVersion); // Reset to initial version
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 relative">
      {isOwner && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground
                     hover:bg-secondary/50 rounded-md transition-colors"
          aria-label="Edit Tensorify version"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <dt className="text-sm text-muted-foreground mb-3">
        SDK Version
      </dt>

      <dd>
        {isEditing ? (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading versions...
                </span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-transparent
                            text-sm pr-10 focus-visible:outline-none focus-visible:ring-1 
                            focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50
                            appearance-none"
                  disabled={isSubmitting}
                >
                  {availableVersions.map((v) => (
                    <option key={v.id} value={v.version}>
                      {v.version}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            )}

            {error && (
              <p className="text-xs text-destructive mt-1 mb-2">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={handleSave}
                disabled={isSubmitting || isLoading}
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

              <button
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
                className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground 
                          px-3 py-1.5 rounded-md text-sm font-medium hover:bg-secondary/80
                          transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-md text-sm font-medium">
              {initialVersion || "Not specified"}
            </span>
          </div>
        )}
      </dd>
    </div>
  );
}
