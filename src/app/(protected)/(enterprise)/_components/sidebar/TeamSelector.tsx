"use client";

import * as React from "react";
import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@clerk/nextjs";
import Logo from "@/app/_components/ui/logo";

type Team = {
  id: string;
  name: string;
  icon: string;
  isGuest?: boolean;
};

type TeamSelectorProps = {
  email?: string;
  currentTeam?: Team;
  teams?: Team[];
  onChangeTeam?: (team: Team) => void;
};

export function TeamSelector({
  email = "loading...",
  currentTeam,
  teams = [],
}: TeamSelectorProps) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setIsOpen: setSidebarOpen } = useSidebar();

  // If no teams provided, create some example ones
  const defaultTeams =
    teams.length > 0
      ? teams
      : [{ id: "founders", name: "Founders", icon: "T" }];

  const activeTeam = currentTeam || defaultTeams[2]; // Default to AlphaWolf

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-accent rounded-md cursor-pointer">
            <div className="flex items-center min-w-0">
              <Logo className="h-6 w-6 mr-2 bg-sidebar rounded-md flex items-center justify-center text-white text-sm" />
              <span className="text-sm font-medium truncate">
                {activeTeam.name}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-800 dark:text-zinc-400" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[300px] rounded-lg py-1 shadow-[0_0_12px_rgba(0,0,0,0.12)]"
        >
          <DropdownMenuLabel className="px-3 py-1.5">
            <div className="flex items-center justify-between">
              <Logo className="h-8 w-8 mr-2 bg-background rounded-md flex items-center justify-center text-white text-sm" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{activeTeam.name}</div>
                <div className="text-xs text-muted-foreground">
                  Tensorify · 2 members
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1" />

          <div className="px-3 py-1.5 flex items-center justify-between text-zinc-400">
            <span className="text-sm">
              Logged in as{" "}
              <b className="underline">
                {email.length > 18 ? email.slice(0, 18) + "..." : email}
              </b>
            </span>
          </div>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => signOut()}
            className="px-3 py-1.5 hover:bg-zinc-800 hover:cursor-pointer"
          >
            <div className="flex items-center text-muted-foreground hover:text-accent-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">Log out</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
