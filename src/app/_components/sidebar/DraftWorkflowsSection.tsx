"use client";

import * as React from "react";
import { Plus, Workflow } from "lucide-react";
import { MenuItem } from "./MenuItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

export function DraftWorkflowsSection() {
  const [draftWorkflowsOpen, setDraftWorkflowsOpen] = React.useState(true);

  return (
    <div>
      <Collapsible
        open={draftWorkflowsOpen}
        onOpenChange={setDraftWorkflowsOpen}
        className="py-2"
      >
        <div className="flex items-center justify-between px-2 mb-1">
          <CollapsibleTrigger asChild>
            <button className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground hover:scale-[1.02] transition-transform duration-200">
              <span className="flex items-center gap-1.5">DRAFT WORKFLOWS</span>
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-1 space-y-1 transition-all duration-300">
          <div className="space-y-1">
            <MenuItem
              icon={<Workflow className="h-4 w-4" />}
              label="Draft 1"
              notification
            />
            <MenuItem icon={<Plus className="h-4 w-4" />} label="Add new" />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
