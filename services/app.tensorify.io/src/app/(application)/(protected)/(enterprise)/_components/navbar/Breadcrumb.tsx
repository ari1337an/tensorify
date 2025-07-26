"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Breadcrumb as BreadcrumbContainer,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbPage,
} from "@/app/_components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import useStore from "@/app/_store/store";
import useWorkflowStore, {
  getRouteLevels,
} from "../../../(canvas)/_workflow/store/workflowStore";

// Define the segment type with optional ellipsis
type BreadcrumbSegment = {
  name: string;
  path: string;
  type: "project" | "workflow" | "node";
  isEllipsis?: boolean;
};

// Helper function to get breadcrumb segments from the current state
const getBreadcrumbSegments = (
  projectName?: string,
  workflowName?: string,
  currentRoute?: string
): { name: string; path: string; type: "project" | "workflow" | "node" }[] => {
  const segments: {
    name: string;
    path: string;
    type: "project" | "workflow" | "node";
  }[] = [];

  // Add project segment
  if (projectName) {
    segments.push({
      name: projectName,
      path: "/projects",
      type: "project",
    });
  }

  // Add workflow segment
  if (workflowName) {
    segments.push({
      name: workflowName,
      path: "/",
      type: "workflow",
    });
  }

  // Add node segments from route
  if (currentRoute && currentRoute !== "/") {
    const routeLevels = getRouteLevels(currentRoute);
    let accumulatedPath = "";

    routeLevels.forEach((level: string) => {
      accumulatedPath += `/${level}`;
      segments.push({
        name: level,
        path: accumulatedPath,
        type: "node",
      });
    });
  }

  return segments;
};

// Smart truncation logic with workflow-first strategy
const getSmartSegments = (
  segments: {
    name: string;
    path: string;
    type: "project" | "workflow" | "node";
  }[]
): BreadcrumbSegment[] => {
  // If 4 or fewer segments, always show all
  if (segments.length <= 4) {
    return segments;
  }

  // For 5+ segments, use workflow-first smart truncation
  // Strategy: Workflow + ... + Last 2 nodes (only if there are actually hidden segments)

  const workflowIndex = segments.findIndex((seg) => seg.type === "workflow");
  const lastTwo = segments.slice(-2);

  // If we can't find workflow, fall back to first segment
  const startSegment =
    workflowIndex >= 0 ? segments[workflowIndex] : segments[0];

  // Calculate how many segments would be hidden
  const hiddenCount = segments.length - 3; // start + last2 = 3 shown segments

  // Only show ellipsis if there are actually 2+ segments being hidden
  if (hiddenCount >= 2) {
    return [
      startSegment,
      { name: "...", path: "", type: "node", isEllipsis: true },
      ...lastTwo,
    ];
  }

  // If only 1 segment would be hidden, just show all (no ellipsis needed)
  return segments;
};

export function Breadcrumb() {
  const { currentWorkflow } = useStore();
  const { currentRoute, setRoute } = useWorkflowStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const allSegments = getBreadcrumbSegments(
    currentWorkflow?.projectName,
    currentWorkflow?.name,
    currentRoute
  );

  const displaySegments: BreadcrumbSegment[] = isExpanded
    ? allSegments
    : getSmartSegments(allSegments);

  const shouldShowExpansion = allSegments.length > displaySegments.length;
  const hasEllipsisInDisplay = displaySegments.some((seg) => seg.isEllipsis);
  const shouldShowExpandButton = shouldShowExpansion && !hasEllipsisInDisplay;

  // Auto-collapse logic
  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
    setShowTooltip(false);
  }, []);

  // Auto-collapse after 5 seconds when expanded
  useEffect(() => {
    if (isExpanded) {
      timeoutRef.current = setTimeout(handleCollapse, 5000);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isExpanded, handleCollapse]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        breadcrumbRef.current &&
        !breadcrumbRef.current.contains(event.target as Node)
      ) {
        handleCollapse();
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, handleCollapse]);

  // Close on route change
  useEffect(() => {
    handleCollapse();
  }, [currentRoute, handleCollapse]);

  const handleNavigation = (path: string, type: string) => {
    if (type === "project") {
      console.log("Navigate to projects");
    } else if (type === "workflow" || type === "node") {
      setRoute(path);
    }
    handleCollapse(); // Auto-collapse after navigation
  };

  const handleExpand = () => {
    if (shouldShowExpansion) {
      setIsExpanded(true);
      setShowTooltip(false);
    }
  };

  const handleMouseEnter = () => {
    if ((shouldShowExpansion || hasEllipsisInDisplay) && !isExpanded) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Calculate tooltip info
  const hiddenSegmentsCount =
    allSegments.length -
    displaySegments.filter((seg) => !seg.isEllipsis).length;
  const hasHiddenSegments = hiddenSegmentsCount > 0;

  return (
    <div className="relative w-full flex-shrink-0">
      {/* Main Breadcrumb Container */}
      <div
        ref={breadcrumbRef}
        className={`
          relative transition-all duration-300 ease-in-out
          ${isExpanded ? "z-50" : "z-10"}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Backdrop when expanded */}
        {isExpanded && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
        )}

        {/* Breadcrumb Content */}
        <div
          className={`
            flex items-center transition-all duration-300 ease-in-out
            ${
              isExpanded
                ? "absolute top-0 left-0 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg px-4 py-2 z-50 min-w-max"
                : "relative bg-transparent overflow-hidden max-w-full"
            }
          `}
        >
          <BreadcrumbContainer>
            <BreadcrumbList className="flex-nowrap whitespace-nowrap">
              {displaySegments.map((segment, index) => (
                <React.Fragment key={`${segment.path}-${index}`}>
                  {segment.isEllipsis ? (
                    <BreadcrumbItem>
                      <button
                        onClick={handleExpand}
                        className="flex items-center justify-center hover:bg-accent rounded-sm p-1 transition-colors"
                        aria-label="Expand full breadcrumb path"
                      >
                        <BreadcrumbEllipsis className="text-muted-foreground" />
                      </button>
                    </BreadcrumbItem>
                  ) : (
                    <BreadcrumbItem>
                      {index === displaySegments.length - 1 ? (
                        <BreadcrumbPage className="font-medium text-foreground">
                          {segment.name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigation(segment.path, segment.type);
                          }}
                          className={`
                            text-sm transition-colors font-medium cursor-pointer
                            ${
                              segment.type === "project"
                                ? "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                : segment.type === "workflow"
                                  ? "text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                  : "text-muted-foreground hover:text-foreground"
                            }
                          `}
                        >
                          {segment.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  )}

                  {index < displaySegments.length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </BreadcrumbContainer>

          {/* Expand button when not expanded and has more segments (but no ellipsis in middle) */}
          {!isExpanded && shouldShowExpandButton && (
            <button
              onClick={handleExpand}
              className="ml-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              aria-label="Expand full breadcrumb path"
            >
              ...
            </button>
          )}

          {/* Close button when expanded */}
          {isExpanded && (
            <button
              onClick={handleCollapse}
              className="ml-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Collapse breadcrumb"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Hover Tooltip */}
      {showTooltip &&
        !isExpanded &&
        (shouldShowExpansion || hasEllipsisInDisplay) && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <div className="bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg border border-border">
              <div className="text-sm font-medium">
                {hasHiddenSegments && hiddenSegmentsCount > 0
                  ? `${hiddenSegmentsCount} segment${hiddenSegmentsCount > 1 ? "s" : ""} hidden`
                  : "Expand full path"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Click &ldquo;...&rdquo; to view all • Click segments to navigate
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
