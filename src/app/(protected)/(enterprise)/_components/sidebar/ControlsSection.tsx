"use client";

import * as React from "react";
import { MenuItem } from "@/app/(protected)/(enterprise)/_components/sidebar/MenuItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/_components/ui/collapsible";
import {
  ChevronDown,
  FileText,
  Flag,
  Users,
  Settings,
  Newspaper,
  File,
  Image as ImageIcon,
  TestTube,
  BarChart,
  UserPlus,
  UserCog,
  Shield,
  Key,
  Link,
  LayoutDashboard,
} from "lucide-react";
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
import useStore from "@/app/(protected)/(enterprise)/_store/store";

type Control = {
  id: string;
  name: string;
  sections: string[];
};

type ControlsSectionProps = {
  activeItem: string;
  setActiveItem: (item: string) => void;
};

// Sortable Control Item component
const SortableControl = ({
  control,
  active,
  isOpen,
  hoveredControl,
  setHoveredControl,
  toggleControl,
  onItemClick,
  setActiveItem,
}: {
  control: Control;
  active: boolean;
  isOpen: boolean;
  hoveredControl: string | null;
  setHoveredControl: (id: string | null) => void;
  toggleControl: () => void;
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
    id: control.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Collapsible open={isOpen} onOpenChange={toggleControl}>
        <CollapsibleTrigger asChild>
          <div
            onMouseEnter={() => setHoveredControl(control.id)}
            onMouseLeave={() => setHoveredControl(null)}
          >
            <MenuItem
              icon={
                <div className="relative flex items-center">
                  {hoveredControl === control.id ? (
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  ) : (
                    <div className="h-5 w-5">
                      {control.id === "content" && (
                        <FileText className="h-5 w-5" />
                      )}
                      {control.id === "features" && (
                        <Flag className="h-5 w-5" />
                      )}
                      {control.id === "users" && <Users className="h-5 w-5" />}
                      {control.id === "settings" && (
                        <Settings className="h-5 w-5" />
                      )}
                    </div>
                  )}
                </div>
              }
              label={control.name}
              active={active}
              onClick={onItemClick}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {isOpen && (
            <div className="pl-4">
              <SortableSections
                control={control}
                activeItem={active ? control.id : ""}
                onItemClick={setActiveItem}
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Regular control item for server-side rendering
const StaticControl = ({
  control,
  active,
  isOpen,
  hoveredControl,
  setHoveredControl,
  toggleControl,
  onItemClick,
  setActiveItem,
}: {
  control: Control;
  active: boolean;
  isOpen: boolean;
  hoveredControl: string | null;
  setHoveredControl: (id: string | null) => void;
  toggleControl: () => void;
  onItemClick: () => void;
  setActiveItem: (item: string) => void;
}) => {
  const setCurrentRoute = useStore((state) => state.setCurrentRoute);

  const handleClick = () => {
    onItemClick();
    setCurrentRoute(control.name);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={toggleControl}>
      <CollapsibleTrigger asChild>
        <div
          onMouseEnter={() => setHoveredControl(control.id)}
          onMouseLeave={() => setHoveredControl(null)}
        >
          <MenuItem
            icon={
              <div className="relative flex items-center">
                {hoveredControl === control.id ? (
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                ) : (
                  <div className="h-5 w-5">
                    {control.id === "content" && (
                      <FileText className="h-5 w-5" />
                    )}
                    {control.id === "features" && <Flag className="h-5 w-5" />}
                    {control.id === "users" && <Users className="h-5 w-5" />}
                    {control.id === "settings" && (
                      <Settings className="h-5 w-5" />
                    )}
                  </div>
                )}
              </div>
            }
            label={control.name}
            active={active}
            onClick={handleClick}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {isOpen && (
          <div className="pl-4">
            <SortableSections
              control={control}
              activeItem={active ? control.id : ""}
              onItemClick={setActiveItem}
            />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Sortable Section Item component
const SortableSection = ({
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
  const setCurrentRoute = useStore((state) => state.setCurrentRoute);

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

  const handleClick = () => {
    onClick();
    setCurrentRoute(label);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MenuItem
        icon={
          <div className="w-5">
            {label === "Blog Posts" && <Newspaper className="h-5 w-5" />}
            {label === "Pages" && <File className="h-5 w-5" />}
            {label === "Media" && <ImageIcon className="h-5 w-5" />}
            {label === "Feature Flags" && <Flag className="h-5 w-5" />}
            {label === "A/B Testing" && <TestTube className="h-5 w-5" />}
            {label === "Analytics" && <BarChart className="h-5 w-5" />}
            {label === "Onboarding" && <UserPlus className="h-5 w-5" />}
            {label === "User Management" && <UserCog className="h-5 w-5" />}
            {label === "Roles" && <Shield className="h-5 w-5" />}
            {label === "General" && <Settings className="h-5 w-5" />}
            {label === "Security" && <Key className="h-5 w-5" />}
            {label === "Integrations" && <Link className="h-5 w-5" />}
          </div>
        }
        label={label}
        active={active}
        onClick={handleClick}
      />
    </div>
  );
};

// Sortable Sections component
const SortableSections = ({
  control,
  activeItem,
  onItemClick,
}: {
  control: Control;
  activeItem: string;
  onItemClick: (item: string) => void;
}) => {
  const [sections, setSections] = React.useState(control.sections);
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveSection(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(
          (item) => `${control.id}-${item}` === active.id
        );
        const newIndex = items.findIndex(
          (item) => `${control.id}-${item}` === over.id
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveSection(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-1 mt-1 pl-4">
        <SortableContext
          items={sections.map((section) => `${control.id}-${section}`)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableSection
              key={`${control.id}-${section}`}
              id={`${control.id}-${section}`}
              label={section}
              active={activeItem === section}
              onClick={() => {
                const sectionId = section;
                onItemClick(sectionId);
              }}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeSection ? (
          <MenuItem
            icon={<div className="w-5" />}
            label={activeSection.split(`${control.id}-`)[1] || ""}
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
}: ControlsSectionProps) {
  const [controlsSectionOpen, setControlsSectionOpen] = React.useState(true);
  const [openControls, setOpenControls] = React.useState<Set<string>>(
    new Set(["content"])
  );
  const [hoveredControl, setHoveredControl] = React.useState<string | null>(
    null
  );
  const setCurrentRoute = useStore((state) => state.setCurrentRoute);

  // Example controls - in a real app, this would come from your data source
  const [controls, setControls] = React.useState<Control[]>([
    {
      id: "content",
      name: "Content",
      sections: ["Blog Posts", "Pages", "Media"],
    },
    {
      id: "features",
      name: "Features",
      sections: ["Feature Flags", "A/B Testing", "Analytics"],
    },
    {
      id: "users",
      name: "Users",
      sections: ["Onboarding", "User Management", "Roles"],
    },
    {
      id: "settings",
      name: "Settings",
      sections: ["General", "Security", "Integrations"],
    },
  ]);

  const [activeControl, setActiveControl] = React.useState<string | null>(null);
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

  const toggleControl = (controlId: string) => {
    setOpenControls((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(controlId)) {
        newSet.delete(controlId);
      } else {
        newSet.add(controlId);
      }
      return newSet;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveControl(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setControls((items) => {
        const oldIndex = items.findIndex((control) => control.id === active.id);
        const newIndex = items.findIndex((control) => control.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveControl(null);
  };

  const handleDashboardClick = () => {
    setActiveItem("Dashboard");
    setCurrentRoute("Dashboard");
  };

  return (
    <div className="space-y-2">
      {/* Dashboard Button */}
      <MenuItem
        icon={<LayoutDashboard className="h-4 w-4" />}
        label="Dashboard"
        active={activeItem === "Dashboard"}
        onClick={handleDashboardClick}
      />

      <Collapsible
        open={controlsSectionOpen}
        onOpenChange={setControlsSectionOpen}
        className="py-3"
      >
        <div className="flex items-center justify-between px-2 mb-1">
          <CollapsibleTrigger asChild>
            <button className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground hover:scale-[1.02] transition-transform duration-200">
              <span className="flex items-center gap-1.5">
                <span>CONTROL PANEL</span>
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
                  items={controls.map((control) => control.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {controls.map((control) => (
                    <SortableControl
                      key={control.id}
                      control={control}
                      active={activeItem === control.id}
                      isOpen={openControls.has(control.id)}
                      hoveredControl={hoveredControl}
                      setHoveredControl={setHoveredControl}
                      toggleControl={() => toggleControl(control.id)}
                      onItemClick={() => setActiveItem(control.id)}
                      setActiveItem={setActiveItem}
                    />
                  ))}
                </SortableContext>
              </div>

              <DragOverlay>
                {activeControl ? (
                  <MenuItem
                    icon={
                      <div className="h-5 w-5">
                        {controls.find((c) => c.id === activeControl)?.name[0]}
                      </div>
                    }
                    label={
                      controls.find((c) => c.id === activeControl)?.name || ""
                    }
                    active={activeItem === activeControl}
                    onClick={() => {}}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="space-y-1">
              {controls.map((control) => (
                <StaticControl
                  key={control.id}
                  control={control}
                  active={activeItem === control.id}
                  isOpen={openControls.has(control.id)}
                  hoveredControl={hoveredControl}
                  setHoveredControl={setHoveredControl}
                  toggleControl={() => toggleControl(control.id)}
                  onItemClick={() => setActiveItem(control.id)}
                  setActiveItem={setActiveItem}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
