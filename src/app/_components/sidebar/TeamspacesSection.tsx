"use client";

import * as React from "react";
import { Avatar } from "../ui/avatar";
import { TeamDialog } from "../dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/ui/collapsible";
import { MenuItem } from "./MenuItem";

export function TeamspacesSection() {
  const [teamspacesOpen, setTeamspacesOpen] = React.useState(true);

  return (
    <div>
      <Collapsible
        open={teamspacesOpen}
        onOpenChange={setTeamspacesOpen}
        className="py-2"
      >
        <div className="flex items-center justify-between px-2 mb-1">
          <CollapsibleTrigger asChild>
            <button className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground hover:scale-[1.02] transition-transform duration-200">
              <span className="flex items-center gap-1.5">TEAMS</span>
            </button>
          </CollapsibleTrigger>

          {/* Team dialog trigger */}
          <TeamDialog />
        </div>

        <CollapsibleContent className="mt-1 space-y-1 transition-all duration-300">
          <div className="transition-all duration-300">
            <MenuItem
              icon={
                <Avatar className="h-5 w-5 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xs">
                  A
                </Avatar>
              }
              label="AlphaWolf Ventures, Inc."
              onClick={() => {}}
            />

            <MenuItem
              icon={
                <Avatar className="h-5 w-5 bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white text-xs">
                  α
                </Avatar>
              }
              label="alphawolfventures"
              onClick={() => {}}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
