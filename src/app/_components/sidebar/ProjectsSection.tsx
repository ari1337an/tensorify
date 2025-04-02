"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { MenuItem } from "./MenuItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown } from "lucide-react";

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
  const [openProjects, setOpenProjects] = React.useState<string[]>([]);
  const [hoveredProject, setHoveredProject] = React.useState<string | null>(
    null
  );

  // Example projects - in a real app, this would come from your data source
  const projects: Project[] = [
    {
      id: "alphawolf",
      name: "AlphaWolf Ventures",
      workflows: ["Projects", "Meetings", "Docs", "Tasks Tracker"],
    },
    {
      id: "test",
      name: "test",
      workflows: ["Teamspace Home"],
    },
  ];

  const toggleProject = (projectId: string) => {
    setOpenProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <div className="py-3">
      <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
        <FileText className="h-3 w-3" />
        <span>PROJECTS</span>
      </div>

      <div className="space-y-1">
        {projects.map((project) => (
          <Collapsible
            key={project.id}
            open={openProjects.includes(project.id)}
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
                            openProjects.includes(project.id)
                              ? "rotate-180"
                              : ""
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
    </div>
  );
}
