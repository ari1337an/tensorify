"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Badge } from "@/app/_components/ui/badge";
import { Loader2, Package, Search, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getWorkflowPlugins,
  postWorkflowPlugin,
  deleteWorkflowPlugin,
} from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";
import { format } from "timeago.js";

interface InstalledPlugin {
  id: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PluginManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PluginManagementDialog({
  isOpen,
  onClose,
}: PluginManagementDialogProps) {
  const { currentWorkflow } = useStore();
  const [activeTab, setActiveTab] = useState("installed");

  // Installed plugins state
  const [installedPlugins, setInstalledPlugins] = useState<InstalledPlugin[]>(
    []
  );
  const [isLoadingPlugins, setIsLoadingPlugins] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Install plugin state
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugError, setSlugError] = useState("");
  const [isInstallingPlugin, setIsInstallingPlugin] = useState(false);

  // Plugin slug validation regex
  const slugRegex = /^@[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+:(latest|[\w\-\.]+)$/;

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);

    if (!newSlug) {
      setSlugError("");
      return;
    }

    if (!slugRegex.test(newSlug)) {
      setSlugError("Invalid plugin format. Use: @username/plugin:version");
    } else {
      setSlugError("");
    }
  };

  const fetchInstalledPlugins = useCallback(async () => {
    if (!currentWorkflow?.id) return;

    setIsLoadingPlugins(true);
    try {
      const response = await getWorkflowPlugins({
        params: { workflowId: currentWorkflow.id },
      });

      if (response.status === 200) {
        setInstalledPlugins(response.body.data);
      } else {
        toast.error("Failed to fetch installed plugins");
      }
    } catch (error) {
      console.error("Error fetching plugins:", error);
      toast.error("Failed to fetch installed plugins");
    } finally {
      setIsLoadingPlugins(false);
    }
  }, [currentWorkflow?.id]);

  const handleInstallPlugin = async () => {
    if (!currentWorkflow?.id) {
      toast.error("No workflow selected. Please select a workflow first.");
      return;
    }

    if (!slug || slugError) {
      toast.error("Please provide a valid plugin slug");
      return;
    }

    setIsInstallingPlugin(true);

    try {
      const response = await postWorkflowPlugin({
        params: { workflowId: currentWorkflow.id },
        body: {
          slug,
          ...(description.trim() && { description: description.trim() }),
        },
      });

      if (response.status === 201) {
        toast.success(`Plugin ${slug} installed successfully!`);
        setSlug("");
        setDescription("");
        setSlugError("");

        // Refresh the installed plugins list
        await fetchInstalledPlugins();

        // Switch to installed tab to show the new plugin
        setActiveTab("installed");
      } else {
        toast.error(response.body.message || "Failed to install plugin");
      }
    } catch (error) {
      console.error("Error installing plugin:", error);
      toast.error("An unexpected error occurred while installing the plugin.");
    } finally {
      setIsInstallingPlugin(false);
    }
  };

  const handleDeletePlugin = async (pluginId: string, pluginSlug: string) => {
    if (!currentWorkflow?.id) {
      toast.error("No workflow selected. Please select a workflow first.");
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to uninstall "${pluginSlug}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteWorkflowPlugin({
        params: {
          workflowId: currentWorkflow.id,
          pluginId: pluginId,
        },
      });

      if (response.status === 200) {
        toast.success(`Plugin ${pluginSlug} uninstalled successfully!`);

        // Refresh the installed plugins list
        await fetchInstalledPlugins();
      } else {
        toast.error(response.body.message || "Failed to uninstall plugin");
      }
    } catch (error) {
      console.error("Error uninstalling plugin:", error);
      toast.error(
        "An unexpected error occurred while uninstalling the plugin."
      );
    }
  };

  // Filter plugins based on search term
  const filteredPlugins = installedPlugins.filter((plugin) =>
    plugin.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Extract plugin name and version from slug
  const parsePluginSlug = (slug: string) => {
    const match = slug.match(/^@([^/]+)\/([^:]+):(.+)$/);
    if (match) {
      return {
        username: match[1],
        name: match[2],
        version: match[3],
        displayName: `${match[1]}/${match[2]}`,
      };
    }
    return {
      username: "",
      name: slug,
      version: "",
      displayName: slug,
    };
  };

  // Format creation date
  const formatDate = (dateString: string) => {
    return format(dateString);
  };

  // Fetch plugins when dialog opens
  useEffect(() => {
    if (isOpen && currentWorkflow?.id) {
      fetchInstalledPlugins();
    }
  }, [isOpen, currentWorkflow?.id, fetchInstalledPlugins]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSlug("");
      setDescription("");
      setSlugError("");
      setSearchTerm("");
      setActiveTab("installed");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            Plugin Management
          </DialogTitle>
          <DialogDescription>
            Manage plugins for {currentWorkflow?.name || "this workflow"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="installed" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Installed Plugins
              {installedPlugins.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {installedPlugins.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="install" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Install Plugin
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="installed"
            className="flex-1 flex flex-col space-y-4"
          >
            {/* Search Bar */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plugins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInstalledPlugins}
                disabled={isLoadingPlugins}
              >
                {isLoadingPlugins ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {/* Plugins Table */}
            <div className="flex-1 overflow-auto border rounded-md">
              {isLoadingPlugins ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading plugins...
                </div>
              ) : filteredPlugins.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? "No plugins found" : "No plugins installed"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? `No plugins match "${searchTerm}"`
                      : "This workflow doesn't have any plugins installed yet."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setActiveTab("install")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Install Your First Plugin
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plugin</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Installed</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlugins.map((plugin) => {
                      const parsed = parsePluginSlug(plugin.slug);
                      return (
                        <TableRow key={plugin.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {parsed.displayName}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {plugin.slug}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {plugin.description ? (
                                <span className="text-sm text-muted-foreground">
                                  {plugin.description}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">
                                  No description
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                parsed.version === "latest"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {parsed.version}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(plugin.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              title="Uninstall Plugin"
                              onClick={() =>
                                handleDeletePlugin(plugin.id, plugin.slug)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="install" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Plugin Slug</Label>
                <Input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="@johndoe/conv2d:5.0.2"
                  disabled={isInstallingPlugin}
                />
                {slugError && (
                  <p className="text-sm text-red-500">{slugError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Examples: @johndoe/conv2d:5.0.2, @johndoe/dropout:latest
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what this plugin does..."
                  disabled={isInstallingPlugin}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  Add a description to help identify this plugin's purpose (max
                  500 characters)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleInstallPlugin}
                  disabled={!slug || !!slugError || isInstallingPlugin}
                  className="flex-1"
                >
                  {isInstallingPlugin ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Install Plugin
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Plugin Format</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Must start with @ followed by username</li>
                <li>• Plugin name after /</li>
                <li>
                  • Version after : (can be &quot;latest&quot; or specific
                  version)
                </li>
                <li>• Example: @johndoe/conv2d:5.0.2</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
