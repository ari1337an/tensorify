"use client";

import * as React from "react";
import { Plus, Workflow } from "lucide-react";
import { MenuItem } from "./MenuItem";

export function DraftWorkflowsSection() {
  return (
    <div className="py-2">
      <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
        <span>DRAFT WORKFLOWS</span>
      </div>
      <div className="space-y-1">
        <MenuItem icon={<Workflow className="h-4 w-4" />} label="Draft 1" notification/>
        <MenuItem
          icon={<Plus className="h-4 w-4" />}
          label="Add new"
        />
      </div>
    </div>
  );
}
