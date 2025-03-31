"use client";

import * as React from "react";
import {
  X,
  Plus,
  ChevronDown,
  Home,
  FileText,
  Users,
  Settings,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Avatar } from "./ui/avatar";
import { TeamDialog } from "./TeamDialog";
import { cn } from "@/app/_lib/utils";

type SidebarContextProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  sidebarWidth: string;
};

const SIDEBAR_WIDTH = "16rem";

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
}

type SidebarProviderProps = {
  children: React.ReactNode;
};

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const toggleSidebar = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggleSidebar,
      sidebarWidth: SIDEBAR_WIDTH,
    }),
    [isOpen, setIsOpen, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

type OrganizationProps = {
  name: string;
  icon: string;
};

function OrganizationSelector({ name, icon }: OrganizationProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="flex items-center px-4 h-14 rounded-lg cursor-pointer relative overflow-hidden hover:bg-white/5 transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent transition-opacity duration-300"
        style={{ opacity: isHovered ? 0.6 : 0 }}
      />

      <div className="hover:scale-105 transition-transform duration-200">
        <Avatar className="h-8 w-8 mr-2 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md">
          {icon}
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
      </div>

      <div className="hover:translate-y-0.5 transition-transform duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/30 backdrop-blur-sm hover:bg-background/50"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Menu item component with Tailwind transitions
function MenuItem({
  icon,
  label,
  active = false,
  collapsed = false,
  notification = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  notification?: boolean;
  onClick?: () => void;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center rounded-md px-3 py-2 text-sm transition-all duration-200 relative overflow-hidden hover:scale-[1.02] active:scale-[0.98]",
              active
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            onClick={onClick}
          >
            {/* Background decoration for active item */}
            {active && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/80 opacity-20" />
            )}

            <span className="text-lg flex-shrink-0">{icon}</span>
            <span className="truncate ml-1">{label}</span>

            {/* Notification dot */}
            {notification && (
              <div className="h-2 w-2 rounded-full bg-blue-500 ml-auto" />
            )}
          </button>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen, setIsOpen } = useSidebar();
  const [teamspacesOpen, setTeamspacesOpen] = React.useState(true);
  const [activeItem, setActiveItem] = React.useState("Projects");

  return (
    <div
      className={cn(
        "flex-shrink-0 flex flex-col border-r border-border/50 bg-background/95 backdrop-blur-sm overflow-hidden transition-all duration-300",
        isOpen ? `w-[${SIDEBAR_WIDTH}]` : "w-0",
        className
      )}
      role="complementary"
      {...props}
    >
      {/* Content only visible when sidebar is open */}
      {isOpen && (
        <>
          {/* Header with organization selector and close button */}
          <div className="flex items-center justify-between p-3 border-b border-border/30">
            <OrganizationSelector name="AlphaWolf Ventures, Inc." icon="A" />
            <div className="hover:rotate-90 transition-transform duration-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-3">
            {/* Draft Workflows Section */}
            <div className="py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>DRAFT WORKFLOWS</span>
              </div>
              <div className="space-y-1">
                <MenuItem
                  icon={<Home className="h-4 w-4" />}
                  label="New page"
                />
                <MenuItem
                  icon={<Plus className="h-4 w-4" />}
                  label="Add new"
                  notification
                />
              </div>
            </div>

            {/* Teamspaces Section */}
            <div>
              <Collapsible
                open={teamspacesOpen}
                onOpenChange={setTeamspacesOpen}
                className="py-2"
              >
                <div className="flex items-center justify-between px-2 mb-1">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground hover:scale-[1.02] transition-transform duration-200">
                      <div
                        className={`transition-transform duration-200 ${
                          teamspacesOpen ? "rotate-0" : "-rotate-90"
                        }`}
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                      </div>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        TEAMSPACES
                      </span>
                    </button>
                  </CollapsibleTrigger>

                  {/* Team dialog trigger */}
                  <div className="hover:scale-110 hover:rotate-90 active:scale-90 transition-transform duration-200">
                    <TeamDialog />
                  </div>
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

            {/* Projects Section */}
            <div className="py-3">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
                <FileText className="h-3 w-3" />
                <span>PROJECTS</span>
              </div>

              <MenuItem
                icon={
                  <div className="relative">
                    <Avatar className="h-5 w-5 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs">
                      P
                    </Avatar>
                    {activeItem === "Projects" && (
                      <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                }
                label="Projects"
                active={activeItem === "Projects"}
                onClick={() => setActiveItem("Projects")}
              />

              <div className="space-y-1 mt-1 ml-7">
                {["Wiki", "Meetings", "Docs", "Tasks Tracker"].map((item) => (
                  <MenuItem
                    key={item}
                    icon={<div className="w-5" />} // Empty space for alignment
                    label={item}
                    active={activeItem === item}
                    onClick={() => setActiveItem(item)}
                  />
                ))}
              </div>
            </div>

            {/* Settings & other links */}
            <div className="py-2 mt-2">
              <div className="space-y-1">
                <MenuItem
                  icon={<Settings className="h-4 w-4" />}
                  label="Settings"
                  active={activeItem === "Settings"}
                  onClick={() => setActiveItem("Settings")}
                />
                <MenuItem
                  icon={<FileText className="h-4 w-4" />}
                  label="Templates"
                  active={activeItem === "Templates"}
                  onClick={() => setActiveItem("Templates")}
                />
                <MenuItem
                  icon={<Trash2 className="h-4 w-4" />}
                  label="Trash"
                  active={activeItem === "Trash"}
                  onClick={() => setActiveItem("Trash")}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Invite members footer */}
          <div className="p-3 border-t border-border/30">
            <div className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              <Button
                variant="outline"
                className="w-full justify-start text-left text-sm relative overflow-hidden group"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="mr-2 hover:rotate-180 transition-transform duration-300">
                  <Plus className="h-4 w-4" />
                </div>
                Invite members
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
