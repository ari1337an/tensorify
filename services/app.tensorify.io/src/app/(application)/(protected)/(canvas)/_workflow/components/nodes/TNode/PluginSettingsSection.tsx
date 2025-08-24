import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/ui/collapsible";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/app/_components/ui/badge";
import { SettingsField } from "./SettingsField";
import useWorkflowStore from "../../../store/workflowStore";
import useAppStore from "@/app/_store/store";
import type {
  SettingsFieldSchema as _SF,
  SettingsGroupSchema as _SG,
} from "@tensorify.io/sdk/contracts";
type SettingsFieldType = import("zod").infer<typeof _SF>;
type SettingsGroup = import("zod").infer<typeof _SG>;
import type { WorkflowNode } from "../../../store/workflowStore";
import type { PluginManifest } from "@/app/_store/store";

interface PluginSettingsSectionProps {
  nodeId: string;
  onSettingsChange: (key: string, value: any) => void;
}

export function PluginSettingsSection({
  nodeId,
  onSettingsChange,
}: PluginSettingsSectionProps) {
  // Get node data from the workflow store
  const nodes = useWorkflowStore((state) => state.nodes);
  const node = nodes.find((n) => n.id === nodeId);

  // Get plugin manifests from the global store
  const pluginManifests = useAppStore((state) => state.pluginManifests);

  // Find the manifest for this plugin node
  const manifest = useMemo(() => {
    if (!node) return null;

    const pluginId = node.data.pluginId || node.type || nodeId;
    const found = pluginManifests.find(
      (p) => p.slug === pluginId || p.id === pluginId || p.slug === node.type
    );

    return found;
  }, [pluginManifests, node, nodeId]);

  // Get current plugin settings from node data
  const pluginSettings = (node?.data.pluginSettings || {}) as Record<
    string,
    any
  >;
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set()
  );

  // Early return if no plugin manifest
  if (
    !manifest?.manifest ||
    !Array.isArray(
      (manifest.manifest as any)?.frontendConfigs?.settingsFields
    ) ||
    (manifest.manifest as any).frontendConfigs.settingsFields.length === 0
  ) {
    return null;
  }

  const settingsFields = (manifest.manifest as any).frontendConfigs
    .settingsFields as SettingsFieldType[];
  const settingsGroups = ((manifest.manifest as any).frontendConfigs
    .settingsGroups || []) as unknown as SettingsGroup[];

  // Initialize expanded groups based on defaultExpanded
  React.useEffect(() => {
    const defaultExpanded = new Set<string>();
    settingsGroups.forEach((group) => {
      if (group.defaultExpanded) {
        defaultExpanded.add(group.id);
      }
    });
    setExpandedGroups(defaultExpanded);
  }, [settingsGroups]);

  // Group fields by their group property
  const groupedFields = React.useMemo(() => {
    const groups: Record<string, SettingsFieldType[]> = {};
    const ungrouped: SettingsFieldType[] = [];

    settingsFields.forEach((field) => {
      if (field.group) {
        if (!groups[field.group]) {
          groups[field.group] = [];
        }
        groups[field.group].push(field);
      } else {
        ungrouped.push(field);
      }
    });

    // Sort fields within each group by order
    Object.keys(groups).forEach((groupId) => {
      groups[groupId].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // Sort ungrouped fields by order
    ungrouped.sort((a, b) => (a.order || 0) - (b.order || 0));

    return { groups, ungrouped };
  }, [settingsFields]);

  // Sort groups by order
  const sortedGroups = React.useMemo(() => {
    return [...settingsGroups].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [settingsGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const renderField = (field: SettingsFieldType) => {
    return (
      <SettingsField
        key={field.key}
        field={field}
        value={pluginSettings[field.key]}
        onChange={(value) => onSettingsChange(field.key, value)}
        allSettings={pluginSettings}
        nodeId={nodeId}
      />
    );
  };

  const renderGroup = (group: SettingsGroup) => {
    const fieldsInGroup = groupedFields.groups[group.id] || [];
    if (fieldsInGroup.length === 0) return null;

    const isExpanded = expandedGroups.has(group.id);

    if (!group.collapsible) {
      // Non-collapsible group
      return (
        <Card key={group.id} className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{group.label}</CardTitle>
                {group.description && (
                  <CardDescription className="mt-1">
                    {group.description}
                  </CardDescription>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {fieldsInGroup.length} field
                {fieldsInGroup.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldsInGroup.map(renderField)}
          </CardContent>
        </Card>
      );
    }

    // Collapsible group
    return (
      <Card key={group.id} className="mb-4">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleGroup(group.id)}
        >
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                  <div>
                    <CardTitle className="text-base">{group.label}</CardTitle>
                    {group.description && (
                      <CardDescription className="mt-1">
                        {group.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {fieldsInGroup.length} field
                  {fieldsInGroup.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {fieldsInGroup.map(renderField)}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Plugin Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure plugin-specific parameters and options
        </p>
      </div>

      {/* Render grouped fields */}
      {sortedGroups.map(renderGroup)}

      {/* Render ungrouped fields */}
      {groupedFields.ungrouped.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">General Settings</CardTitle>
            <CardDescription>
              Additional plugin configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedFields.ungrouped.map(renderField)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
