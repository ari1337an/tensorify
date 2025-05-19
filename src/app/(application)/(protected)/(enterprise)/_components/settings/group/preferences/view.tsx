"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Label } from "@/app/_components/ui/label";
import { usePreferencesLogic } from "./logic";
import { Separator } from "@/app/_components/ui/separator";
export function PreferencesView() {
  const { settings, handleThemeChange } = usePreferencesLogic();

  return (
    <div className="space-y-8">
      {/* Theme Section */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Theme</h2>
        <Separator className="mb-3" />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Theme preference</Label>
            <p className="text-sm text-muted-foreground">
              Choose your preferred theme.
            </p>
          </div>
          <Select
            value={settings.themePreference}
            onValueChange={handleThemeChange}
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
    </div>
  );
}

export default PreferencesView;
