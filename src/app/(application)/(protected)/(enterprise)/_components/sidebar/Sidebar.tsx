"use client";

import * as React from "react";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { cn } from "@/app/_lib/utils";
import { useSidebar, SIDEBAR_WIDTH } from "./SidebarContext";
import { TeamSelector } from "./TeamSelector";
import { DraftWorkflowsSection } from "./DraftWorkflowsSection";
import { ProjectsSection } from "./ProjectsSection";
import { SettingsSection } from "./SettingsSection";
import { SidebarFooter } from "./SidebarFooter";
import useStore from "@/app/_store/store";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

// Define the Team type
type Team = {
  id: string;
  name: string;
  icon: string;
};

// Mock data for teams
const mockTeams: Team[] = [
  { id: "team1", name: "Alpha team", icon: "A" },
  { id: "team2", name: "Beta team", icon: "B" },
  { id: "team3", name: "Gamma team", icon: "C" },
];

export function Sidebar({ className, ...props }: SidebarProps) {
  const currentUser = useStore((state) => state.currentUser);
  const { isOpen } = useSidebar();
  const [activeItem, setActiveItem] = React.useState("Projects");
  const [currentTeam, setCurrentTeam] = React.useState(mockTeams[0]);

  const handleChangeTeam = (team: Team) => {
    setCurrentTeam(team);
    // Additional logic when changing team could go here
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 flex flex-col border-r border-border/50 bg-sidebar backdrop-blur-lg h-screen transition-all duration-300",
        !isOpen && "w-0",
        className
      )}
      style={{ width: isOpen ? SIDEBAR_WIDTH : undefined }}
      role="complementary"
      {...props}
    >
      {/* Content only visible when sidebar is open */}
      {isOpen && (
        <>
          {/* Header with organization selector and close button */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-border/30">
            <TeamSelector
              email={currentUser?.email}
              currentTeam={currentTeam}
              teams={mockTeams}
              onChangeTeam={handleChangeTeam}
            />
          </div>

          <ScrollArea className="flex-1 px-3 py-3 overflow-y-auto">
            {/* Draft Workflows Section */}
            <DraftWorkflowsSection />

            {/* Projects Section */}
            <ProjectsSection
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />

            {/* Settings & other links */}
            <SettingsSection
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />
          </ScrollArea>

          {/* Sidebar footer */}
          <SidebarFooter />
        </>
      )}
    </div>
  );
}
