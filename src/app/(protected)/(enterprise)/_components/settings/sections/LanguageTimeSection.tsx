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

export function LanguageTimeSection() {
  const { settings, updateSettings } = useSettingsDialog();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Language & Time</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <p className="text-sm text-muted-foreground">
              Change the language used in the user interface.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Language</span>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSettings("language", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="English" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Start week on Monday</Label>
              <p className="text-sm text-muted-foreground">
                This will change how all calendars in your app look.
              </p>
            </div>
            <Switch
              checked={settings.startWeekOnMonday}
              onCheckedChange={(value) =>
                updateSettings("startWeekOnMonday", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">
                Set timezone automatically using your location
              </Label>
              <p className="text-sm text-muted-foreground">
                Reminders, notifications and emails are delivered based on your
                time zone.
              </p>
            </div>
            <Switch
              checked={settings.autoSetTimezone}
              onCheckedChange={(value) =>
                updateSettings("autoSetTimezone", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Timezone</span>
            <Select
              value={settings.timezone}
              onValueChange={(value) => updateSettings("timezone", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="(GMT+6:00) Dhaka" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dhaka">(GMT+6:00) Dhaka</SelectItem>
                <SelectItem value="new_york">(GMT-4:00) New York</SelectItem>
                <SelectItem value="london">(GMT+0:00) London</SelectItem>
                <SelectItem value="tokyo">(GMT+9:00) Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
