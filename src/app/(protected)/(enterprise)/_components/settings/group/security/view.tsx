"use client";

import * as React from "react";
import { Separator } from "@/app/_components/ui/separator";

export function SecurityView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Security Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage security settings and permissions for your workspace.
        </p>
      </div>

      <Separator />

      <div className="text-muted-foreground">Coming soon</div>
    </div>
  );
}

export default SecurityView;
