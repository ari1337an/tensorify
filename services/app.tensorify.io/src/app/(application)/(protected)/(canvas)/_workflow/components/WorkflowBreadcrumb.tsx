"use client";

import { Panel } from "@xyflow/react";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/app/_components/ui/breadcrumb";
import useWorkflowStore, { normalizeRoute } from "../store/workflowStore";
import useStore from "@/app/_store/store";

// Helper function to generate breadcrumb segments
const getBreadcrumbSegments = (
  route: string
): { name: string; path: string }[] => {
  const parts = route.split("/").filter(Boolean);
  const segments: { name: string; path: string }[] = [];

  let accumulatedPath = "";

  parts.forEach((part) => {
    accumulatedPath += `/${part}`;
    segments.push({ name: part, path: accumulatedPath });
  });

  // Show full path if there are only two or fewer segments
  if (segments.length <= 2) {
    return segments;
  }

  // Keep only the first, last two, and replace the middle with "..."
  return [segments[0], { name: "...", path: "" }, ...segments.slice(-2)];
};

export default function WorkflowBreadcrumb() {
  const currentRoute = useWorkflowStore((state) => state.currentRoute);
  const setRoute = useWorkflowStore((state) => state.setRoute);
  const currentWorkflow = useStore((state) => state.currentWorkflow);

  const normalizedRoute = normalizeRoute(currentRoute);

  // Hide breadcrumb when on root "/"
  if (normalizedRoute === "/") return null;

  const segments = getBreadcrumbSegments(normalizedRoute);

  return (
    <Panel position="bottom-center" className="z-10">
      <div className="backdrop-blur-sm bg-card/90 border border-border/50 rounded-lg px-4 py-2 shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home/Workflow Root Link */}
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={() => setRoute("/")}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {currentWorkflow?.name || "Workflow"}
              </BreadcrumbLink>
            </BreadcrumbItem>

            {segments.map((segment, index) => (
              <React.Fragment key={`${segment.path}-${index}`}>
                <BreadcrumbSeparator className="text-muted-foreground" />
                {segment.name === "..." ? (
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis className="text-muted-foreground" />
                  </BreadcrumbItem>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="#"
                      onClick={() => setRoute(segment.path)}
                      className={`
                        text-sm transition-colors
                        ${
                          index === segments.length - 1
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-primary"
                        }
                      `}
                    >
                      {segment.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </Panel>
  );
}
