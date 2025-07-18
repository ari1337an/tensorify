import { Panel, useStoreApi } from "@xyflow/react";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import useStore from "@/app/store/store";
import { normalizeRoute } from "@/lib/routeHelper";
import { getBreadcrumbSegments } from "@/lib/breadcrumbUtils";

const routeSelector = (state: { route: string }) => state.route;

export default function CanvasBreadcrumb() {
  const route = useStore(routeSelector); // Get current route
  const setRoute = useStore((s) => s.setRoute); // Zustand selector

  const normalizedRoute = normalizeRoute(route);

  // Hide breadcrumb when on root "/"
  if (normalizedRoute === "/") return null;

  const segments = getBreadcrumbSegments(normalizedRoute); // Generate breadcrumb segments

  return (
    <Panel position="bottom-center">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home Link */}
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={() => setRoute("/")}>
              Workflow Name {/* TODO: Workflow name here */}
            </BreadcrumbLink>
          </BreadcrumbItem>

          {segments.map((segment, index) => (
            <React.Fragment key={segment.path}>
              <BreadcrumbSeparator />
              {segment.name === "..." ? (
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={() => setRoute(segment.path)}
                  >
                    {segment.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </Panel>
  );
}
