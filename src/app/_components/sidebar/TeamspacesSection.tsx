"use client";

import * as React from "react";
import { Avatar } from "../ui/avatar";
import { TeamDialog } from "../dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

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
            <div className="w-full justify-start text-left relative pl-9 text-sm py-2 px-3 rounded-md cursor-pointer flex items-center hover:bg-accent group hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform duration-200">
                <Avatar className="h-5 w-5 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xs shadow-sm group-hover:shadow-md transition-shadow">
                  A
                </Avatar>
              </div>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                AlphaWolf Ventures, Inc.
              </span>
            </div>

            <div className="w-full justify-start text-left relative pl-9 text-sm py-2 px-3 rounded-md cursor-pointer flex items-center hover:bg-accent group hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform duration-200">
                <Avatar className="h-5 w-5 bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white text-xs shadow-sm group-hover:shadow-md transition-shadow">
                  α
                </Avatar>
              </div>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                alphawolfventures
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
