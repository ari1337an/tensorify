"use client";

import { useState, useEffect } from "react";
import { TagInput } from "./ui/TagInput";
import {
  Pencil,
  X,
  Check,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { updatePluginTags } from "@/server/actions/plugin-actions";
import { useRouter } from "next/navigation";

// Define the result type
type ActionResult = {
  success: boolean;
  error?: string | { message: string; code: string };
};

interface EditTagsButtonProps {
  pluginSlug: string;
  initialTags: string[];
  isOwner?: boolean;
}

export function EditTagsButton({
  pluginSlug,
  initialTags,
  isOwner = false,
}: EditTagsButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [error, setError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [tagWarning, setTagWarning] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  // Form validation
  useEffect(() => {
    const validateTags = () => {
      if (tags.length < 4) {
        setTagsError(
          `Minimum 4 tags required (${tags.length}/4). Press Enter or Return to add tags.`
        );
        return false;
      }

      if (tags.length > 10) {
        setTagsError(`Maximum 10 tags allowed (${tags.length}/10).`);
        return false;
      }

      setTagsError(null);
      return true;
    };

    setIsFormValid(validateTags());
  }, [tags]);

  const handleTagsChange = (newTags: string[]) => {
    // Clear any previous warnings
    setTagWarning(null);

    // Set the tags
    setTags(newTags);

    // Validate tags count
    if (newTags.length < 4) {
      setTagsError(
        `Minimum 4 tags required (${newTags.length}/4). Press Enter or Return to add tags.`
      );
    } else if (newTags.length > 10) {
      setTagsError(`Maximum 10 tags allowed (${newTags.length}/10).`);
    } else {
      setTagsError(null);
    }
  };

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = (await updatePluginTags(
        pluginSlug,
        tags.join(",")
      )) as ActionResult;

      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Failed to update tags"
        );
        return;
      }

      setIsEditing(false);
      router.refresh(); // Refresh the page to show updated tags
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTags(initialTags); // Reset to initial tags
    setIsEditing(false);
    setError(null);
    setTagsError(null);
    setTagWarning(null);
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 relative">
      {isOwner && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground
                     hover:bg-secondary/50 rounded-md transition-colors"
          aria-label="Edit tags"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <dt className="text-sm text-muted-foreground mb-3">Tags</dt>

      <dd>
        {isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Tags</span>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    tagsError
                      ? "bg-red-500/10 text-red-500"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {tags.length}
                </div>
              </div>

              {tagsError && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {tagsError}
                </span>
              )}
            </div>

            {tagWarning && (
              <div className="mb-2 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {tagWarning}
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <TagInput
                  name="tags"
                  value={tags}
                  onChange={handleTagsChange}
                  placeholder="Type and press Enter to add tags..."
                  className={`${
                    tagsError
                      ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500"
                      : "border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {tagsError ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : tags.length >= 4 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : null}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2 mb-4">
              Add 4-10 tags by typing and pressing Enter. Each tag can have max
              20 characters.
            </p>

            {error && (
              <p className="text-xs text-destructive mt-1 mb-2">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={handleSave}
                disabled={isSubmitting || !isFormValid}
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
        ) : initialTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {initialTags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary/50 text-secondary-foreground px-2.5 py-1 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "No tags added yet. Click the edit button to add tags."
              : "No tags added yet."}
          </p>
        )}
      </dd>
    </div>
  );
}
