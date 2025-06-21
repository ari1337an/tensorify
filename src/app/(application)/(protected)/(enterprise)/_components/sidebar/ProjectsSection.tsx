"use client";

import * as React from "react";
import { Avatar } from "@/app/_components/ui/avatar";
import { MenuItem } from "@/app/(application)/(protected)/(enterprise)/_components/sidebar/MenuItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ProjectDialog } from "@/app/(application)/(protected)/(enterprise)/_components/dialog";
import { useProjects } from "@/app/_providers/project-provider";
import { useWorkflows } from "@/app/_providers/workflow-provider";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { WorkflowDialog } from "@/app/(application)/(protected)/(enterprise)/_components/dialog";

// Skeleton components for loading states
const ProjectSkeleton = React.memo(
  ({ showWorkflows = false }: { showWorkflows?: boolean }) => (
    <div className="space-y-1">
      {/* Project item skeleton */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/50">
        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
        <Skeleton className="h-4 w-20 flex-1 max-w-[80px]" />
      </div>
      {/* Workflow items skeleton */}
      {showWorkflows && (
        <div className="space-y-1 mt-1">
          <div className="flex items-center gap-2 px-2 py-1 ml-7">
            <div className="w-5 flex-shrink-0" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1 ml-7">
            <div className="w-5 flex-shrink-0" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1 ml-7">
            <div className="w-5 flex-shrink-0" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      )}
    </div>
  )
);

ProjectSkeleton.displayName = "ProjectSkeleton";

const ProjectsSkeleton = React.memo(() => (
  <div className="space-y-1">
    <ProjectSkeleton showWorkflows={true} />
    <ProjectSkeleton showWorkflows={false} />
    <ProjectSkeleton showWorkflows={false} />
  </div>
));

ProjectsSkeleton.displayName = "ProjectsSkeleton";

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

  // Get projects from provider instead of dummy data
  const { projects: projectsFromProvider, loading, error } = useProjects();
  // Get workflow functionality from provider
  const { workflows: allWorkflows, selectWorkflow } = useWorkflows();
  const [projects, setProjects] = React.useState<Project[]>([]);

  // Create a stable mapping of workflow names to IDs
  const workflowIdMap = React.useMemo(() => {
    const map = new Map<string, string>();
    allWorkflows.forEach((workflow) => {
      const key = `${workflow.projectId}-${workflow.name}`;
      map.set(key, workflow.id);
    });
    return map;
  }, [allWorkflows]);

  // Handle workflow selection
  const handleWorkflowClick = React.useCallback(
    (workflowName: string, projectId: string) => {
      // Find the actual workflow object from the workflows array
      const workflowObj = allWorkflows.find(
        (w) => w.name === workflowName && w.projectId === projectId
      );
      if (workflowObj) {
        selectWorkflow(workflowObj);
      }
      setActiveItem(workflowName);
    },
    [allWorkflows, selectWorkflow, setActiveItem]
  );

  // Update local projects state when provider data changes
  React.useEffect(() => {
    setProjects(projectsFromProvider);
    // Open the first project by default if there are any projects
    if (projectsFromProvider.length > 0) {
      setOpenProjects(new Set([projectsFromProvider[0].id]));
    }
  }, [projectsFromProvider]);

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

  // Regular project item for server-side rendering
  const StaticProject = ({
    project,
    active,
    isOpen,
    hoveredProject,
    setHoveredProject,
    toggleProject,
    onItemClick,
  }: {
    project: Project;
    active: boolean;
    isOpen: boolean;
    hoveredProject: string | null;
    setHoveredProject: (id: string | null) => void;
    toggleProject: () => void;
    onItemClick: () => void;
  }) => {
    return (
      <Collapsible open={isOpen} onOpenChange={toggleProject}>
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
                        isOpen ? "rotate-180" : ""
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
              active={active}
              onClick={onItemClick}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {isOpen && (
            <div className="space-y-1 mt-1">
              {project.workflows.map((workflowName, index) => {
                // Use the stable workflow ID mapping for keys
                const workflowKey = `${project.id}-${workflowName}`;
                const workflowId = workflowIdMap.get(workflowKey);
                const uniqueKey = workflowId
                  ? `workflow-${workflowId}`
                  : `fallback-${project.id}-${workflowName}-${index}`;

                return (
                  <MenuItem
                    key={uniqueKey}
                    icon={<div className="w-5" />}
                    label={workflowName}
                    active={activeItem === workflowName}
                    onClick={() =>
                      handleWorkflowClick(workflowName, project.id)
                    }
                  />
                );
              })}

              {/* Add workflow button */}
              <WorkflowDialog
                projectId={project.id}
                projectName={project.name}
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
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
        {loading ? (
          <ProjectsSkeleton />
        ) : error ? (
          <div className="px-2 py-4 text-xs text-red-400">
            Error loading projects: {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="px-2 py-4 text-xs text-muted-foreground">
            No projects found for this team
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <StaticProject
                key={project.id}
                project={project}
                active={activeItem === project.id}
                isOpen={openProjects.has(project.id)}
                hoveredProject={hoveredProject}
                setHoveredProject={setHoveredProject}
                toggleProject={() => toggleProject(project.id)}
                onItemClick={() => setActiveItem(project.id)}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
