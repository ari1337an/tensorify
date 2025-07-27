"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Package, SlidersHorizontal, Loader2 } from "lucide-react";
import { TagInput } from "@/app/_components/ui/TagInput";
import { useAdvancedSearch } from "@/app/_hooks/use-advanced-search";
import SearchResultCard from "@/app/_components/SearchResultCard";

type SearchResultPlugin = {
  id: string;
  name: string;
  description: string;
  slug: string;
  authorName: string;
  tags: string | null;
  sdkVersion: string;
  createdAt: Date;
  updatedAt: Date;
  githubUrl: string;
  isPublic: boolean;
  status: string;
  pluginType: string;
  version: string;
  releaseTag: string | null;
  authorId: string;
  sha: string | null;
  readme: string | null;
};

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (searchQuery.trim()) {
      current.set("query", searchQuery);
    } else {
      current.delete("query");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    if (query !== `?${searchParams.toString()}`) {
      router.replace(`${pathname}${query}`, { scroll: false });
    }
  }, [searchQuery, searchParams, router, pathname]);

  const handleApplyFilters = () => {
    console.log({
      tags,
      searchQuery,
      sortBy,
    });
  };

  const { data: searchResults, isLoading: isSearching } = useAdvancedSearch({
    query: searchQuery,
    sortBy,
    tags,
    version: "",
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 p-6 border-b border-border/60">
          <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
            Search Plugins
          </h1>
          <p className="text-muted-foreground">
            Find the perfect plugin for your Tensorify workspace
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg 
                         transition-shadow duration-300 border border-border p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Sort By
                </label>
                <select
                  className="w-full bg-card border border-border rounded-lg py-2 px-3
                             hover:shadow-md transition-shadow duration-300"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Search Relevance</option>
                  <option value="updated">Recently Updated</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Tags</label>
                <TagInput
                  value={tags}
                  onChange={setTags}
                  placeholder="Add tags to filter..."
                  name="search-tags"
                />
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plugins..."
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg 
                             hover:shadow-md transition-shadow duration-300"
                />
              </div>
            </div>

            <div
              className="flex items-center justify-between mb-6 p-4 
                            bg-card rounded-lg shadow-md border border-border
                            transition-shadow duration-300"
            >
              <div className="text-sm text-muted-foreground">
                Showing {searchResults?.plugins.length || 0} results
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>Total Plugins: {searchResults?.total || 0}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {isSearching ? (
                <div
                  className="text-center text-muted-foreground py-12 md:col-span-2 
                              bg-card rounded-lg shadow-md border border-border
                              transition-shadow duration-300"
                >
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Searching plugins...</p>
                </div>
              ) : searchResults?.plugins.length ? (
                searchResults.plugins.map((plugin: SearchResultPlugin) => {
                  const pluginWithDates = {
                    ...plugin,
                    createdAt: new Date(plugin.createdAt),
                    updatedAt: new Date(plugin.updatedAt),
                  };
                  return (
                    <SearchResultCard
                      key={plugin.id}
                      plugin={pluginWithDates}
                    />
                  );
                })
              ) : (
                <div
                  className="text-center text-muted-foreground py-12 md:col-span-2 
                              bg-card rounded-lg shadow-md border border-border
                              transition-shadow duration-300"
                >
                  No plugins found. Try adjusting your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
