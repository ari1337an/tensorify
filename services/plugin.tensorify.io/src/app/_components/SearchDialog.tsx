"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Search, Command, ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePluginSearch } from "@/app/_hooks/use-plugin-search";
import { useDebounce } from "@/app/_hooks/use-debounce";

interface SearchPlugin {
  id: string;
  name: string;
  description: string;
  slug: string;
  authorName: string;
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = usePluginSearch(debouncedSearch);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  const handleClose = () => onOpenChange(false);

  const handleSelectPlugin = (slug: string) => {
    router.push(`/plugins/${slug}`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-2xl p-0 overflow-hidden border-none bg-background/80 shadow-xl backdrop-blur-xl
                  ring-4 ring-purple-500/30 dark:ring-purple-400/20
                  shadow-purple-500/5
                  rounded-2xl"
        closeButton={false}
      >
        <DialogTitle className="sr-only">Search Plugins</DialogTitle>

        {/* Search Header */}
        <div className="flex items-center border-b border-border/40 px-4">
          <div className="flex items-center gap-2 py-4 mr-2">
            <Command className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              Search
            </span>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-8 py-4 text-sm focus:outline-none placeholder:text-muted-foreground/70"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 pl-4 flex-shrink-0">
            <kbd className="hidden sm:flex items-center gap-1 rounded border bg-muted/50 px-2 py-1 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="relative max-h-[60vh] overflow-y-auto px-2">
          {/* Loading State */}
          {isLoading && (
            <div className="py-14 px-4 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !search && (
            <div className="py-14 px-4 text-center">
              <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground/80 text-sm">
                Search for plugins by name, author, or description
              </p>
            </div>
          )}

          {/* Results List */}
          {!isLoading && data?.plugins?.length > 0 && (
            <div className="py-2 px-2">
              {data.plugins.map((plugin: SearchPlugin) => (
                <button
                  key={plugin.id}
                  onClick={() => handleSelectPlugin(plugin.slug)}
                  className="w-full flex items-center gap-4 rounded-lg p-3 text-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Command className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{plugin.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {plugin.description}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">
                      by {plugin.authorName}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && search && data?.plugins?.length === 0 && (
            <div className="py-14 px-4 text-center">
              <p className="text-muted-foreground/80 text-sm">
                No plugins found for &quot;{search}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-2 border-t border-border/40">
          <div className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
            <span className="font-medium">Pro tip:</span> Use arrow keys to
            navigate, Enter to select
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
