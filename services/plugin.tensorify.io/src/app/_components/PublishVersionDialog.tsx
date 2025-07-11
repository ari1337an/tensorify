"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  checkVersionExists,
  validateVersionFormat,
  publishNewVersion,
  getNextVersion,
} from "@/server/actions/plugin-actions";
import { CreatePluginInput } from "@/server/validation/plugin-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Loader2,
  GitBranch,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Tag,
  Github,
  X,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface GitHubRelease {
  id: number;
  tagName: string;
  name: string;
  createdAt: string;
  publishedAt: string;
  body: string;
  isPrerelease: boolean;
  htmlUrl: string;
}

interface PublishVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseSlug: string;
  pluginData: CreatePluginInput;
}

export function PublishVersionDialog({
  open,
  onOpenChange,
  baseSlug,
  pluginData,
}: PublishVersionDialogProps) {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<string>("");

  // Debug log for selectedRelease changes
  useEffect(() => {
    console.log("Selected release changed:", selectedRelease);
  }, [selectedRelease]);
  const [customVersion, setCustomVersion] = useState<string>("");
  const [nextSuggestedVersion, setNextSuggestedVersion] = useState<string>("");
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);
  const [isValidatingVersion, setIsValidatingVersion] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [releasesError, setReleasesError] = useState<string | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [versionExists, setVersionExists] = useState(false);
  const [potentialSlug, setPotentialSlug] = useState<string>("");

  const router = useRouter();

  // Define callback functions first
  const loadReleases = useCallback(async () => {
    setIsLoadingReleases(true);
    setReleasesError(null);

    try {
      const response = await fetch(
        `/api/github/releases?githubUrl=${encodeURIComponent(
          pluginData.githubUrl
        )}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch releases");
      }

      const data = await response.json();
      setReleases(data.releases || []);

      // Auto-select the first release if available
      if (data.releases && data.releases.length > 0) {
        console.log("Auto-selecting first release:", data.releases[0].tagName);
        setSelectedRelease(data.releases[0].tagName);
      }
    } catch (error) {
      console.error("Error loading releases:", error);
      setReleasesError(
        error instanceof Error ? error.message : "Failed to load releases"
      );
    } finally {
      setIsLoadingReleases(false);
    }
  }, [pluginData.githubUrl]);

  const loadNextSuggestedVersion = useCallback(async () => {
    try {
      const nextVersion = await getNextVersion(baseSlug);
      setNextSuggestedVersion(nextVersion);
      setCustomVersion(nextVersion);
    } catch (error) {
      console.error("Error loading next suggested version:", error);
    }
  }, [baseSlug]);

  const validateVersion = useCallback(
    async (version: string) => {
      setIsValidatingVersion(true);
      setVersionError(null);
      setVersionExists(false);

      try {
        // Check format
        const isValidFormat = await validateVersionFormat(version);
        if (!isValidFormat) {
          setVersionError("Version must be in format a.b.c (e.g., 1.0.0)");
          return;
        }

        // Check if version already exists
        console.log("Checking if version exists:", { baseSlug, version });
        const result = await checkVersionExists(baseSlug, version);
        console.log("Version check result:", result);

        if (result.error) {
          setVersionError(result.error.message);
          return;
        }

        if (result.exists) {
          setVersionExists(true);
          setVersionError("This version already exists for this plugin");
          return;
        }

        setVersionExists(false);
      } catch (error) {
        console.error("Error validating version:", error);
        setVersionError("Failed to validate version. Please try again.");
      } finally {
        setIsValidatingVersion(false);
      }
    },
    [baseSlug]
  );

  // Load releases when dialog opens
  useEffect(() => {
    if (open) {
      loadReleases();
      loadNextSuggestedVersion();
    } else {
      // Clear states when dialog closes
      setSelectedRelease("");
      setCustomVersion("");
      setVersionError(null);
      setVersionExists(false);
      setReleases([]);
      setReleasesError(null);
    }
  }, [open, loadReleases, loadNextSuggestedVersion]);

  // Update potential slug when version changes
  useEffect(() => {
    if (customVersion) {
      setPotentialSlug(`${baseSlug}:${customVersion}`);
    } else {
      setPotentialSlug("");
    }
  }, [customVersion, baseSlug]);

  // Validate version when it changes
  useEffect(() => {
    if (customVersion) {
      validateVersion(customVersion);
    } else {
      setVersionError(null);
      setVersionExists(false);
    }
  }, [customVersion, validateVersion]);

  const handlePublish = async () => {
    if (!selectedRelease) {
      toast.error("Please select a GitHub release");
      return;
    }

    if (!customVersion) {
      toast.error("Please enter a custom version");
      return;
    }

    if (versionError || versionExists) {
      toast.error("Please fix the version errors before publishing");
      return;
    }

    setIsPublishing(true);

    try {
      const publishData = {
        ...pluginData,
        version: customVersion,
        releaseTag: selectedRelease, // Pass the selected GitHub release tag
      };

      console.log("Publishing new version with data:", {
        baseSlug,
        customVersion,
        selectedRelease,
        originalSlug: pluginData.slug,
        publishData,
      });

      const result = await publishNewVersion(baseSlug, publishData);

      if (result.error) {
        toast.error("Failed to publish new version", {
          description: result.error.message,
        });
        return;
      }

      toast.success("New version creation started", {
        description: "Your new plugin version is being processed.",
      });

      onOpenChange(false);

      setTimeout(() => {
        router.push(`/plugins/${baseSlug}:${customVersion}`);
      }, 200);
    } catch (error) {
      console.error("Error publishing version:", error);
      toast.error("Failed to publish new version", {
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isFormValid = () => {
    return (
      selectedRelease &&
      customVersion &&
      !versionError &&
      !versionExists &&
      !isValidatingVersion
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[700px] max-h-[90vh] flex flex-col
                   ring-4 ring-purple-500/30 border border-border/40 bg-card/40 backdrop-blur-xl 
                   shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] 
                   transition-all duration-500 p-0 rounded-2xl"
        closeButton={false}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex-1 overflow-y-auto min-h-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 relative">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 p-2 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="mx-auto rounded-full bg-primary/10 p-3 mb-4 ring-1 ring-primary/30 shadow-[0_4px_12px_-4px_rgba(99,102,241,0.2)]">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
              Publish New Version
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-muted-foreground/80">
              Select a GitHub release and enter a custom version to publish your
              plugin.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            {/* Step 1: GitHub Release Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm ring-2 ring-primary/20">
                  1
                </div>
                <Label className="text-base font-medium">
                  Select GitHub Release
                </Label>
                {!selectedRelease && (
                  <Badge
                    variant="outline"
                    className="text-xs text-orange-600 border-orange-200 bg-orange-50"
                  >
                    Required
                  </Badge>
                )}
                {selectedRelease && (
                  <Badge
                    variant="outline"
                    className="text-xs text-green-600 border-green-200 bg-green-50"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>

              {isLoadingReleases ? (
                <div className="flex items-center justify-center py-12 bg-muted/30 rounded-xl border border-border/40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-sm text-muted-foreground font-medium">
                    Loading releases...
                  </span>
                </div>
              ) : releasesError ? (
                <div className="flex items-center gap-3 p-4 border border-destructive/20 rounded-xl bg-destructive/5">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Failed to load releases
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {releasesError}
                    </p>
                  </div>
                </div>
              ) : releases.length === 0 ? (
                <div className="flex items-center gap-3 p-6 border border-muted/50 rounded-xl bg-muted/20">
                  <Github className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      No releases found
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Create a release on GitHub first to continue.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto rounded-xl border border-border/40 bg-background/50 p-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {releases.map((release) => (
                    <div
                      key={release.id}
                      className={`group p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        selectedRelease === release.tagName
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                          : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Clicking release:", release.tagName);
                        setSelectedRelease(release.tagName);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg transition-colors ${
                              selectedRelease === release.tagName
                                ? "bg-primary/10"
                                : "bg-muted/50 group-hover:bg-muted"
                            }`}
                          >
                            <Tag
                              className={`h-4 w-4 ${
                                selectedRelease === release.tagName
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {release.tagName}
                              </span>
                              {release.name && (
                                <span className="text-sm text-muted-foreground">
                                  {release.name}
                                </span>
                              )}
                            </div>
                            {release.body && (
                              <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1 max-w-md">
                                {release.body}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {release.isPrerelease && (
                            <Badge variant="secondary" className="text-xs">
                              Pre-release
                            </Badge>
                          )}
                          <div className="text-xs text-muted-foreground/70 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(release.publishedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Custom Version */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm ring-2 ring-primary/20">
                  2
                </div>
                <Label className="text-base font-medium">
                  Enter Plugin Version
                </Label>
                {!customVersion && (
                  <Badge
                    variant="outline"
                    className="text-xs text-orange-600 border-orange-200 bg-orange-50"
                  >
                    Required
                  </Badge>
                )}
                {customVersion && !versionError && !versionExists && (
                  <Badge
                    variant="outline"
                    className="text-xs text-green-600 border-green-200 bg-green-50"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                )}
                {versionExists && (
                  <Badge
                    variant="outline"
                    className="text-xs text-red-600 border-red-200 bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Already Exists
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    id="custom-version"
                    type="text"
                    value={customVersion}
                    onChange={(e) => setCustomVersion(e.target.value)}
                    placeholder="e.g., 1.0.0"
                    className={`h-12 text-base transition-all duration-200 ${
                      versionError
                        ? "border-destructive ring-2 ring-destructive/20"
                        : customVersion && !versionError && !versionExists
                        ? "border-green-500 ring-2 ring-green-500/20"
                        : "border-border/60 focus:border-primary"
                    }`}
                  />
                  {isValidatingVersion && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {nextSuggestedVersion && !customVersion && (
                  <div className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 <strong>Suggested next version:</strong>{" "}
                      <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded font-mono text-blue-800 dark:text-blue-200 ml-1">
                        {nextSuggestedVersion}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Results */}
            <div className="space-y-3">
              {versionError && (
                <div className="flex items-center gap-3 p-3 border border-destructive/20 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-500 font-medium">
                    {versionError}
                  </span>
                </div>
              )}

              {!versionError &&
                !isValidatingVersion &&
                potentialSlug &&
                selectedRelease &&
                customVersion && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-primary/[0.05] opacity-70"></div>
                    <div className="relative p-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-110"></div>
                          <div className="relative p-2.5 rounded-full bg-primary/10 ring-2 ring-primary/30 shadow-[0_4px_12px_-4px_rgba(99,102,241,0.3)]">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            Ready to publish!
                          </h4>
                          <p className="text-sm text-muted-foreground/80 mt-0.5">
                            Everything looks perfect
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 min-w-[4rem]">
                            <GitBranch className="h-4 w-4 text-muted-foreground/70" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Source
                            </span>
                          </div>
                          <div className="flex-1">
                            <code className="inline-flex items-center px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 font-mono text-sm text-foreground/90 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1)]">
                              {selectedRelease}
                            </code>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2 min-w-[4rem] mt-1">
                            <Tag className="h-4 w-4 text-muted-foreground/70" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Plugin
                            </span>
                          </div>
                          <div className="flex-1">
                            <code className="inline-flex items-center px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 font-mono text-sm text-foreground/90 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1)] break-all">
                              {potentialSlug}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={!isFormValid() || isPublishing}
              className={`w-full sm:w-auto transition-all duration-200 ${
                isFormValid() && !isPublishing
                  ? "shadow-[0_2px_10px_-2px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_15px_-2px_rgba(99,102,241,0.4)]"
                  : ""
              }`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Publish New Version
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
