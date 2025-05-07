"use client";

import * as React from "react";
import { Separator } from "@/app/_components/ui/separator";

export function TeamspacesView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Teamspaces</h2>
        <p className="text-sm text-muted-foreground">
          Manage teamspaces and their configurations.
        </p>
      </div>

      <Separator />

      <div className="text-muted-foreground">Coming soon</div>
    </div>
  );
}

export default TeamspacesView;
