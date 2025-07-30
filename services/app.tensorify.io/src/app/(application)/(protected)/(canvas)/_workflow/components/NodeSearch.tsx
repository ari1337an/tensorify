"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Panel } from "@xyflow/react";
import semver from "semver";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Plus,
  Search,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Download,
  Package,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import defaultNodes from "../data/defaultNodes";
import { type NodeItem } from "../types/NodeItem";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { useDragDrop } from "../context/DragDropContext";
import { toast } from "sonner";
import {
  postWorkflowPlugin,
  getWorkflowPlugins,
  putWorkflowPlugin,
} from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

// Search configuration constants
const SEARCH_DEBOUNCE_MS = 400; // Debounce delay for search input
const EXTERNAL_SEARCH_DELAY_MS = 200; // Additional delay before showing external loading
const MIN_SEARCH_LENGTH = 2; // Minimum characters before searching
const MAX_EXTERNAL_RESULTS = 10; // Maximum external plugins to show

// Search configuration
const SEARCH_CONFIG = {
  MIN_TERM_LENGTH: 2,
  PROXIMITY_WINDOW: 3,
  HIGH_QUALITY_THRESHOLD: 0.7,
  MATCH_THRESHOLD: 0.6,
  MIN_TERM_THRESHOLD: 0.5,
} as const;

// Common English stop words including domain-specific terms
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "will",
  "with",
  "this",
  "but",
  "they",
  "have",
  "had",
  "what",
  "said",
  "each",
  "which",
  "do",
  "how",
  "their",
  "if",
  "up",
  "out",
  "many",
  "then",
  "them",
  "can",
  "would",
  "like",
  "into",
  "him",
  "her",
  "my",
  "me",
  "node",
  "layer",
  "neural",
  "network",
  "ml",
  "ai",
  "model",
  "deep",
]);

type ExternalPlugin = {
  id: string;
  name: string;
  description: string;
  slug: string;
  authorName: string;
  tags: string | null;
  pluginType: string;
  version: string;
};

type InstalledPlugin = {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

type PluginWithDetails = InstalledPlugin & {
  name: string;
  description: string | null;
  authorName: string;
  version: string;
  pluginType: string;
};

type SearchState = {
  isSearching: boolean;
  isSearchingExternal: boolean;
  hasSearched: boolean;
  query: string;
  results: ExternalPlugin[];
  error: string | null;
};

type ScoredNodeItem = NodeItem & {
  score: number;
  matchDetails: string[];
};

// Simple stemmer for basic word variations
function simpleStem(word: string): string {
  const stemRules: [RegExp, string][] = [
    [/ies$/i, "y"],
    [/ied$/i, "y"],
    [/ying$/i, ""],
    [/ing$/i, ""],
    [/ly$/i, ""],
    [/ed$/i, ""],
    [/s$/i, ""],
    [/er$/i, ""],
    [/est$/i, ""],
  ];

  let stemmed = word.toLowerCase();
  for (const [pattern, replacement] of stemRules) {
    if (pattern.test(stemmed) && stemmed.length > 3) {
      stemmed = stemmed.replace(pattern, replacement);
      break;
    }
  }
  return stemmed;
}

// Levenshtein distance function for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Check if terms are fuzzy matches (allowing for typos)
function isFuzzyMatch(
  searchTerm: string,
  text: string,
  maxDistance: number = 2
): boolean {
  const words = text.split(/[\s-_]+/);

  for (const word of words) {
    if (word.length >= 3 && searchTerm.length >= 3) {
      const distance = levenshteinDistance(searchTerm, word);
      const threshold = Math.min(
        maxDistance,
        Math.floor(Math.max(searchTerm.length, word.length) * 0.3)
      );
      if (distance <= threshold) {
        return true;
      }
    }
  }
  return false;
}

// Check for stem matches
function isStemMatch(searchTerm: string, text: string): boolean {
  const searchStem = simpleStem(searchTerm);
  const words = text.split(/[\s-_]+/);

  for (const word of words) {
    if (word.length >= 3 && simpleStem(word) === searchStem) {
      return true;
    }
  }
  return false;
}

// Calculate phrase proximity bonus
function calculateProximityScore(searchTerms: string[], text: string): number {
  if (searchTerms.length < 2) return 0;

  const words = text.toLowerCase().split(/[\s-_]+/);
  let proximityScore = 0;

  for (let i = 0; i < searchTerms.length - 1; i++) {
    const term1 = searchTerms[i];
    const term2 = searchTerms[i + 1];

    const pos1 = words.findIndex((word) => word.includes(term1));
    const pos2 = words.findIndex((word) => word.includes(term2));

    if (pos1 !== -1 && pos2 !== -1) {
      const distance = Math.abs(pos2 - pos1);
      if (distance <= SEARCH_CONFIG.PROXIMITY_WINDOW) {
        proximityScore += Math.max(0, 10 - distance * 2);
      }
    }
  }

  return proximityScore;
}

// Calculate TF-IDF style scoring
function calculateTermFrequency(term: string, text: string): number {
  const words = text.toLowerCase().split(/[\s-_]+/);
  const termCount = words.filter((word) => word.includes(term)).length;
  return termCount / words.length;
}

// Function to safely split and trim search terms, removing stop words
function splitTerms(input: string): string[] {
  return input
    .split(/[\s,]+/) // Split by spaces and commas
    .map((term) => term.trim().toLowerCase())
    .filter(
      (term) =>
        term.length > SEARCH_CONFIG.MIN_TERM_LENGTH && !STOP_WORDS.has(term)
    );
}

// Enhanced scoring function for NodeItems with AND logic
function calculateNodeScore(
  node: NodeItem,
  query: string,
  searchTerms: string[]
): { score: number; matchDetails: string[]; matchesAllTerms: boolean } {
  let score = 0;
  const searchText = query.toLowerCase();
  const matchDetails: string[] = [];

  const title = node.title.toLowerCase();
  const description = node.description.toLowerCase();

  // Track which terms matched in each field
  const titleMatches = new Set<string>();
  const descriptionMatches = new Set<string>();

  // Exact full query match (highest priority)
  if (title.includes(searchText)) {
    score += 100;
    matchDetails.push(`Title: "${node.title}"`);
    // Mark all terms as matched for exact phrase
    searchTerms.forEach((term) => titleMatches.add(term));
  }
  if (description.includes(searchText)) {
    score += 80;
    matchDetails.push(`Description: "${node.description.substring(0, 50)}..."`);
    // Mark all terms as matched for exact phrase
    searchTerms.forEach((term) => descriptionMatches.add(term));
  }

  // Phrase proximity bonus
  score += calculateProximityScore(searchTerms, title) * 2;
  score += calculateProximityScore(searchTerms, description) * 1.5;

  // Individual term matching with AND logic
  searchTerms.forEach((term) => {
    // Title matches (highest priority)
    if (title.includes(term)) {
      const tf = calculateTermFrequency(term, title);
      score += 20 + tf * 10;
      titleMatches.add(term);
      matchDetails.push(`Title contains "${term}"`);
    } else if (isFuzzyMatch(term, title)) {
      score += 15;
      titleMatches.add(term);
      matchDetails.push(`Title fuzzy match "${term}"`);
    } else if (isStemMatch(term, title)) {
      score += 12;
      titleMatches.add(term);
      matchDetails.push(`Title stem match "${term}"`);
    }

    // Description matches
    if (description.includes(term)) {
      const tf = calculateTermFrequency(term, description);
      score += 15 + tf * 8;
      descriptionMatches.add(term);
      matchDetails.push(`Description contains "${term}"`);
    } else if (isFuzzyMatch(term, description)) {
      score += 12;
      descriptionMatches.add(term);
      matchDetails.push(`Description fuzzy match "${term}"`);
    } else if (isStemMatch(term, description)) {
      score += 10;
      descriptionMatches.add(term);
      matchDetails.push(`Description stem match "${term}"`);
    }
  });

  // AND Logic: Check if ALL terms are matched across title and description
  const allTermsMatched = searchTerms.every(
    (term) => titleMatches.has(term) || descriptionMatches.has(term)
  );

  // If not all terms matched, return zero score (AND logic)
  if (!allTermsMatched) {
    return { score: 0, matchDetails: [], matchesAllTerms: false };
  }

  // Bonus for matching multiple terms
  const totalMatches = titleMatches.size + descriptionMatches.size;
  if (totalMatches > 1) {
    score += totalMatches * 10;
  }

  // Bonus for high match percentage
  const matchPercentage = totalMatches / (searchTerms.length * 2); // 2 fields
  score += matchPercentage * 50;

  // Prioritization bonus: title matches are worth more
  const titleMatchCount = titleMatches.size;
  const descriptionMatchCount = descriptionMatches.size;

  if (titleMatchCount > 0) {
    score += titleMatchCount * 25; // Extra bonus for title matches
  }

  if (descriptionMatchCount > 0) {
    score += descriptionMatchCount * 10; // Smaller bonus for description matches
  }

  return {
    score,
    matchDetails: matchDetails.slice(0, 3), // Top 3 match reasons
    matchesAllTerms: true,
  };
}

// Smart filtering for local results
function applySmartFiltering<T extends { score: number }>(
  scoredItems: T[],
  _queryTerms: string[]
): T[] {
  if (scoredItems.length === 0) return [];

  const scores = scoredItems.map((item) => item.score);
  const maxScore = Math.max(...scores);
  const hasHighQualityMatches = maxScore >= 80; // High score threshold

  if (hasHighQualityMatches && scoredItems.length > 1) {
    // Filter out items with significantly lower scores
    const threshold = maxScore * SEARCH_CONFIG.MATCH_THRESHOLD;
    return scoredItems.filter((item) => item.score >= threshold);
  }

  return scoredItems;
}

const NodeListItem = ({
  item,
  onClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  matchDetails,
}: {
  item: NodeItem;
  onClick: () => void;
  matchDetails?: string[];
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex items-center gap-3.5 p-3 rounded-lg transition-colors duration-200 hover:bg-muted/70"
    >
      <div className="flex-shrink-0 bg-muted/40 rounded-md p-2.5 transition-colors duration-200 group-hover:bg-primary/10">
        <div className="relative z-10 text-primary-readable transition-transform duration-200 group-hover:scale-110">
          <item.Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex-grow">
        <p className="font-medium text-foreground transition-colors duration-200 group-hover:text-primary-readable">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
        {/* {matchDetails && matchDetails.length > 0 && (
          <div className="mt-1">
            <p className="text-xs text-primary-readable/70 font-medium">
              Matches: {matchDetails.join(", ")}
            </p>
          </div>
        )} */}
      </div>
      {item.children && item.children.length > 0 && (
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      )}
    </div>
  );
};

const LoadingSpinner = ({
  size = "default",
  className = "",
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`animate-spin border-2 border-current border-t-transparent rounded-full ${sizeClasses[size]} ${className}`}
    />
  );
};

const SearchBar = ({
  value,
  onChange,
  isSearching = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearching?: boolean;
}) => (
  <div className="px-3 sticky top-0 z-10">
    <div className="relative">
      {isSearching ? (
        <LoadingSpinner
          size="sm"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      ) : (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        type="search"
        placeholder="Search for a node..."
        className="w-full pl-9 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

export default function NodeSearch() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNestedSheetOpen, setIsNestedSheetOpen] = useState(false);
  const [nestedContent, setNestedContent] = useState<{
    title: string;
    items: NodeItem[];
  }>({ title: "", items: [] });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [nestedSearchTerm, setNestedSearchTerm] = useState("");

  // Enhanced search state management
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    isSearchingExternal: false,
    hasSearched: false,
    query: "",
    results: [],
    error: null,
  });

  const [installingPlugins, setInstallingPlugins] = useState<Set<string>>(
    new Set()
  );
  const [updatingPlugins, setUpdatingPlugins] = useState<Set<string>>(
    new Set()
  );
  const [installedPlugins, setInstalledPlugins] = useState<PluginWithDetails[]>(
    []
  );

  const { currentWorkflow } = useStore();
  const {
    setDraggedNodeType,
    setDraggedVersion,
    setIsDragging,
    setOnDropSuccessCallback,
  } = useDragDrop();

  // Debounce search term with immediate loading state
  useEffect(() => {
    // Immediately show searching state for local search
    if (
      searchTerm !== debouncedSearchTerm &&
      searchTerm.length >= MIN_SEARCH_LENGTH
    ) {
      setSearchState((prev) => ({ ...prev, isSearching: true }));
    }

    const debounceTimer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm.length < MIN_SEARCH_LENGTH) {
        setSearchState({
          isSearching: false,
          isSearchingExternal: false,
          hasSearched: false,
          query: searchTerm,
          results: [],
          error: null,
        });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, debouncedSearchTerm]);

  // Enhanced external plugin search with proper loading states
  const searchExternalPlugins = useCallback(async (query: string) => {
    if (query.length < MIN_SEARCH_LENGTH) return;

    try {
      // Always search external, regardless of local results
      // Show external loading state after a brief delay
      const externalLoadingTimer = setTimeout(() => {
        setSearchState((prev) => ({
          ...prev,
          isSearchingExternal: true,
        }));
      }, EXTERNAL_SEARCH_DELAY_MS);

      const isDevelopment = process.env.NODE_ENV === "development";
      const baseUrl = isDevelopment
        ? "http://localhost:3004"
        : "https://plugins.tensorify.io";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        `${baseUrl}/api/plugins/search?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);
      clearTimeout(externalLoadingTimer);

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      const results = data.plugins?.slice(0, MAX_EXTERNAL_RESULTS) || [];

      setSearchState((prev) => ({
        ...prev,
        isSearching: false,
        isSearchingExternal: false,
        hasSearched: true,
        query,
        results,
        error: null,
      }));
    } catch (error) {
      console.error("External plugin search failed:", error);

      setSearchState((prev) => ({
        ...prev,
        isSearching: false,
        isSearchingExternal: false,
        hasSearched: true,
        query,
        results: [],
        error: error instanceof Error ? error.message : "Search failed",
      }));
    }
  }, []);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.length >= MIN_SEARCH_LENGTH) {
      searchExternalPlugins(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchExternalPlugins]);

  // Auto-close both sheets when drop is successful
  useEffect(() => {
    const handleDropSuccess = () => {
      setIsSheetOpen(false);
      setIsNestedSheetOpen(false);
    };

    setOnDropSuccessCallback(handleDropSuccess);

    // Cleanup: remove callback when component unmounts
    return () => {
      setOnDropSuccessCallback(() => {});
    };
  }, [setOnDropSuccessCallback]);

  const fetchInstalledPluginsWithDetails = useCallback(async () => {
    if (!currentWorkflow?.id) {
      setInstalledPlugins([]);
      return;
    }

    try {
      const response = await getWorkflowPlugins({
        params: { workflowId: currentWorkflow.id },
      });

      if (response.status === 200) {
        // Fetch plugin details for each installed plugin
        const pluginsWithDetails = await Promise.all(
          response.body.data.map(async (plugin: InstalledPlugin) => {
            try {
              // Parse plugin slug to extract details
              const slugMatch = plugin.slug.match(/^@([^/]+)\/([^:]+):(.+)$/);
              const name = slugMatch ? slugMatch[2] : plugin.slug;
              const version = slugMatch ? slugMatch[3] : "unknown";
              const authorName = slugMatch ? slugMatch[1] : "unknown";

              // Try to fetch description and pluginType from plugins API (if available)
              let description: string | null = null;
              let pluginType: string = "miscellaneous"; // Default value
              try {
                const isDevelopment = process.env.NODE_ENV === "development";
                const baseUrl = isDevelopment
                  ? "http://localhost:3004"
                  : "https://plugins.tensorify.io";
                const pluginResponse = await fetch(
                  `${baseUrl}/api/plugins/search?q=${encodeURIComponent(name)}`
                );
                const pluginData = await pluginResponse.json();

                // Find matching plugin by name and author
                const matchingPlugin = pluginData.plugins?.find(
                  (p: ExternalPlugin) =>
                    p.name === name && p.authorName === authorName
                );
                description = matchingPlugin?.description || null;
                pluginType = matchingPlugin?.pluginType || "miscellaneous";

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (error) {
                // Silently fail, use fallback description and pluginType
              }

              return {
                ...plugin,
                name,
                description,
                authorName,
                version,
                pluginType,
              };
            } catch (error) {
              console.error("Error processing plugin:", plugin.slug, error);
              return {
                ...plugin,
                name: plugin.slug,
                description: null,
                authorName: "unknown",
                version: "unknown",
                pluginType: "miscellaneous",
              };
            }
          })
        );

        setInstalledPlugins(pluginsWithDetails);
      } else {
        console.error("Failed to fetch installed plugins");
        setInstalledPlugins([]);
      }
    } catch (error) {
      console.error("Error fetching installed plugins:", error);
      setInstalledPlugins([]);
    }
  }, [currentWorkflow?.id]);

  // Fetch installed plugins with details when workflow changes
  useEffect(() => {
    fetchInstalledPluginsWithDetails();
  }, [currentWorkflow?.id, fetchInstalledPluginsWithDetails]);

  // Integrate installed plugins into defaultNodes categories based on pluginType
  const getNodesWithInstalledPlugins = (): NodeItem[] => {
    if (installedPlugins.length === 0) return defaultNodes;

    // Group installed plugins by their pluginType
    const pluginsByType = installedPlugins.reduce(
      (acc, plugin) => {
        const type = plugin.pluginType || "miscellaneous";
        if (!acc[type]) acc[type] = [];
        acc[type].push(plugin);
        return acc;
      },
      {} as Record<string, PluginWithDetails[]>
    );

    // Create updated defaultNodes with installed plugins integrated
    return defaultNodes.map((category) => {
      const categoryPlugins = pluginsByType[category.id] || [];

      if (categoryPlugins.length === 0) {
        return category; // No plugins for this category, return as is
      }

      // Convert plugins to NodeItems
      const pluginNodes = categoryPlugins.map((plugin) => ({
        id: plugin.slug,
        version: plugin.version,
        draggable: true,
        Icon: Package,
        title: `${plugin.name} (Installed)`,
        description:
          plugin.description ||
          `Installed plugin by ${plugin.authorName} (v${plugin.version})`,
      }));

      // Merge with existing children
      return {
        ...category,
        children: [...(category.children || []), ...pluginNodes],
        description: `${category.description} (${categoryPlugins.length} installed)`,
      };
    });
  };

  const handleParentClick = (item: NodeItem) => {
    if (item.children && item.children.length > 0) {
      setNestedContent({ title: item.title, items: item.children });
      setIsNestedSheetOpen(true);
      setNestedSearchTerm("");
    }
  };

  const handleMorePluginsClick = () => {
    const isDevelopment = process.env.NODE_ENV === "development";
    const baseUrl = isDevelopment
      ? "http://localhost:3004"
      : "https://plugins.tensorify.io";
    const url = `${baseUrl}/search?query=${encodeURIComponent(searchTerm)}`;
    window.open(url, "_blank");
  };

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    version?: string
  ) => {
    setDraggedNodeType(nodeType);
    setDraggedVersion(version || null);
    setIsDragging(true);
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  const handleInstallPlugin = async (plugin: ExternalPlugin) => {
    if (!currentWorkflow?.id) {
      toast.error("No workflow selected. Please select a workflow first.");
      return;
    }

    const pluginSlug = `${plugin.slug}`;

    console.log(pluginSlug);

    setInstallingPlugins((prev) => new Set(prev).add(plugin.id));

    try {
      const response = await postWorkflowPlugin({
        params: { workflowId: currentWorkflow.id },
        body: { slug: pluginSlug },
      });

      if (response.status === 201) {
        toast.success(`Plugin ${plugin.name} installed successfully!`);

        // Refresh installed plugins list with details
        const pluginsResponse = await getWorkflowPlugins({
          params: { workflowId: currentWorkflow.id },
        });
        if (pluginsResponse.status === 200) {
          // Re-fetch with details (trigger the useEffect)
          setInstalledPlugins([]);
        }

        // Auto-close the sheet and clear search
        setIsSheetOpen(false);
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setSearchState({
          isSearching: false,
          isSearchingExternal: false,
          hasSearched: false,
          query: "",
          results: [],
          error: null,
        });
      } else {
        toast.error(response.body.message || "Failed to install plugin");
      }
    } catch (error) {
      console.error("Error installing plugin:", error);
      toast.error("An unexpected error occurred while installing the plugin.");
    } finally {
      setInstallingPlugins((prev) => {
        const newSet = new Set(prev);
        newSet.delete(plugin.id);
        return newSet;
      });
    }
  };

  const handleUpdatePlugin = async (
    installedPlugin: PluginWithDetails,
    newVersion: string
  ) => {
    if (!currentWorkflow?.id) {
      toast.error("No workflow selected. Please select a workflow first.");
      return;
    }

    const newSlug = `@${installedPlugin.authorName}/${installedPlugin.name}:${newVersion}`;

    setUpdatingPlugins((prev) => new Set(prev).add(installedPlugin.id));

    try {
      const response = await putWorkflowPlugin({
        params: {
          workflowId: currentWorkflow.id,
          pluginId: installedPlugin.id,
        },
        body: { slug: newSlug },
      });

      if (response.status === 200) {
        toast.success(
          `Plugin ${installedPlugin.name} updated to v${newVersion}!`
        );
        fetchInstalledPluginsWithDetails(); // Refresh the list
      } else {
        toast.error(response.body.message || "Failed to update plugin");
      }
    } catch (error) {
      console.error("Error updating plugin:", error);
      toast.error("An unexpected error occurred while updating the plugin.");
    } finally {
      setUpdatingPlugins((prev) => {
        const newSet = new Set(prev);
        newSet.delete(installedPlugin.id);
        return newSet;
      });
    }
  };

  // Enhanced local search with professional algorithms
  const getLocalSearchResults = (query: string = debouncedSearchTerm) => {
    const nodesWithInstalledPlugins = getNodesWithInstalledPlugins();

    if (!query) {
      return {
        childrenMatches: [],
        parentMatches: nodesWithInstalledPlugins,
      };
    }

    const queryTerms = splitTerms(query);
    const allScoredChildren: ScoredNodeItem[] = [];
    const allScoredParents: ScoredNodeItem[] = [];

    // Score and collect all children and categories
    nodesWithInstalledPlugins.forEach((category) => {
      // Score the category itself
      const categoryScoreData = calculateNodeScore(category, query, queryTerms);
      if (categoryScoreData.score > 0 && categoryScoreData.matchesAllTerms) {
        allScoredParents.push({
          ...category,
          score: categoryScoreData.score,
          matchDetails: categoryScoreData.matchDetails,
        });
      }

      // Score the children
      if (category.children) {
        category.children.forEach((child) => {
          const childScoreData = calculateNodeScore(child, query, queryTerms);
          if (childScoreData.score > 0 && childScoreData.matchesAllTerms) {
            allScoredChildren.push({
              ...child,
              score: childScoreData.score,
              matchDetails: childScoreData.matchDetails,
            });
          }
        });
      }
    });

    // Apply smart filtering
    const filteredChildren = applySmartFiltering(allScoredChildren, queryTerms);
    const filteredParents = applySmartFiltering(allScoredParents, queryTerms);

    // Sort by score (highest first)
    const sortedChildren = filteredChildren.sort((a, b) => b.score - a.score);
    const sortedParents = filteredParents.sort((a, b) => b.score - a.score);

    // Group children back by categories for display
    const childrenMatches: (NodeItem & { children: ScoredNodeItem[] })[] = [];
    const childrenByCategory = new Map<string, ScoredNodeItem[]>();

    sortedChildren.forEach((child) => {
      // Find the parent category
      const parentCategory = nodesWithInstalledPlugins.find((cat) =>
        cat.children?.some((c) => c.id === child.id)
      );

      if (parentCategory) {
        if (!childrenByCategory.has(parentCategory.id)) {
          childrenByCategory.set(parentCategory.id, []);
        }
        childrenByCategory.get(parentCategory.id)!.push(child);
      }
    });

    // Convert back to the expected format
    childrenByCategory.forEach((children, categoryId) => {
      const category = nodesWithInstalledPlugins.find(
        (cat) => cat.id === categoryId
      );
      if (category) {
        childrenMatches.push({
          ...category,
          children,
        });
      }
    });

    return {
      childrenMatches,
      parentMatches: sortedParents.slice(0, 10), // Limit categories
    };
  };

  const localResults = getLocalSearchResults();
  const hasLocalResults =
    localResults.childrenMatches.length > 0 ||
    localResults.parentMatches.length > 0;

  // Enhanced nested search with professional algorithms
  const filteredNestedNodes = useMemo(() => {
    if (!nestedSearchTerm) return nestedContent.items;

    const queryTerms = splitTerms(nestedSearchTerm);
    if (queryTerms.length === 0) return nestedContent.items;

    // Score all nested items
    const scoredItems = nestedContent.items
      .map((item) => {
        const scoreData = calculateNodeScore(
          item,
          nestedSearchTerm,
          queryTerms
        );
        return scoreData.score > 0 && scoreData.matchesAllTerms
          ? {
              ...item,
              score: scoreData.score,
              matchDetails: scoreData.matchDetails,
            }
          : null;
      })
      .filter(Boolean) as ScoredNodeItem[];

    // Apply smart filtering and sort
    const filtered = applySmartFiltering(scoredItems, queryTerms);
    return filtered.sort((a, b) => b.score - a.score);
  }, [nestedSearchTerm, nestedContent.items]);

  // Determine what to show in search results
  const shouldShowExternalResults =
    debouncedSearchTerm.length >= MIN_SEARCH_LENGTH && searchState.hasSearched;

  const shouldShowExternalLoading =
    debouncedSearchTerm.length >= MIN_SEARCH_LENGTH &&
    (searchState.isSearching || searchState.isSearchingExternal) &&
    !searchState.hasSearched;

  return (
    <Panel position="top-right">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full backdrop-blur-sm bg-primary border-border/50 hover:bg-primary/90 shadow-sm transition-all duration-200 hover:scale-105"
          >
            <Plus className="size-6 text-primary-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md border-l border-border/50 backdrop-blur-xl bg-card/90 p-0 flex flex-col"
          showOverlay={false}
          onInteractOutside={(e) => {
            if (isNestedSheetOpen) {
              e.preventDefault();
            }
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold">Add Node</SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              Browse nodes and drag them to the canvas.
            </SheetDescription>
          </SheetHeader>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            isSearching={searchState.isSearching && !hasLocalResults}
          />
          <ScrollArea className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            <div className="flex flex-col gap-1 pb-3 px-3">
              {/* 1. Children matches with scoring (topmost - no divider) */}
              {localResults.childrenMatches.map((category) =>
                category.children?.map((item) => (
                  <div
                    key={`child-${item.id}`}
                    draggable={item.draggable}
                    onDragStart={(e) => onDragStart(e, item.id, item.version)}
                    onDragEnd={onDragEnd}
                    className={
                      item.draggable
                        ? "cursor-grab active:cursor-grabbing"
                        : "cursor-default"
                    }
                  >
                    <NodeListItem
                      item={item}
                      onClick={() => {}}
                      matchDetails={(item as ScoredNodeItem).matchDetails}
                    />
                  </div>
                ))
              )}

              {/* Divider before category matches */}
              {localResults.childrenMatches.length > 0 &&
                localResults.parentMatches.length > 0 && (
                  <div className="flex items-center gap-3 py-2 my-2">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-xs text-muted-foreground font-medium">
                      CATEGORY MATCHES
                    </span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                )}

              {/* 2. Category matches with scoring */}
              {localResults.parentMatches.map((item) => (
                <div
                  key={`parent-${item.id}`}
                  draggable={item.draggable}
                  onDragStart={(e) =>
                    item.draggable && onDragStart(e, item.id, item.version)
                  }
                  onDragEnd={onDragEnd}
                  className={
                    item.draggable
                      ? "cursor-grab active:cursor-grabbing"
                      : item.children && item.children.length > 0
                        ? "cursor-pointer"
                        : "cursor-default"
                  }
                >
                  <NodeListItem
                    item={item}
                    onClick={() => handleParentClick(item)}
                    matchDetails={(item as ScoredNodeItem).matchDetails}
                  />
                </div>
              ))}

              {/* External plugin results */}
              {shouldShowExternalLoading && (
                <>
                  {/* Divider before external loading (only if there are local results) */}
                  {hasLocalResults && (
                    <div className="flex items-center gap-3 py-2 my-2">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs text-muted-foreground font-medium">
                        SEARCHING EXTERNAL PLUGINS
                      </span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                  )}
                  <div className="text-center py-8 text-muted-foreground">
                    <LoadingSpinner className="mx-auto mb-3 text-primary-readable" />
                    <p className="text-sm">Searching plugins...</p>
                    <p className="text-xs mt-1 opacity-75">
                      Using advanced search for &ldquo;{debouncedSearchTerm}
                      &rdquo;
                    </p>
                  </div>
                </>
              )}

              {shouldShowExternalResults && searchState.results.length > 0 && (
                <>
                  {/* Divider before external results (only if there are local results) */}
                  {hasLocalResults && (
                    <div className="flex items-center gap-3 py-2 my-2">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs text-muted-foreground font-medium">
                        EXTERNAL PLUGINS ({searchState.results.length})
                      </span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                  )}

                  {/* Show section header if no local results */}
                  {!hasLocalResults && (
                    <div className="flex items-center gap-3 py-2 my-2">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs text-muted-foreground font-medium">
                        EXTERNAL PLUGINS ({searchState.results.length})
                      </span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                  )}

                  {searchState.results.map((plugin) => {
                    const isInstalling = installingPlugins.has(plugin.id);
                    const installedPlugin = installedPlugins.find(
                      (p) => p.name === plugin.name
                    );
                    const isUpdating =
                      installedPlugin &&
                      updatingPlugins.has(installedPlugin.id);

                    const canUpdate =
                      installedPlugin &&
                      semver.valid(plugin.version) &&
                      semver.valid(installedPlugin.version) &&
                      semver.gt(plugin.version, installedPlugin.version);

                    return (
                      <div
                        key={`external-${plugin.id}`}
                        className="group relative flex items-center gap-3.5 p-3 rounded-lg transition-colors duration-200 hover:bg-muted/70"
                      >
                        <div className="flex-shrink-0 bg-muted/40 rounded-md p-2.5 transition-colors duration-200 group-hover:bg-primary/10">
                          <ExternalLink className="h-5 w-5 text-primary-readable" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-foreground transition-colors duration-200 group-hover:text-primary-readable">
                            {plugin.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {plugin.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              by {plugin.authorName}
                            </p>
                            {plugin.pluginType && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <span className="text-xs bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-sm font-medium">
                                  {plugin.pluginType.replace("_", " ")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {installedPlugin ? (
                            canUpdate ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUpdatePlugin(
                                    installedPlugin,
                                    plugin.version
                                  )
                                }
                                disabled={isUpdating}
                                className="gap-1.5"
                              >
                                {isUpdating ? (
                                  <>
                                    <LoadingSpinner size="sm" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Update to v{plugin.version}
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="gap-1.5 bg-green-500/10 border-green-500/20 text-green-500"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Installed
                              </Button>
                            )
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleInstallPlugin(plugin)}
                              disabled={isInstalling}
                              className="gap-1.5"
                            >
                              {isInstalling ? (
                                <>
                                  <LoadingSpinner size="sm" />
                                  Installing...
                                </>
                              ) : (
                                <>
                                  <Download className="h-3.5 w-3.5" />
                                  Install
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const isDevelopment =
                                process.env.NODE_ENV === "development";
                              const baseUrl = isDevelopment
                                ? "http://localhost:3004"
                                : "https://plugins.tensorify.io";
                              window.open(
                                `${baseUrl}/plugins/${plugin.slug}`,
                                "_blank"
                              );
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {searchState.results.length === MAX_EXTERNAL_RESULTS && (
                    <Button
                      onClick={handleMorePluginsClick}
                      variant="outline"
                      className="w-full mt-2 gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      More Plugins
                    </Button>
                  )}
                </>
              )}

              {shouldShowExternalResults &&
                searchState.results.length === 0 &&
                !searchState.error && (
                  <>
                    {/* Divider before no results message (only if there are local results) */}
                    {hasLocalResults && (
                      <div className="flex items-center gap-3 py-2 my-2">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-xs text-muted-foreground font-medium">
                          EXTERNAL PLUGINS
                        </span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                    )}
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-2">
                        {hasLocalResults
                          ? `No external plugins found for "${debouncedSearchTerm}"`
                          : `No plugins found for "${debouncedSearchTerm}"`}
                      </p>
                      <Button
                        onClick={handleMorePluginsClick}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Search in Plugin Store
                      </Button>
                    </div>
                  </>
                )}

              {searchState.error && (
                <>
                  {/* Divider before error message (only if there are local results) */}
                  {hasLocalResults && (
                    <div className="flex items-center gap-3 py-2 my-2">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs text-muted-foreground font-medium">
                        EXTERNAL PLUGINS
                      </span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                  )}
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2 text-red-500">
                      {hasLocalResults
                        ? "External search failed"
                        : "Search failed"}
                    </p>
                    <p className="text-xs mb-3">{searchState.error}</p>
                    <Button
                      onClick={() => searchExternalPlugins(debouncedSearchTerm)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={isNestedSheetOpen} onOpenChange={setIsNestedSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md border-l border-border/50 backdrop-blur-xl bg-card/90 p-0 flex flex-col"
          showOverlay={false}
        >
          <SheetHeader className="p-4 border-b border-border/50">
            <button
              onClick={() => setIsNestedSheetOpen(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 -ml-1"
            >
              <ArrowLeft className="h-4 w-4" />
              All Categories
            </button>
            <SheetTitle className="text-xl font-semibold">
              {nestedContent.title}
            </SheetTitle>
          </SheetHeader>
          <SearchBar
            value={nestedSearchTerm}
            onChange={(e) => setNestedSearchTerm(e.target.value)}
          />
          <ScrollArea className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            <div className="flex flex-col gap-1 p-3">
              {filteredNestedNodes.map((item) => (
                <div
                  key={item.id}
                  draggable={item.draggable}
                  onDragStart={(e) => onDragStart(e, item.id, item.version)}
                  onDragEnd={onDragEnd}
                  className={
                    item.draggable
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-default"
                  }
                >
                  <NodeListItem
                    item={item}
                    onClick={() => {}}
                    matchDetails={(item as ScoredNodeItem).matchDetails}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </Panel>
  );
}
