"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useSettingsDialog } from "../context/SettingsContext";

export function AppearanceSection() {
  const { settings, updateSettings } = useSettingsDialog();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Appearance</h2>
      <p className="text-sm text-muted-foreground">
        Customize how Tensorify looks on your device.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm">Use system setting</span>
        <Select
          value={settings.themePreference}
          onValueChange={(value) => updateSettings("themePreference", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
