"use client";

import * as React from "react";
import { Label } from "@/app/_components/ui/label";
import { Switch } from "@/app/_components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useSettingsDialog } from "../context/SettingsContext";

export function DesktopSection() {
  const { settings, updateSettings } = useSettingsDialog();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Desktop app</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Open links in desktop app</Label>
              <p className="text-sm text-muted-foreground">
                You must have the macOS app installed.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                If installed, macOS will open links to Notion in the desktop
                app, even if this setting is turned off. To disable that
                behavior, enable &quot;Open Notion links in browser&quot; in
                your app.
              </p>
            </div>
            <Switch
              checked={settings.openLinksInDesktop}
              onCheckedChange={(value) =>
                updateSettings("openLinksInDesktop", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Open on start</span>
            <Select
              value={settings.startupPage}
              onValueChange={(value) => updateSettings("startupPage", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Last visited page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_visited">Last visited page</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="inbox">Inbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Set in app
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
