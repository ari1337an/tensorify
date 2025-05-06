"use client";

import * as React from "react";
import {
  ChevronDown,
  Plus,
  User,
  LogOut,
  Settings,
  Globe,
  Blocks,
  Telescope,
} from "lucide-react";
import { Avatar } from "@/app/_components/ui/avatar";
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
import { TeamDialog } from "@/app/(protected)/(enterprise)/_components/dialog";
import { useSettingsDialog } from "@/app/(protected)/(enterprise)/_components/settings";
import { Badge } from "@/app/_components/ui/badge";

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
  onChangeTeam = () => {},
}: TeamSelectorProps) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const { openSettings } = useSettingsDialog();

  // If no teams provided, create some example ones
  const defaultTeams =
    teams.length > 0
      ? teams
      : [
          { id: "user-tensorify", name: "Md Sahadul Hasan's", icon: "M" },
          { id: "university", name: "University", icon: "U", isGuest: true },
          { id: "alphawolf", name: "AlphaWolf Ventures, Inc.", icon: "A" },
        ];

  const activeTeam = currentTeam || defaultTeams[2]; // Default to AlphaWolf

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-accent rounded-md cursor-pointer">
            <div className="flex items-center min-w-0">
              <Avatar className="h-6 w-6 mr-2 bg-zinc-800 flex items-center justify-center text-white text-xs">
                {activeTeam.icon}
              </Avatar>
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
              <Avatar className="h-8 w-8 mr-2 bg-zinc-800 flex items-center justify-center text-white text-sm">
                {activeTeam.icon}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{activeTeam.name}</div>
                <div className="text-xs text-muted-foreground">
                  Organization Name · 2 members
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <div className="flex gap-2 px-3 py-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md border border-border text-accent-foreground hover:border-primary hover:ring-1 hover:ring-primary cursor-pointer"
              onClick={() => {
                openSettings();
                setIsOpen(false);
              }}
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Settings</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md border border-border text-accent-foreground hover:border-primary hover:ring-1 hover:ring-primary cursor-pointer">
              <User className="h-4 w-4" />
              <span className="text-sm">Invite members</span>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1" />

          <div className="px-3 py-1.5 flex items-center justify-between text-zinc-400">
            <span className="text-sm">{email}</span>
          </div>

          {defaultTeams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              className="px-3 py-1.5 hover:bg-zinc-800 hover:cursor-pointer"
              onSelect={() => onChangeTeam(team)}
            >
              <div className="flex items-center w-full">
                <Avatar className="h-6 w-6 mr-2 bg-zinc-800 flex items-center justify-center text-white text-xs">
                  {team.icon}
                </Avatar>
                <span className="flex-1 text-sm">{team.name}</span>
                {team.isGuest && (
                  <span className="flex items-center text-amber-500/90 text-xs font-medium">
                    <Globe className="h-3.5 w-3.5 mr-1" />
                    Guest
                  </span>
                )}
                {team.id === activeTeam.id && (
                  <span className="text-zinc-400 ml-2">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuItem asChild>
            <div
              className="flex items-center text-muted-foreground w-full px-3 py-1.5 hover:cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsTeamDialogOpen(true);
                setIsOpen(false);
              }}
            >
              <Plus className="" />
              <span className="text-sm">New Team</span>
            </div>
          </DropdownMenuItem>

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

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => {
              // redirect to https://plugins.tensorify.io/dashboard in new tab
              window.open("https://plugins.tensorify.io/dashboard", "_blank");
            }}
            className="px-3 py-1.5 hover:bg-zinc-800 hover:cursor-pointer"
          >
            <div className="flex items-center text-muted-foreground hover:text-accent-foreground">
              <Blocks className="h-4 w-4 mr-2" />
              <span className="text-sm">My Plugins</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              // redirect to https://plugins.tensorify.io/search in new tab
              window.open("https://plugins.tensorify.io/search", "_blank");
            }}
            className="px-3 py-1.5 hover:bg-zinc-800 hover:cursor-pointer"
          >
            <div className="flex items-center text-muted-foreground hover:text-accent-foreground">
              <Telescope className="h-4 w-4 mr-2" />
              <span className="text-sm">Explore Plugins</span>
              <Badge variant="default" className="ml-2">
                New
              </Badge>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render TeamDialog outside the dropdown to avoid nesting issues */}
      <TeamDialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <span className="hidden">New Team</span>
      </TeamDialog>
    </>
  );
}
