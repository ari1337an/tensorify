"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/app/_lib/utils";
import { useSidebar, SIDEBAR_WIDTH } from "./SidebarContext";
import { OrganizationSelector } from "./OrganizationSelector";
import { DraftWorkflowsSection } from "./DraftWorkflowsSection";
import { TeamspacesSection } from "./TeamspacesSection";
import { ProjectsSection } from "./ProjectsSection";
import { SettingsSection } from "./SettingsSection";
import { InviteFooter } from "./InviteFooter";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen, setIsOpen } = useSidebar();
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
            <DraftWorkflowsSection />

            {/* Teamspaces Section */}
            <TeamspacesSection />

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

          {/* Invite members footer */}
          <InviteFooter />
        </>
      )}
    </div>
  );
}
