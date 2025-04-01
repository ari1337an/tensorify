"use client";

import * as React from "react";
import { Settings, FileText, Trash2 } from "lucide-react";
import { MenuItem } from "./MenuItem";

type SettingsSectionProps = {
  activeItem: string;
  setActiveItem: (item: string) => void;
};

export function SettingsSection({
  activeItem,
  setActiveItem,
}: SettingsSectionProps) {
  return (
    <div className="py-2 mt-2">
      <div className="space-y-1">
        <MenuItem
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={activeItem === "Settings"}
          onClick={() => setActiveItem("Settings")}
        />
        <MenuItem
          icon={<FileText className="h-4 w-4" />}
          label="Archive"
          active={activeItem === "Archive"}
          onClick={() => setActiveItem("Archive")}
        />
        <MenuItem
          icon={<Trash2 className="h-4 w-4" />}
          label="Trash"
          active={activeItem === "Trash"}
          onClick={() => setActiveItem("Trash")}
        />
      </div>
    </div>
  );
}
