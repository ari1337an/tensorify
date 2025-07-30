// Shared search utilities for plugin search functionality
import * as semver from "semver";

export type ScoreData = {
  score: number;
  matchingTerms: number;
  totalTerms: number;
  hasExactMatch: boolean;
  matchDetails: {
    field: string;
    type: "exact" | "fuzzy" | "stem" | "proximity";
    snippet: string;
  }[];
};

export type PluginSearchResult = {
  id: string;
  name: string;
  description: string;
  slug: string;
  authorName: string;
  tags: string | null;
  pluginType: string;
  createdAt: Date;
  updatedAt: Date;
  _searchMeta?: {
    score: number;
    matchDetails: ScoreData["matchDetails"];
  };
};

// Search configuration constants
export const SEARCH_CONFIG = {
  MIN_TERM_LENGTH: 2,
  PROXIMITY_WINDOW: 3,
  RECENCY_BONUS_DAYS: 30,
  HIGH_QUALITY_THRESHOLD: 0.7,
  MATCH_THRESHOLD: 0.6,
  MIN_TERM_THRESHOLD: 0.5,
  MAX_MATCH_DETAILS: 3,
} as const;

// Common English stop words including domain-specific terms
export const STOP_WORDS = new Set([
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
  "the",
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
  "plugin",
  "tensorify",
  "pytorch",
  "ml",
  "ai",
  "model",
  "neural",
  "network",
]);

// Simple stemmer for basic word variations
export function simpleStem(word: string): string {
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
export function levenshteinDistance(str1: string, str2: string): number {
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
export function isFuzzyMatch(
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
export function isStemMatch(searchTerm: string, text: string): boolean {
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
export function calculateProximityScore(
  searchTerms: string[],
  text: string
): number {
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
export function calculateTermFrequency(term: string, text: string): number {
  const words = text.toLowerCase().split(/[\s-_]+/);
  const termCount = words.filter((word) => word.includes(term)).length;
  return termCount / words.length;
}

// Extract meaningful snippet around matches
export function extractSnippet(
  text: string,
  searchTerm: string,
  maxLength: number = 100
): string {
  const lowerText = text.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerTerm);

  if (index === -1) return text.substring(0, maxLength);

  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + lowerTerm.length + 20);

  let snippet = text.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}

// Function to safely split and trim search terms, removing stop words
export function splitTerms(input: string): string[] {
  return input
    .split(/[\s,]+/) // Split by spaces and commas
    .map((term) => term.trim().toLowerCase())
    .filter(
      (term) =>
        term.length > SEARCH_CONFIG.MIN_TERM_LENGTH && !STOP_WORDS.has(term)
    );
}

// Calculate recency boost score
export function calculateRecencyBoost(updatedAt: Date): number {
  const daysSinceUpdate =
    (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate <= SEARCH_CONFIG.RECENCY_BONUS_DAYS
    ? Math.max(0, 20 - daysSinceUpdate)
    : 0;
}

// Main scoring function for plugins
export function calculatePluginScore(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugin: any,
  query: string,
  searchTerms: string[],
  options: {
    includeReadme?: boolean;
    fieldWeights?: {
      name: { exact: number; term: number };
      description: { exact: number; term: number };
      tags: { exact: number; term: number };
      slug: { exact: number; term: number };
      readme?: { exact: number; term: number };
    };
  } = {}
): ScoreData {
  const {
    includeReadme = false,
    fieldWeights = {
      name: { exact: 100, term: 20 },
      description: { exact: 80, term: 15 },
      tags: { exact: 60, term: 10 },
      slug: { exact: 40, term: 5 },
      readme: { exact: 30, term: 3 },
    },
  } = options;

  let score = 0;
  const searchText = query.toLowerCase();
  const matchDetails: ScoreData["matchDetails"] = [];

  // Extract field values
  const fields = {
    name: plugin.name.toLowerCase(),
    description: plugin.description.toLowerCase(),
    tags: (plugin.tags || "").toLowerCase(),
    slug: plugin.slug.toLowerCase(),
    readme: includeReadme ? (plugin.readme || "").toLowerCase() : "",
  };

  // Recency boost
  score += calculateRecencyBoost(new Date(plugin.updatedAt));

  // Exact full query matches (highest priority)
  Object.entries(fields).forEach(([fieldName, fieldValue]) => {
    if (fieldValue && fieldValue.includes(searchText)) {
      const weight = fieldWeights[fieldName as keyof typeof fieldWeights];
      if (weight) {
        score += weight.exact;
        matchDetails.push({
          field: fieldName,
          type: "exact",
          snippet: extractSnippet(plugin[fieldName] || fieldValue, searchText),
        });
      }
    }
  });

  // Phrase proximity bonus
  score += calculateProximityScore(searchTerms, fields.name) * 2;
  score += calculateProximityScore(searchTerms, fields.description) * 1.5;

  // Individual term matching with AND logic
  const termMatches = new Map<string, Set<string>>(); // term -> set of fields that matched

  searchTerms.forEach((term) => {
    termMatches.set(term, new Set());

    Object.entries(fields).forEach(([fieldName, fieldValue]) => {
      if (!fieldValue) return;

      const weight = fieldWeights[fieldName as keyof typeof fieldWeights];
      if (!weight) return;

      // Exact matches
      if (fieldValue.includes(term)) {
        const tf = calculateTermFrequency(term, fieldValue);
        score += weight.term + tf * Math.floor(weight.term / 2);
        termMatches.get(term)!.add(fieldName);
        matchDetails.push({
          field: fieldName,
          type: "exact",
          snippet: extractSnippet(plugin[fieldName] || fieldValue, term),
        });
      }
      // Fuzzy matches
      else if (isFuzzyMatch(term, fieldValue)) {
        score += Math.floor(weight.term * 0.75);
        termMatches.get(term)!.add(fieldName);
        matchDetails.push({
          field: fieldName,
          type: "fuzzy",
          snippet: extractSnippet(plugin[fieldName] || fieldValue, term),
        });
      }
      // Stem matches
      else if (isStemMatch(term, fieldValue)) {
        score += Math.floor(weight.term * 0.6);
        termMatches.get(term)!.add(fieldName);
        matchDetails.push({
          field: fieldName,
          type: "stem",
          snippet: extractSnippet(plugin[fieldName] || fieldValue, term),
        });
      }
    });
  });

  // AND Logic: Check if ALL terms have at least one match
  const allTermsMatched = searchTerms.every(
    (term) => termMatches.get(term)!.size > 0
  );

  // If not all terms matched, return zero score (AND logic)
  if (!allTermsMatched) {
    return {
      score: 0,
      matchingTerms: 0,
      totalTerms: searchTerms.length,
      hasExactMatch: false,
      matchDetails: [],
    };
  }

  // Calculate total unique matches
  const matchingTerms = Array.from(termMatches.values()).filter(
    (fields) => fields.size > 0
  ).length;

  // Bonus for matching multiple terms
  if (matchingTerms > 1) {
    score += matchingTerms * 10;
  }

  // Prioritization bonus: name > description > tags > slug > readme
  const fieldPriorities = {
    name: 50,
    description: 25,
    tags: 15,
    slug: 10,
    readme: 5,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  termMatches.forEach((fields, term) => {
    fields.forEach((fieldName) => {
      const priority =
        fieldPriorities[fieldName as keyof typeof fieldPriorities] || 0;
      score += priority;
    });
  });

  // Bonus for high match percentage
  const fieldCount = includeReadme ? 5 : 4;
  const matchPercentage = matchingTerms / (searchTerms.length * fieldCount);
  score += matchPercentage * 50;

  return {
    score,
    matchingTerms,
    totalTerms: searchTerms.length,
    hasExactMatch: Object.values(fields).some(
      (field) => field && field.includes(searchText)
    ),
    matchDetails,
  };
}

// Smart filtering logic for search results
export function applySmartFiltering<T extends { scoreData: ScoreData }>(
  scoredPlugins: T[],
  queryTerms: string[]
): T[] {
  if (scoredPlugins.length === 0) return [];

  const maxMatchingTerms = Math.max(
    ...scoredPlugins.map((p) => p.scoreData.matchingTerms)
  );
  const hasHighQualityMatches =
    maxMatchingTerms >=
    Math.ceil(queryTerms.length * SEARCH_CONFIG.HIGH_QUALITY_THRESHOLD);

  if (hasHighQualityMatches && scoredPlugins.length > 1) {
    const highQualityThreshold = Math.max(
      maxMatchingTerms * SEARCH_CONFIG.MATCH_THRESHOLD,
      Math.ceil(queryTerms.length * SEARCH_CONFIG.MIN_TERM_THRESHOLD)
    );

    return scoredPlugins.filter(
      (plugin) =>
        plugin.scoreData.matchingTerms >= highQualityThreshold ||
        plugin.scoreData.hasExactMatch
    );
  }

  return scoredPlugins;
}

// Get the latest version of each plugin using semantic versioning
function deduplicatePlugins<
  T extends { slug: string; version: string; updatedAt: Date },
>(plugins: T[]): T[] {
  // Group plugins by their base slug (e.g., '@author/plugin-name')
  const groupedByBaseSlug = plugins.reduce(
    (acc, plugin) => {
      const baseSlug = plugin.slug.split(":")[0];
      if (!acc[baseSlug]) {
        acc[baseSlug] = [];
      }
      acc[baseSlug].push(plugin);
      return acc;
    },
    {} as Record<string, T[]>
  );

  // For each group, find the plugin with the latest version
  return Object.values(groupedByBaseSlug).map((group) => {
    return group.reduce((latest, current) => {
      // Fallback to updatedAt if version comparison is not possible
      if (
        !semver.valid(latest.version) ||
        !semver.valid(current.version) ||
        semver.eq(latest.version, current.version)
      ) {
        return new Date(latest.updatedAt) > new Date(current.updatedAt)
          ? latest
          : current;
      }
      // Compare versions using semver
      return semver.gt(latest.version, current.version) ? latest : current;
    });
  });
}

// Process search results with scoring and filtering
export function processSearchResults(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: any[],
  query: string,
  options: {
    includeReadme?: boolean;
    limit?: number;
    includeSearchMeta?: boolean;
    deduplicate?: boolean; // New option to control deduplication
  } = {}
): {
  plugins: PluginSearchResult[];
  searchMeta?: {
    query: string;
    processedTerms: string[];
    totalResults: number;
  };
} {
  const {
    includeReadme = false,
    limit = 5,
    includeSearchMeta = true,
    deduplicate = false, // Default to false to avoid breaking existing behavior
  } = options;

  if (!query.trim()) {
    const results = deduplicate ? deduplicatePlugins(plugins) : plugins;
    return {
      plugins: results.slice(0, limit).map((plugin) => ({
        ...plugin,
        createdAt: new Date(plugin.createdAt),
        updatedAt: new Date(plugin.updatedAt),
      })),
    };
  }

  const queryTerms = splitTerms(query);

  // Score all plugins
  const scoredPlugins = plugins
    .map((plugin) => ({
      ...plugin,
      scoreData: calculatePluginScore(plugin, query, queryTerms, {
        includeReadme,
      }),
    }))
    .filter((plugin) => plugin.scoreData.score > 0);

  // Apply smart filtering
  const filteredPlugins = applySmartFiltering(scoredPlugins, queryTerms);

  // Deduplicate if requested, must happen before sorting and limiting
  const uniquePlugins = deduplicate
    ? deduplicatePlugins(filteredPlugins)
    : filteredPlugins;

  // Sort by score and apply limit
  const finalPlugins = uniquePlugins
    .sort((a, b) => b.scoreData.score - a.scoreData.score)
    .slice(0, limit)
    .map(({ scoreData, ...plugin }) => ({
      ...plugin,
      createdAt: new Date(plugin.createdAt),
      updatedAt: new Date(plugin.updatedAt),
      _searchMeta: {
        score: scoreData.score,
        matchDetails: scoreData.matchDetails.slice(
          0,
          SEARCH_CONFIG.MAX_MATCH_DETAILS
        ),
      },
    }));

  const result: ReturnType<typeof processSearchResults> = {
    plugins: finalPlugins,
  };

  if (includeSearchMeta) {
    result.searchMeta = {
      query,
      processedTerms: queryTerms,
      totalResults: uniquePlugins.length,
    };
  }

  return result;
}
