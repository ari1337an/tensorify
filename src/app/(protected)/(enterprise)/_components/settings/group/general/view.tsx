"use client";

import * as React from "react";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { useGeneralLogic } from "./logic";

export function GeneralView() {
  const {
    workspaceName,
    workspaceSlug,
    setWorkspaceName,
    setWorkspaceSlug,
    handleSave,
  } = useGeneralLogic();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your workspace name and URL.
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
          <CardDescription>
            Update your workspace information visible to all members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input
                id="workspaceName"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspaceSlug">Workspace URL</Label>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  tensorify.io/
                </div>
                <Input
                  id="workspaceSlug"
                  value={workspaceSlug}
                  onChange={(e) => setWorkspaceSlug(e.target.value)}
                  placeholder="your-workspace"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This is your workspace&apos;s unique URL on Tensorify.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GeneralView;
