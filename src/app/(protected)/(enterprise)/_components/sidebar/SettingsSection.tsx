"use client";

import * as React from "react";
import { Settings, FileText, Trash2 } from "lucide-react";
import { MenuItem } from "./MenuItem";
import { useSettingsDialog } from "@/app/(protected)/(enterprise)/_components/settings";

type SettingsSectionProps = {
  activeItem: string;
  setActiveItem: (item: string) => void;
};

export function SettingsSection({
  activeItem,
  setActiveItem,
}: SettingsSectionProps) {
  const settingsContext = useSettingsDialog();

  const handleSettingsClick = () => {
    console.log("Settings clicked, opening dialog");
    settingsContext.openSettings();
    setActiveItem("Settings");
  };

  return (
    <div>
      <div className="space-y-1">
        <MenuItem
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={activeItem === "Settings"}
          onClick={handleSettingsClick}
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
