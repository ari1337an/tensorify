"use client";

import * as React from "react";
import { Avatar } from "@/app/_components/ui/avatar";
import { MenuItem } from "@/app/(protected)/(enterprise)/_components/sidebar/MenuItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Project = {
  id: string;
  name: string;
  workflows: string[];
};

type ProjectsSectionProps = {
  activeItem: string;
  setActiveItem: (item: string) => void;
};

// Sortable Project Item component
const SortableProject = ({
  project,
  active,
  isOpen,
  hoveredProject,
  setHoveredProject,
  toggleProject,
  onItemClick,
  setActiveItem,
}: {
  project: Project;
  active: boolean;
  isOpen: boolean;
  hoveredProject: string | null;
  setHoveredProject: (id: string | null) => void;
  toggleProject: () => void;
  onItemClick: () => void;
  setActiveItem: (item: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
            <SortableWorkflows
              project={project}
              activeItem={active ? project.id : ""}
              onItemClick={setActiveItem}
            />
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
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
  setActiveItem,
}: {
  project: Project;
  active: boolean;
  isOpen: boolean;
  hoveredProject: string | null;
  setHoveredProject: (id: string | null) => void;
  toggleProject: () => void;
  onItemClick: () => void;
  setActiveItem: (item: string) => void;
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
            {project.workflows.map((workflow) => (
              <MenuItem
                key={`${project.id}-${workflow}`}
                icon={<div className="w-5" />}
                label={workflow}
                active={active && workflow === ""}
                onClick={() => setActiveItem(workflow)}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Sortable Workflow Item component
const SortableWorkflow = ({
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MenuItem
        icon={<div className="w-5" />}
        label={label}
        active={active}
        onClick={onClick}
      />
    </div>
  );
};

// Sortable Workflows component
const SortableWorkflows = ({
  project,
  activeItem,
  onItemClick,
}: {
  project: Project;
  activeItem: string;
  onItemClick: (item: string) => void;
}) => {
  const [workflows, setWorkflows] = React.useState(project.workflows);
  const [activeWorkflow, setActiveWorkflow] = React.useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveWorkflow(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWorkflows((items) => {
        const oldIndex = items.findIndex(
          (item) => `${project.id}-${item}` === active.id
        );
        const newIndex = items.findIndex(
          (item) => `${project.id}-${item}` === over.id
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveWorkflow(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-1 mt-1">
        <SortableContext
          items={workflows.map((workflow) => `${project.id}-${workflow}`)}
          strategy={verticalListSortingStrategy}
        >
          {workflows.map((workflow) => (
            <SortableWorkflow
              key={`${project.id}-${workflow}`}
              id={`${project.id}-${workflow}`}
              label={workflow}
              active={activeItem === workflow}
              onClick={() => {
                const workflowId = workflow;
                onItemClick(workflowId);
              }}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeWorkflow ? (
          <MenuItem
            icon={<div className="w-5" />}
            label={activeWorkflow.split(`${project.id}-`)[1] || ""}
            active={false}
            onClick={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export function ControlsSection({
  activeItem,
  setActiveItem,
}: ProjectsSectionProps) {
  const [projectsSectionOpen, setProjectsSectionOpen] = React.useState(true);
  const [openProjects, setOpenProjects] = React.useState<Set<string>>(
    new Set(["project-1"])
  );
  const [hoveredProject, setHoveredProject] = React.useState<string | null>(
    null
  );

  // Example projects - in a real app, this would come from your data source
  const [projects, setProjects] = React.useState<Project[]>([
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
  ]);

  const [activeProject, setActiveProject] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveProject(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((project) => project.id === active.id);
        const newIndex = items.findIndex((project) => project.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveProject(null);
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
              <span>CONTROLS</span>
            </span>
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="mt-1 mb-2 space-y-1">
        {isClient ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-1">
              <SortableContext
                items={projects.map((project) => project.id)}
                strategy={verticalListSortingStrategy}
              >
                {projects.map((project) => (
                  <SortableProject
                    key={project.id}
                    project={project}
                    active={activeItem === project.id}
                    isOpen={openProjects.has(project.id)}
                    hoveredProject={hoveredProject}
                    setHoveredProject={setHoveredProject}
                    toggleProject={() => toggleProject(project.id)}
                    onItemClick={() => setActiveItem(project.id)}
                    setActiveItem={setActiveItem}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay>
              {activeProject ? (
                <MenuItem
                  icon={
                    <Avatar className="h-5 w-5 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs">
                      {projects.find((p) => p.id === activeProject)?.name[0]}
                    </Avatar>
                  }
                  label={
                    projects.find((p) => p.id === activeProject)?.name || ""
                  }
                  active={activeItem === activeProject}
                  onClick={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
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
                setActiveItem={setActiveItem}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
