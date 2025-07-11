"use client";

import { useState, useEffect } from "react";
import {
  createPlugin,
  checkRepositoryExists,
} from "@/server/actions/plugin-actions";
import { useRouter } from "next/navigation";
import { useTensorifyVersions } from "@/app/_hooks/use-tensorify-versions";
import {
  Loader2,
  Github,
  Check,
  ChevronLeft,
  GitMerge,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Tag,
  Globe,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { TagInput } from "@/app/_components/ui/TagInput";
import { Button } from "@/app/_components/ui/button";
import { TensorifyVersion } from "@/server/actions/tensorify-actions";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  owner: {
    login: string;
  };
  private: boolean;
}

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

export default function CreatePluginForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [repositoryCheckLoading, setRepositoryCheckLoading] = useState<
    string | null
  >(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [version, setVersion] = useState("1.0.0");
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [pluginName, setPluginName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [status, setStatus] = useState("active");
  const [tensorifyVersion, setTensorifyVersion] = useState("");
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [editableSlug, setEditableSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [tagWarning, setTagWarning] = useState<string | null>(null);
  const [filteredRepositories, setFilteredRepositories] = useState<
    GitHubRepo[]
  >([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // Release tag selector state
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<string>("");
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);
  const [releasesError, setReleasesError] = useState<string | null>(null);
  const [releaseSearchQuery, setReleaseSearchQuery] = useState("");
  const [filteredReleases, setFilteredReleases] = useState<GitHubRelease[]>([]);
  const [releaseTagError, setReleaseTagError] = useState<string | null>(null);

  const { user } = useUser();
  const userName = user?.username;

  const {
    data: versions,
    isLoading: isLoadingVersions,
    error: versionsError,
  } = useTensorifyVersions();

  // Check for existing GitHub access on mount
  useEffect(() => {
    const checkExistingAccess = async () => {
      try {
        const response = await fetch("/api/github/repositories");
        if (response.ok) {
          const data = await response.json();
          setRepositories(data.repos);
          setCurrentStep(1); // Move to repository selection if access exists
        } else {
          // Any non-200 response means we need GitHub access
          setCurrentStep(0);
        }
      } catch (error) {
        console.error("Error checking GitHub access:", error);
        setCurrentStep(0);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkExistingAccess();
  }, []);

  // Set the latest Tensorify version as default when versions are loaded
  useEffect(() => {
    if (versions?.versions && versions.versions.length > 0) {
      // Sort versions in descending order and get the latest one
      const sortedVersions = [...versions.versions].sort((a, b) =>
        b.version.localeCompare(a.version, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
      setTensorifyVersion(sortedVersions[0].version);
    }
  }, [versions]);

  // Fetch releases for selected repository
  const fetchReleases = async (githubUrl: string) => {
    setIsLoadingReleases(true);
    setReleasesError(null);
    setReleases([]);
    setSelectedRelease("");
    setFilteredReleases([]);
    setReleaseSearchQuery("");

    try {
      const response = await fetch(
        `/api/github/releases?githubUrl=${encodeURIComponent(githubUrl)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch releases");
      }

      const data = await response.json();
      setReleases(data.releases || []);
      setFilteredReleases(data.releases || []);

      // Auto-select the first release if available
      if (data.releases && data.releases.length > 0) {
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
  };

  // Filter releases based on search query
  useEffect(() => {
    if (!releaseSearchQuery.trim()) {
      setFilteredReleases(releases);
    } else {
      const filtered = releases.filter(
        (release) =>
          release.tagName
            .toLowerCase()
            .includes(releaseSearchQuery.toLowerCase()) ||
          (release.name &&
            release.name
              .toLowerCase()
              .includes(releaseSearchQuery.toLowerCase())) ||
          (release.body &&
            release.body
              .toLowerCase()
              .includes(releaseSearchQuery.toLowerCase()))
      );
      setFilteredReleases(filtered);
    }
  }, [releaseSearchQuery, releases]);

  // Form validation
  useEffect(() => {
    const validateName = () => {
      if (!pluginName.trim()) {
        setNameError("Plugin name is required");
        return false;
      }
      setNameError(null);
      return true;
    };

    const validateDescription = () => {
      if (!description.trim()) {
        setDescriptionError("Description is required");
        return false;
      }
      setDescriptionError(null);
      return true;
    };

    const validateSlug = () => {
      if (!editableSlug.trim()) {
        setSlugError("Slug is required");
        return false;
      }

      // Validate slug format (only alphanumeric, dashes)
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(editableSlug)) {
        setSlugError(
          "Slug can only contain lowercase letters, numbers, and dashes"
        );
        return false;
      }

      setSlugError(null);
      return true;
    };

    const validateVersion = () => {
      const versionRegex = /^\d+\.\d+\.\d+$/;
      if (!versionRegex.test(version)) {
        setVersionError("Version must be in x.y.z format (e.g., 1.0.0)");
        return false;
      }
      setVersionError(null);
      return true;
    };

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

      // We no longer need to check for character length here since we prevent
      // tags longer than 20 characters from being added in the first place

      setTagsError(null);
      return true;
    };

    const validateReleaseTag = () => {
      if (!selectedRelease.trim()) {
        setReleaseTagError("Please select a GitHub release");
        return false;
      }
      setReleaseTagError(null);
      return true;
    };

    if (currentStep === 2) {
      const isValid =
        validateName() &&
        validateDescription() &&
        validateSlug() &&
        validateVersion() &&
        validateTags() &&
        validateReleaseTag() &&
        tensorifyVersion !== "";

      setIsFormValid(isValid);
    }
  }, [
    pluginName,
    description,
    editableSlug,
    version,
    tensorifyVersion,
    tags,
    selectedRelease,
    currentStep,
  ]);

  const fetchRepositories = async () => {
    try {
      const response = await fetch("/api/github/repositories");
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      const data = await response.json();
      setRepositories(data.repos);
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  };

  useEffect(() => {
    if (currentStep === 1) {
      fetchRepositories();
    }
  }, [currentStep]);

  // Check for OAuth callback on component mount
  useEffect(() => {
    const checkOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const storedState = localStorage.getItem("github_oauth_state");

      if (code && state && state === storedState) {
        try {
          setGithubError(null);
          setIsGithubLoading(true);

          // Clear the state from localStorage
          localStorage.removeItem("github_oauth_state");

          // Fetch repositories from our API
          const response = await fetch(`/api/github-access?code=${code}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch repositories");
          }

          // Update the repositories list
          setRepositories(data.repos);

          // Clean up the URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error("Failed to fetch repositories:", error);
          setGithubError(
            error instanceof Error
              ? error.message
              : "Failed to connect to GitHub"
          );
        } finally {
          setIsGithubLoading(false);
        }
      }
    };

    checkOAuthCallback();
  }, []);

  // Select a repository
  const selectRepository = async (repo: GitHubRepo) => {
    setRepositoryCheckLoading(repo.full_name);
    setGithubError(null);

    try {
      // Check if a plugin already exists for this repository
      const result = await checkRepositoryExists(repo.html_url);

      if (result.error) {
        setGithubError(result.error.message);
        return;
      }

      if (result.exists && result.plugin) {
        setGithubError(
          `You already have a plugin for this repository: ${result.plugin.name}. Please edit that plugin instead.`
        );
        return;
      } else if (result.exists) {
        setGithubError(
          `You already have a plugin for this repository. Please edit that plugin instead.`
        );
        return;
      }

      // If no existing plugin, proceed with repository selection
      setSelectedRepo(repo);

      // Pre-fill plugin details from repository
      setPluginName(repo.name);
      setDescription(repo.description || "");

      // Set visibility based on repo's visibility
      setVisibility(repo.private ? "private" : "public");

      // Generate the slug preview
      const nameSlug = repo.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setEditableSlug(nameSlug);
      setGeneratedSlug(`@${userName}/${nameSlug}:${version}`);

      // Fetch releases for the selected repository
      fetchReleases(repo.html_url);

      setCurrentStep(2); // Move to plugin details form
    } catch (error) {
      console.error("Error checking repository:", error);
      setGithubError(
        "An error occurred while checking the repository. Please try again."
      );
    } finally {
      setRepositoryCheckLoading(null);
    }
  };

  // Handle plugin name change to update the slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setPluginName(name);

    if (name.trim() === "") {
      setNameError("Plugin name is required");
    } else {
      setNameError(null);
    }
  };

  // Handle slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value;
    setEditableSlug(slug);

    if (selectedRepo) {
      setGeneratedSlug(`@${userName}/${slug}:${version}`);
    }

    // Validate slug
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slug.trim()) {
      setSlugError("Slug is required");
    } else if (!slugRegex.test(slug)) {
      setSlugError(
        "Slug can only contain lowercase letters, numbers, and dashes"
      );
    } else {
      setSlugError(null);
    }
  };

  // Handle description change
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const desc = e.target.value;
    setDescription(desc);

    if (desc.trim() === "") {
      setDescriptionError("Description is required");
    } else {
      setDescriptionError(null);
    }
  };

  // Handle tag changes
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

  // Step 2: Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGithubError(null);

    if (!selectedRepo || !isFormValid) {
      setIsLoading(false);
      return;
    }

    try {
      const data = {
        name: pluginName,
        description: description,
        githubUrl: selectedRepo.html_url,
        status: status as "active" | "beta",
        tensorifyVersion: tensorifyVersion,
        version: version,
        releaseTag: selectedRelease,
        tags: tags.join(","),
        isPublic: visibility === "public",
        slug: generatedSlug,
      };

      console.log("Creating plugin with data:", {
        ...data,
        selectedRelease,
        totalReleases: releases.length,
      });

      await createPlugin(data);

      // If we got here, the plugin was created successfully
      router.push(`/plugins/${generatedSlug}`); // Redirect to plugin page after creation
    } catch (error) {
      console.error("Failed to create plugin:", error);

      // Check if it's a private repository access error
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      if (
        errorMessage.includes("private repository") ||
        errorMessage.includes("not authorized")
      ) {
        setGithubError(
          "Unable to access your private repository. Please reconnect your GitHub account to grant the necessary permissions."
        );
        // Allow the user to reconnect their GitHub account
        setCurrentStep(0);
      } else {
        setGithubError(`Failed to create plugin: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Simplified progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-background z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/60"
          initial={{ width: "50%" }}
          animate={{ width: currentStep === 0 ? "50%" : "100%" }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: GitHub Connection */}
        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-6"
              >
                <Github className="h-12 w-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Connect to GitHub
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We need access to your GitHub repositories to create your
                plugin. This allows us to import your repository content and
                metadata.
              </p>
            </div>

            {isCheckingAccess ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  Checking GitHub access...
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6"
              >
                {githubError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 text-red-500 px-6 py-3 rounded-lg text-sm font-medium"
                  >
                    {githubError}
                  </motion.div>
                )}
                <Button
                  onClick={() => {
                    setIsGithubLoading(true);
                    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
                    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/github-access`;
                    const scope = "repo";
                    const state = Math.random().toString(36).substring(7);
                    localStorage.setItem("github_oauth_state", state);
                    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
                  }}
                  className="group flex items-center gap-3 bg-black hover:bg-black/90 text-white px-8 py-6 rounded-xl text-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                >
                  <Github className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Connect to GitHub
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 1: GitHub Repository Selection */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-center mb-6">
              Select Repository
            </h3>

            {isGithubLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading repositories...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filteredRepos = repositories.filter(
                        (repo) =>
                          repo.name.toLowerCase().includes(searchTerm) ||
                          repo.description
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                          repo.full_name.toLowerCase().includes(searchTerm)
                      );
                      setFilteredRepositories(filteredRepos);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Display error message at the top if any */}
                  {githubError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 text-red-500 px-6 py-4 rounded-lg text-sm font-medium flex items-center gap-2 mb-2"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{githubError}</span>
                    </motion.div>
                  )}

                  {/* Show message when no repos are found */}
                  {repositories.length === 0 && !isGithubLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="bg-muted p-4 rounded-full mb-4">
                        <Github className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-medium mb-2">
                        No Repositories Found
                      </h4>
                      <p className="text-muted-foreground max-w-md">
                        We couldn&apos;t find any GitHub repositories associated
                        with your account. Make sure you have repositories in
                        your GitHub account and try reconnecting.
                      </p>
                    </motion.div>
                  )}

                  {/* Repository list */}
                  {(filteredRepositories.length
                    ? filteredRepositories
                    : repositories
                  ).map((repo, index) => (
                    <motion.button
                      key={repo.full_name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => selectRepository(repo)}
                      className={cn(
                        "p-4 border rounded-lg text-left transition-all duration-300 hover:shadow-md",
                        selectedRepo === repo
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "hover:border-primary/50",
                        repositoryCheckLoading === repo.full_name
                          ? "opacity-70 cursor-wait"
                          : ""
                      )}
                      disabled={repositoryCheckLoading !== null}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-base truncate">
                              {repo.name}
                            </h4>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                repo.private
                                  ? "bg-secondary text-muted-foreground"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {repo.private ? "Private" : "Public"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {repo.description || "No description"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Github className="h-3 w-3" />
                            <span className="font-mono">{repo.full_name}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {repositoryCheckLoading === repo.full_name ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Plugin Details Form */}
        {currentStep === 2 && selectedRepo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <GitMerge className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{selectedRepo.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  <a
                    href={selectedRepo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Change
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6">
                {/* Plugin Name */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Name</label>
                    {nameError && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {nameError}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      data-testid="plugin-name-input"
                      type="text"
                      name="name"
                      value={pluginName}
                      onChange={handleNameChange}
                      required
                      className={cn(
                        "w-full bg-secondary/50 border rounded-lg py-3 px-4 transition-all duration-300",
                        nameError
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          : "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {nameError ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : pluginName ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Slug - Two parts: display username (non-editable) + editable slug part + version */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Slug</label>
                    {slugError && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {slugError}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-0 w-full text-sm font-mono">
                    <div className="bg-muted px-3 py-3 rounded-l-lg border-y border-l border-border">
                      @{userName}/
                    </div>
                    <div className="relative flex-1">
                      <input
                        data-testid="plugin-slug-input"
                        type="text"
                        name="slug"
                        value={editableSlug}
                        onChange={handleSlugChange}
                        required
                        className={cn(
                          "w-full bg-secondary/50 border-y border-r rounded-r-lg py-3 px-4 transition-all duration-300 font-mono",
                          slugError
                            ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            : "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        )}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {slugError ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : editableSlug ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slug Preview (non-editable) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Slug Preview
                  </label>
                  <div className="w-full bg-muted/50 border border-border rounded-lg py-3 px-4 text-muted-foreground font-mono text-sm">
                    {generatedSlug}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Description
                    </label>
                    {descriptionError && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {descriptionError}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <textarea
                      data-testid="plugin-description-input"
                      name="description"
                      value={description}
                      onChange={handleDescriptionChange}
                      required
                      rows={3}
                      className={cn(
                        "w-full bg-secondary/50 border rounded-lg py-3 px-4 transition-all duration-300",
                        descriptionError
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          : "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      )}
                    />
                    <div className="absolute right-3 top-3">
                      {descriptionError ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : description ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Version (Dropdown) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Version</label>
                    {versionError && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {versionError}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      data-testid="plugin-version-input"
                      type="text"
                      name="version"
                      value={version}
                      onChange={(e) => {
                        const newVersion = e.target.value;
                        setVersion(newVersion);

                        if (selectedRepo) {
                          setGeneratedSlug(
                            `@${userName}/${editableSlug}:${newVersion}`
                          );
                        }

                        // Validate version
                        const versionRegex = /^\d+\.\d+\.\d+$/;
                        if (!versionRegex.test(newVersion)) {
                          setVersionError(
                            "Version must be in x.y.z format (e.g., 1.0.0)"
                          );
                        } else {
                          setVersionError(null);
                        }
                      }}
                      placeholder="e.g., 1.0.0"
                      className={cn(
                        "w-full bg-secondary/50 border rounded-lg py-3 px-4 transition-all duration-300",
                        versionError
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          : "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {versionError ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : version ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Format: x.y.z where x, y, z are integers (e.g., 1.0.0)
                  </p>
                </div>

                {/* GitHub Release Tag Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      GitHub Release
                    </label>
                    {releaseTagError && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {releaseTagError}
                      </span>
                    )}
                  </div>

                  {isLoadingReleases ? (
                    <div className="flex items-center justify-center py-8 bg-secondary/30 rounded-lg border border-border">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                      <span className="text-sm text-muted-foreground">
                        Loading releases...
                      </span>
                    </div>
                  ) : releasesError ? (
                    <div className="flex items-center gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Failed to load releases
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {releasesError}
                        </p>
                      </div>
                    </div>
                  ) : releases.length === 0 ? (
                    <div className="flex items-center gap-3 p-6 border border-amber-200 rounded-lg bg-amber-50">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-700">
                          No releases found
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          This repository doesn&apos;t have any releases yet.{" "}
                          <a
                            href={`${selectedRepo?.html_url}/releases/new`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:no-underline"
                          >
                            Create a release on GitHub
                          </a>{" "}
                          to continue.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search releases..."
                          value={releaseSearchQuery}
                          onChange={(e) =>
                            setReleaseSearchQuery(e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        />
                      </div>

                      {/* Releases List */}
                      <div className="max-h-48 overflow-y-auto space-y-2 bg-secondary/20 rounded-lg p-3 border border-border">
                        {filteredReleases.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            No releases match your search
                          </div>
                        ) : (
                          filteredReleases.map((release) => (
                            <div
                              key={release.id}
                              className={cn(
                                "group p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm",
                                selectedRelease === release.tagName
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                                  : "border-border/60 hover:border-primary/50 hover:bg-background/50"
                              )}
                              onClick={() =>
                                setSelectedRelease(release.tagName)
                              }
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div
                                    className={cn(
                                      "p-2 rounded-lg transition-colors flex-shrink-0",
                                      selectedRelease === release.tagName
                                        ? "bg-primary/10"
                                        : "bg-muted/50 group-hover:bg-muted"
                                    )}
                                  >
                                    <Tag
                                      className={cn(
                                        "h-4 w-4",
                                        selectedRelease === release.tagName
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                      )}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm truncate">
                                        {release.tagName}
                                      </span>
                                      {release.isPrerelease && (
                                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                          Pre-release
                                        </span>
                                      )}
                                    </div>
                                    {release.name && (
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {release.name}
                                      </p>
                                    )}
                                    {release.body && (
                                      <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
                                        {release.body}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="text-xs text-muted-foreground/70">
                                    {new Date(
                                      release.publishedAt
                                    ).toLocaleDateString()}
                                  </div>
                                  {selectedRelease === release.tagName && (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    Select the GitHub release that contains the source code for
                    this plugin version.
                  </p>
                </div>

                {/* Status - Reduced options */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    data-testid="plugin-status-select"
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className="w-full bg-secondary/50 border border-border rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  >
                    <option value="active">Active</option>
                    <option value="beta">Beta</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Plugins can be marked as deprecated later from the plugin
                    details page
                  </p>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3 rounded-lg p-2 ">
                    <button
                      type="button"
                      onClick={() => setVisibility("public")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border transition-all duration-300",
                        visibility === "public"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          visibility === "public"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Public</div>
                        <div className="text-xs text-muted-foreground">
                          Visible to everyone
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility("private")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border transition-all duration-300",
                        visibility === "private"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          visibility === "private"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Lock className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Private</div>
                        <div className="text-xs text-muted-foreground">
                          Only visible to you
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tensorify Version */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    SDK Version
                  </label>
                  {isLoadingVersions ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading versions...
                    </div>
                  ) : versionsError ? (
                    <div className="text-red-500 text-sm">
                      Failed to load versions. Please try again.
                    </div>
                  ) : (
                    <>
                      <select
                        data-testid="plugin-tensorify-version-select"
                        name="tensorifyVersion"
                        value={tensorifyVersion}
                        onChange={(e) => setTensorifyVersion(e.target.value)}
                        required
                        className={cn(
                          "w-full bg-secondary/50 border rounded-lg py-3 px-4 transition-all duration-300",
                          !tensorifyVersion
                            ? "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            : "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        )}
                      >
                        <option value="">Select a version</option>
                        {versions?.versions?.map(
                          (version: TensorifyVersion) => (
                            <option key={version.id} value={version.version}>
                              {version.version}
                            </option>
                          )
                        )}
                      </select>
                      <p className="text-xs text-muted-foreground mt-2">
                        The Tensorify version this plugin is compatible with
                      </p>
                    </>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium">Tags</label>
                      <div
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          tagsError
                            ? "bg-red-500/10 text-red-500"
                            : "bg-primary/10 text-primary"
                        )}
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
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="relative flex-1">
                      <TagInput
                        name="tags"
                        value={tags}
                        onChange={handleTagsChange}
                        placeholder="Type and press Enter to add tags..."
                        className={cn(
                          "flex-1 bg-secondary/50 border rounded-lg transition-all duration-300",
                          tagsError
                            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500"
                            : "border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                        )}
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Add 4-10 tags by typing and pressing Enter. Each tag can
                    have max 20 characters.
                  </p>
                </div>
              </div>

              {/* Plugin Summary */}
              {selectedRelease && pluginName && editableSlug && version && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
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
                          Ready to create!
                        </h4>
                        <p className="text-sm text-muted-foreground/80 mt-0.5">
                          Plugin configuration complete
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[5rem]">
                          <Github className="h-4 w-4 text-muted-foreground/70" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Release
                          </span>
                        </div>
                        <div className="flex-1">
                          <code className="inline-flex items-center px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 font-mono text-sm text-foreground/90 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1)]">
                            {selectedRelease}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 min-w-[5rem] mt-1">
                          <Tag className="h-4 w-4 text-muted-foreground/70" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Plugin
                          </span>
                        </div>
                        <div className="flex-1">
                          <code className="inline-flex items-center px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 font-mono text-sm text-foreground/90 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1)] break-all">
                            {generatedSlug}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isLoadingVersions || !isFormValid}
                  className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Plugin
                      <Check className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
