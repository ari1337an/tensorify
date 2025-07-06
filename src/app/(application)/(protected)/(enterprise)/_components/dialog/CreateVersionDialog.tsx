import { useState } from "react";
import { GitBranch, Plus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import { Alert, AlertDescription } from "@/app/_components/ui/alert";

interface CreateVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVersion?: (data: CreateVersionData) => void;
  currentVersion?: string;
  isLoading?: boolean;
}

interface CreateVersionData {
  version: string;
  summary: string;
  description?: string;
}

export function CreateVersionDialog({
  isOpen,
  onClose,
  onCreateVersion,
  currentVersion = "2.1.0",
  isLoading = false,
}: CreateVersionDialogProps) {
  const [formData, setFormData] = useState<CreateVersionData>({
    version: "",
    summary: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<CreateVersionData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggest next version number
  const suggestNextVersion = (current: string) => {
    const parts = current.split(".").map(Number);
    if (parts.length >= 3) {
      parts[1] += 1; // Increment minor version
      parts[2] = 0; // Reset patch version
      return parts.join(".");
    }
    return "1.0.0";
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateVersionData> = {};

    // Version validation
    if (!formData.version.trim()) {
      newErrors.version = "Version number is required";
    } else if (!/^\d+\.\d+\.\d+$/.test(formData.version.trim())) {
      newErrors.version =
        "Version must follow semantic versioning (e.g., 1.0.0)";
    }

    // Summary validation
    if (!formData.summary.trim()) {
      newErrors.summary = "Summary is required";
    } else if (formData.summary.length > 100) {
      newErrors.summary = "Summary must be less than 100 characters";
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateVersion?.(formData);
      // Don't call handleClose here - let the parent handle it after successful API call
    } catch (error) {
      console.error("Failed to create version:", error);
      // Handle error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ version: "", summary: "", description: "" });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const suggestedVersion = suggestNextVersion(currentVersion);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Create New Version
          </DialogTitle>
          <DialogDescription>
            Create a new version of your workflow. This will save your current
            changes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="version">Version Number</Label>
            <div className="space-y-1">
              <Input
                id="version"
                placeholder={`e.g., ${suggestedVersion}`}
                value={formData.version}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, version: e.target.value }))
                }
                className={errors.version ? "border-destructive" : ""}
              />
              {errors.version && (
                <p className="text-sm text-destructive">{errors.version}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use semantic versioning (MAJOR.MINOR.PATCH)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <div className="space-y-1">
              <Input
                id="summary"
                placeholder="Brief description of changes"
                value={formData.summary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, summary: e.target.value }))
                }
                className={errors.summary ? "border-destructive" : ""}
                maxLength={100}
              />
              {errors.summary && (
                <p className="text-sm text-destructive">{errors.summary}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.summary.length}/100 characters
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <div className="space-y-1">
              <Textarea
                id="description"
                placeholder="Detailed description of changes, features, or fixes..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={`resize-none ${errors.description ? "border-destructive" : ""}`}
                rows={3}
                maxLength={500}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {(formData.description || "").length}/500 characters
              </p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Creating a new version will save your current workflow state. You
              can always switch back to previous versions later.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="gap-2"
            >
              {isLoading || isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Version
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
