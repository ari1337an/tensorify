"use client";

import * as React from "react";
import { Avatar } from "@/app/_components/ui/avatar";
import { MenuItem } from "@/app/_components/sidebar/MenuItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ProjectDialog } from "@/app/_components/dialog";

type Project = {
  id: string;
  name: string;
  workflows: string[];
};

type ProjectsSectionProps = {
  activeItem: string;
  setActiveItem: (item: string) => void;
};

export function ProjectsSection({
  activeItem,
  setActiveItem,
}: ProjectsSectionProps) {
  const [projectsSectionOpen, setProjectsSectionOpen] = React.useState(true);
  const [openProjects, setOpenProjects] = React.useState<Set<string>>(
    new Set()
  );
  const [hoveredProject, setHoveredProject] = React.useState<string | null>(
    null
  );

  // Example projects - in a real app, this would come from your data source
  const projects: Project[] = [
    {
      id: "project-1",
      name: "Project 1",
      workflows: ["Workflow 1", "Workflow 2", "Workflow 3"],
    },
    {
      id: "project-2",
      name: "Project 2",
      workflows: ["Workflow 1", "Workflow 2", "Workflow 3", "Workflow 4"],
    },
  ];

  const toggleProject = (projectId: string) => {
    setOpenProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  return (
    <Collapsible
      open={projectsSectionOpen}
      onOpenChange={setProjectsSectionOpen}
      className="py-3"
    >
      <div className="flex items-center justify-between px-2 mb-1">
        <CollapsibleTrigger asChild>
          <button className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground hover:scale-[1.02] transition-transform duration-200">
            <span className="flex items-center gap-1.5">
              <span>PROJECTS</span>
            </span>
          </button>
        </CollapsibleTrigger>

        <ProjectDialog />
      </div>

      <CollapsibleContent className="mt-1 mb-2 space-y-1">
        <div className="space-y-1">
          {projects.map((project) => (
            <Collapsible
              key={project.id}
              open={openProjects.has(project.id)}
              onOpenChange={() => toggleProject(project.id)}
            >
              <CollapsibleTrigger asChild>
                <div
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <MenuItem
                    icon={
                      <div className="relative flex items-center">
                        {hoveredProject === project.id ? (
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-200 ${
                              openProjects.has(project.id) ? "rotate-180" : ""
                            }`}
                          />
                        ) : (
                          <Avatar className="h-5 w-5 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs">
                            {project.name[0]}
                          </Avatar>
                        )}
                      </div>
                    }
                    label={project.name}
                    active={activeItem === project.id}
                    onClick={() => setActiveItem(project.id)}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="space-y-1 mt-1">
                  {project.workflows.map((workflow) => (
                    <MenuItem
                      key={`${project.id}-${workflow}`}
                      icon={<div className="w-5" />}
                      label={workflow}
                      active={activeItem === workflow}
                      onClick={() => setActiveItem(workflow)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
