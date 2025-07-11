"use client";

import { useState } from "react";
import { Pencil, X, Check, Loader2 } from "lucide-react";
import { updatePluginDescription } from "@/server/actions/plugin-actions";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";

interface EditDescriptionButtonProps {
  pluginSlug: string;
  initialDescription: string;
  isOwner?: boolean;
}

// Define types for the API response
interface ErrorObject {
  code: string;
  message: string;
}

interface UpdateDescriptionResult {
  success: boolean;
  error?: string | ErrorObject;
}

export function EditDescriptionButton({
  pluginSlug,
  initialDescription,
  isOwner = false,
}: EditDescriptionButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState<string>(initialDescription);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Properly type the result
      const result = (await updatePluginDescription(
        pluginSlug,
        description
      )) as UpdateDescriptionResult;

      if (!result.success) {
        // Handle the error more carefully with proper type checking
        if (typeof result.error === "string") {
          setError(result.error);
        } else if (result.error && typeof result.error === "object") {
          // Now TypeScript knows result.error is an object
          setError(result.error.message || "Failed to update description");
        } else {
          setError("Failed to update description");
        }
        return;
      }

      setIsEditing(false);
      router.refresh(); // Refresh the page to show updated description
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDescription(initialDescription); // Reset to initial description
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
          aria-label="Edit description"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <dt className="text-sm text-muted-foreground mb-3">Description</dt>

      <dd>
        {isEditing ? (
          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter plugin description..."
              className="w-full min-h-[100px] mb-1"
            />

            {error && (
              <p className="text-xs text-destructive mt-1 mb-2">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 mt-2">
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
            </div>
          </div>
        ) : (
          <p
            className="text-sm leading-relaxed text-foreground"
            data-testid="plugin-description"
          >
            {initialDescription || (
              <span className="text-muted-foreground">
                {isOwner
                  ? "No description added yet. Click the edit button to add a description."
                  : "No description available."}
              </span>
            )}
          </p>
        )}
      </dd>
    </div>
  );
}
