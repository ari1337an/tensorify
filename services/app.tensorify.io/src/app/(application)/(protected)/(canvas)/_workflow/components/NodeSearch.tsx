"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Panel } from "@xyflow/react";
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
} from "lucide-react";
import defaultNodes from "../data/defaultNodes";
import { type NodeItem } from "../types/NodeItem";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { useDragDrop } from "../context/DragDropContext";
import { toast } from "sonner";
import {
  postWorkflowPlugin,
  getWorkflowPlugins,
} from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

type ExternalPlugin = {
  id: string;
  name: string;
  description: string;
  slug: string;
  authorName: string;
  tags: string | null;
  pluginType: string;
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

const NodeListItem = ({
  item,
  onClick,
}: {
  item: NodeItem;
  onClick: () => void;
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
        <p className="font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      {item.children && item.children.length > 0 && (
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      )}
    </div>
  );
};

const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="px-3 sticky top-0 z-10">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
  const [nestedSearchTerm, setNestedSearchTerm] = useState("");
  const [externalPlugins, setExternalPlugins] = useState<ExternalPlugin[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [installingPlugins, setInstallingPlugins] = useState<Set<string>>(
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

  // Fetch installed plugins with details when workflow changes
  useEffect(() => {
    const fetchInstalledPluginsWithDetails = async () => {
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
    };

    fetchInstalledPluginsWithDetails();
  }, [currentWorkflow?.id]);

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

  // Search external plugins when no local results
  useEffect(() => {
    const searchExternalPlugins = async () => {
      if (!searchTerm.trim()) {
        setExternalPlugins([]);
        return;
      }

      const localResults = getLocalSearchResults();
      const hasAnyLocalResults =
        localResults.childrenMatches.length > 0 ||
        localResults.installedPluginsCategory ||
        localResults.parentMatches.length > 0;

      if (hasAnyLocalResults) {
        setExternalPlugins([]);
        return;
      }

      setIsSearchingExternal(true);
      try {
        const isDevelopment = process.env.NODE_ENV === "development";
        const baseUrl = isDevelopment
          ? "http://localhost:3004"
          : "https://plugins.tensorify.io";
        const response = await fetch(
          `${baseUrl}/api/plugins/search?q=${encodeURIComponent(searchTerm)}`
        );
        const data = await response.json();
        setExternalPlugins(data.plugins?.slice(0, 10) || []);
      } catch (error) {
        console.error("Failed to search external plugins:", error);
        setExternalPlugins([]);
      } finally {
        setIsSearchingExternal(false);
      }
    };

    const debounceTimer = setTimeout(searchExternalPlugins, 300);
    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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

  const matchSearch = (text: string, search: string) =>
    text.toLowerCase().includes(search.toLowerCase());

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

        // Auto-close the sheet
        setIsSheetOpen(false);
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

  const getLocalSearchResults = () => {
    // Get nodes with installed plugins integrated into their appropriate categories
    const nodesWithInstalledPlugins = getNodesWithInstalledPlugins();

    if (!searchTerm)
      return {
        childrenMatches: [],
        installedPluginsCategory: null, // No longer needed as plugins are integrated
        parentMatches: nodesWithInstalledPlugins,
      };

    const lowercasedFilter = searchTerm.toLowerCase();
    const parentMatches: NodeItem[] = [];
    const childrenMatches: NodeItem[] = [];

    // Search integrated nodes (default nodes + installed plugins)
    nodesWithInstalledPlugins.forEach((category) => {
      const categoryMatches =
        matchSearch(category.title, lowercasedFilter) ||
        matchSearch(category.description, lowercasedFilter);

      const matchingChildren =
        category.children?.filter(
          (child) =>
            matchSearch(child.title, lowercasedFilter) ||
            matchSearch(child.description, lowercasedFilter)
        ) || [];

      if (categoryMatches) {
        parentMatches.push(category);
      }

      if (matchingChildren.length > 0) {
        childrenMatches.push({
          ...category,
          children: matchingChildren,
        });
      }
    });

    return {
      childrenMatches,
      installedPluginsCategory: null, // No longer needed as plugins are integrated
      parentMatches,
    };
  };

  const localResults = getLocalSearchResults();
  const hasLocalResults =
    localResults.childrenMatches.length > 0 ||
    localResults.installedPluginsCategory ||
    localResults.parentMatches.length > 0;

  // Count non-empty sections for divider logic
  const nonEmptySections = [
    localResults.childrenMatches.length > 0,
    !!localResults.installedPluginsCategory,
    localResults.parentMatches.length > 0,
  ].filter(Boolean).length;

  const filteredNestedNodes = useMemo(() => {
    if (!nestedSearchTerm) return nestedContent.items;
    return nestedContent.items.filter(
      (item) =>
        matchSearch(item.title, nestedSearchTerm) ||
        matchSearch(item.description, nestedSearchTerm)
    );
  }, [nestedSearchTerm, nestedContent.items]);

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
          />
          <ScrollArea className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            <div className="flex flex-col gap-1 pb-3 px-3">
              {/* 1. Children matches (topmost - no divider) */}
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
                    <NodeListItem item={item} onClick={() => {}} />
                  </div>
                ))
              )}

              {/* Divider before installed plugins (only if children exist and installed plugins exist) */}
              {localResults.childrenMatches.length > 0 &&
                localResults.installedPluginsCategory &&
                nonEmptySections > 1 && (
                  <div className="flex items-center gap-3 py-2 my-2">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-xs text-muted-foreground font-medium">
                      INSTALLED PLUGINS
                    </span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                )}

              {/* 2. Installed Plugins Category */}
              {localResults.installedPluginsCategory && (
                <div className="cursor-pointer">
                  <NodeListItem
                    item={localResults.installedPluginsCategory}
                    onClick={() =>
                      handleParentClick(localResults.installedPluginsCategory!)
                    }
                  />
                </div>
              )}

              {/* Divider before category matches (only if there are sections above and category matches exist) */}
              {(localResults.childrenMatches.length > 0 ||
                localResults.installedPluginsCategory) &&
                localResults.parentMatches.length > 0 &&
                nonEmptySections > 1 && (
                  <div className="flex items-center gap-3 py-2 my-2">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-xs text-muted-foreground font-medium">
                      CATEGORY MATCHES
                    </span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                )}

              {/* 3. Category matches */}
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
                  />
                </div>
              ))}

              {/* External plugin results */}
              {!hasLocalResults && (
                <>
                  {isSearchingExternal && (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      Searching plugins...
                    </div>
                  )}

                  {!isSearchingExternal && externalPlugins.length > 0 && (
                    <>
                      <div className="flex items-center gap-3 py-2 my-2">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-xs text-muted-foreground font-medium">
                          EXTERNAL PLUGINS
                        </span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                      {externalPlugins.map((plugin) => {
                        const isInstalling = installingPlugins.has(plugin.id);
                        return (
                          <div
                            key={`external-${plugin.id}`}
                            className="group relative flex items-center gap-3.5 p-3 rounded-lg transition-colors duration-200 hover:bg-muted/70"
                          >
                            <div className="flex-shrink-0 bg-muted/40 rounded-md p-2.5 transition-colors duration-200 group-hover:bg-primary/10">
                              <ExternalLink className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleInstallPlugin(plugin)}
                                disabled={isInstalling}
                                className="gap-1.5"
                              >
                                {isInstalling ? (
                                  <>
                                    <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
                                    Installing...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3.5 w-3.5" />
                                    Install
                                  </>
                                )}
                              </Button>
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

                      {externalPlugins.length == 10 && (
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

                  {!isSearchingExternal &&
                    externalPlugins.length === 0 &&
                    searchTerm && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-2">No results found</p>
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
                    )}
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
                  <NodeListItem item={item} onClick={() => {}} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </Panel>
  );
}
