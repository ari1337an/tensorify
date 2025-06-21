"use client";

import * as React from "react";
import {
  ChevronDown,
  Plus,
  User,
  LogOut,
  Settings,
  Blocks,
  Telescope,
  Loader2,
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
import { TeamDialog } from "@/app/(application)/(protected)/(enterprise)/_components/dialog";
import { useSettingsDialog } from "@/app/(application)/(protected)/(enterprise)/_components/settings";
import { Badge } from "@/app/_components/ui/badge";
import { getTeam } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

type Team = {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

type TeamSelectorProps = {
  email?: string;
  currentTeam?: Team | null;
  teams?: Team[];
  onChangeTeam?: (team: Team) => void;
};

// Helper function to generate team icon from name
const getTeamIcon = (name: string) => {
  return name.charAt(0).toUpperCase();
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
  const [isLoadingTeams, setIsLoadingTeams] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const { openSettings } = useSettingsDialog();

  // Get organization and team management from store
  const currentOrg = useStore((state) => state.currentOrg);
  const setTeams = useStore((state) => state.setTeams);

  // Function to fetch fresh team data
  const fetchTeams = React.useCallback(async () => {
    if (!currentOrg?.id) return;

    setIsLoadingTeams(true);
    try {
      const response = await getTeam({
        params: { orgId: currentOrg.id },
        query: { limit: 100 }, // Get all teams, adjust limit as needed
      });

      if (response.status === 200) {
        // Sort teams by creation date in ascending order (oldest first)
        const sortedTeams = response.body.items.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setTeams(sortedTeams);
      } else {
        console.error("Failed to fetch teams:", response.body);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoadingTeams(false);
    }
  }, [currentOrg?.id, setTeams]);

  // Handle dropdown open change
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        // Fetch fresh teams when dropdown opens
        fetchTeams();
      }
    },
    [fetchTeams]
  );

  // Use the first team as default if no current team is selected
  const activeTeam = currentTeam || (teams.length > 0 ? teams[0] : null);

  if (!activeTeam) {
    return (
      <div className="flex items-center justify-between w-full px-2 py-1.5">
        <span className="text-sm text-muted-foreground">
          No teams available
        </span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-accent rounded-md cursor-pointer">
            <div className="flex items-center min-w-0">
              <Avatar className="h-6 w-6 mr-2 bg-zinc-800 flex items-center justify-center text-white text-xs">
                {getTeamIcon(activeTeam.name)}
              </Avatar>
              <span className="text-sm font-medium truncate">
                {activeTeam.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {isLoadingTeams && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
              <ChevronDown className="h-4 w-4 text-zinc-800 dark:text-zinc-400" />
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[300px] rounded-lg py-1 shadow-[0_0_12px_rgba(0,0,0,0.12)]"
        >
          <DropdownMenuLabel className="px-3 py-1.5">
            <div className="flex items-center justify-between">
              <Avatar className="h-8 w-8 mr-2 bg-zinc-800 flex items-center justify-center text-white text-sm">
                {getTeamIcon(activeTeam.name)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{activeTeam.name}</div>
                <div className="text-xs text-muted-foreground">
                  Team · {activeTeam.memberCount} members
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
            {isLoadingTeams && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>

          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              className="px-3 py-1.5 hover:bg-zinc-800 hover:cursor-pointer"
              onSelect={() => onChangeTeam(team)}
            >
              <div className="flex items-center w-full">
                <Avatar className="h-6 w-6 mr-2 bg-zinc-800 flex items-center justify-center text-white text-xs">
                  {getTeamIcon(team.name)}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-sm block truncate">{team.name}</span>
                  {team.description && (
                    <span className="text-xs text-muted-foreground block truncate">
                      {team.description}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  {team.memberCount} members
                </span>
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
      <TeamDialog
        open={isTeamDialogOpen}
        onOpenChange={setIsTeamDialogOpen}
        onTeamCreated={fetchTeams}
      >
        <span className="hidden">New Team</span>
      </TeamDialog>
    </>
  );
}
