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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { usePathname } from "next/navigation";
import { cn } from "@/app/_lib/utils";

type Control = {
  id: string;
  name: string;
  sections: string[];
  icon: React.ReactNode;
  isOpen?: boolean;
};

type ControlsSectionProps = {
  activeItem: string;
  setActiveItem: (item: string) => void;
};

// Regular control item for server-side rendering
const StaticControl = ({
  control,
  active,
  isOpen,
  setHoveredControl,
  toggleControl,
  onItemClick,
  setActiveItem,
}: {
  control: Control;
  active: boolean;
  isOpen: boolean;
  setHoveredControl: (id: string | null) => void;
  toggleControl: () => void;
  onItemClick: () => void;
  setActiveItem: (item: string) => void;
}) => {
  const pathname = usePathname();

  return (
    <div
      className="relative"
      onMouseEnter={() => setHoveredControl(control.id)}
      onMouseLeave={() => setHoveredControl(null)}
    >
      <Collapsible open={isOpen} onOpenChange={toggleControl}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200",
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <div className="flex items-center">
              <span className="text-lg flex-shrink-0">{control.icon}</span>
              <span className="truncate ml-2">{control.name}</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 mt-1 space-y-1">
          {control.sections.map((section) => (
            <MenuItem
              key={section}
              icon={<div className="h-4 w-4" />}
              label={section}
              href={`/${section.toLowerCase().replace(/\s+/g, "-")}`}
              active={
                pathname === `/${section.toLowerCase().replace(/\s+/g, "-")}`
              }
              onClick={() => {
                setActiveItem(section);
                onItemClick();
              }}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export function ControlsSection({
  activeItem,
  setActiveItem,
}: ControlsSectionProps) {
  const pathname = usePathname();
  const [controls, setControls] = React.useState<Control[]>([
    {
      id: "dashboard",
      name: "Dashboard",
      sections: [],
      icon: <LayoutDashboard className="h-5 w-5" />,
      isOpen: true,
    },
    {
      id: "content",
      name: "Content",
      sections: ["Blog Posts", "Pages", "Media"],
      icon: <FileText className="h-5 w-5" />,
      isOpen: false,
    },
    {
      id: "features",
      name: "Features",
      sections: ["Feature Flags", "A/B Testing", "Analytics"],
      icon: <Flag className="h-5 w-5" />,
      isOpen: false,
    },
    {
      id: "users",
      name: "Users",
      sections: ["Onboarding", "User Management", "Roles"],
      icon: <Users className="h-5 w-5" />,
      isOpen: false,
    },
    {
      id: "settings",
      name: "Settings",
      sections: ["General", "Security", "Integrations"],
      icon: <Settings className="h-5 w-5" />,
      isOpen: false,
    },
  ]);

  // Add useEffect to handle automatic section opening based on pathname
  React.useEffect(() => {
    const currentPath = pathname.toLowerCase();

    setControls((prevControls) =>
      prevControls.map((control) => {
        // Check if any section matches the current path
        const hasMatchingSection = control.sections.some((section) =>
          currentPath.includes(section.toLowerCase().replace(/\s+/g, "-"))
        );

        return {
          ...control,
          isOpen:
            hasMatchingSection ||
            (control.id === "dashboard" && currentPath === "/dashboard"),
        };
      })
    );
  }, [pathname]);

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const toggleControl = (controlId: string) => {
    setControls((prev) =>
      prev.map((control) =>
        control.id === controlId
          ? { ...control, isOpen: !control.isOpen }
          : control
      )
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setControls((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const handleDashboardClick = () => {
    setActiveItem("Dashboard");
  };

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  return (
    <div className="space-y-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={controls.map((control) => control.id)}
          strategy={verticalListSortingStrategy}
        >
          {controls.map((control) => (
            <div key={control.id}>
              {control.id === "dashboard" ? (
                <MenuItem
                  icon={control.icon}
                  label={control.name}
                  href="/dashboard"
                  active={pathname === "/dashboard"}
                  onClick={handleDashboardClick}
                />
              ) : (
                <StaticControl
                  control={control}
                  active={activeItem === control.name}
                  isOpen={control.isOpen || false}
                  setHoveredControl={() => {}}
                  toggleControl={() => toggleControl(control.id)}
                  onItemClick={() => handleItemClick(control.name)}
                  setActiveItem={setActiveItem}
                />
              )}
            </div>
          ))}
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="opacity-50">
              {controls.find((control) => control.id === activeId)?.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
