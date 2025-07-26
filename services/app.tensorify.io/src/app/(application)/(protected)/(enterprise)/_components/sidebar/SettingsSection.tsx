"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { MenuItem } from "./MenuItem";
import { useSettingsDialog } from "@/app/(application)/(protected)/(enterprise)/_components/settings";

// Dynamically import icons with no SSR to prevent hydration mismatches
const Settings = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.Settings })),
  { ssr: false }
);
const FileText = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.FileText })),
  { ssr: false }
);
const Trash2 = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.Trash2 })),
  { ssr: false }
);

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
          label={
            <div className="flex items-center justify-between w-full">
              <span>Archive</span>
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full ml-2">
                Coming Soon
              </span>
            </div>
          }
          active={activeItem === "Archive"}
          onClick={() => setActiveItem("Archive")}
        />
        <MenuItem
          icon={<Trash2 className="h-4 w-4" />}
          label={
            <div className="flex items-center justify-between w-full">
              <span>Trash</span>
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full ml-2">
                Coming Soon
              </span>
            </div>
          }
          active={activeItem === "Trash"}
          onClick={() => setActiveItem("Trash")}
        />
      </div>
    </div>
  );
}
