"use client";

import * as React from "react";
import { Separator } from "@/app/_components/ui/separator";

export function IdentityView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Identity Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage identity providers and authentication settings.
        </p>
      </div>

      <Separator />

      <div className="text-muted-foreground">Coming soon</div>
    </div>
  );
}

export default IdentityView;
