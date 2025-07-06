"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Loader2, Package } from "lucide-react";

interface InstallPluginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPlugin: (slug: string) => Promise<void>;
  isLoading?: boolean;
}

export function InstallPluginDialog({
  isOpen,
  onClose,
  onInstallPlugin,
  isLoading = false,
}: InstallPluginDialogProps) {
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");

  // Regex pattern for validating plugin slug format
  const PLUGIN_SLUG_REGEX =
    /^@[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+:(?:latest|\d+\.\d+\.\d+)$/;

  const validateSlug = (inputSlug: string) => {
    if (!inputSlug.trim()) {
      setSlugError("Plugin slug is required");
      return false;
    }

    if (!PLUGIN_SLUG_REGEX.test(inputSlug)) {
      setSlugError(
        "Invalid format. Use @username/plugin:version (e.g., @user/demo:1.0.0 or @user/demo:latest)"
      );
      return false;
    }

    setSlugError("");
    return true;
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    if (slugError) {
      validateSlug(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSlug(slug)) {
      return;
    }

    try {
      await onInstallPlugin(slug);
      // Reset form on success
      setSlug("");
      setSlugError("");
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error installing plugin:", error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSlug("");
      setSlugError("");
      onClose();
    }
  };

  const isFormValid = slug.trim() && !slugError;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Install Plugin
          </DialogTitle>
          <DialogDescription>
            Install a plugin in your workflow using the plugin slug format.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Plugin Slug</Label>
            <Input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="@username/plugin:version"
              disabled={isLoading}
              className={slugError ? "border-red-500" : ""}
            />
            {slugError && <p className="text-sm text-red-500">{slugError}</p>}
            <p className="text-xs text-muted-foreground">
              Examples: @johndoe/conv2d:5.0.2, @johndoe/dropout:latest
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Install
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
