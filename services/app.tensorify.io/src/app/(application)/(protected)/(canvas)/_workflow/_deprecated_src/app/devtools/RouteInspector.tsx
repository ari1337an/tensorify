import { Panel } from "@xyflow/react";
import React from "react";
import useStore from "@/app/store/store";

const routeSelector = (state: { route: string }) => state.route;

export default function RouteInspector() {
  const route = useStore(routeSelector); // Get current route
  return (
    <Panel
      position="bottom-right"
      className="z-20 bg-black border-2 border-primary text-white px-2 py-1 rounded-sm"
    >
      {route}
    </Panel>
  );
}
