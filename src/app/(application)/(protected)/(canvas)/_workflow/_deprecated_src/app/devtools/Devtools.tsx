import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { Panel } from "@xyflow/react";
import ChangeLogger from "./ChangeLogger";
import NodeInspector from "./NodeInspector";
import ViewportLogger from "./ViewportLogger";
import RouteInspector from "./RouteInspector";

export default function DevTools() {
  const [nodeInspectorActive, setNodeInspectorActive] = useState(false);
  const [changeLoggerActive, setChangeLoggerActive] = useState(false);
  const [viewportLoggerActive, setViewportLoggerActive] = useState(false);
  const [routeInspectorActive, setRouteInspectorActive] = useState(false);

  return (
    <>
      <Panel
        position="top-center"
        className="flex flex-row items-center justify-center gap-x-2"
      >
        <DevToolButton
          className={`opacity-1 text-white rounded-lg bg-black border-2 p-2 text-center flex items-center justify-center hover:border-primary ${
            nodeInspectorActive ? "border-primary bg-primary" : "border-white"
          }`}
          setActive={setNodeInspectorActive}
          active={nodeInspectorActive}
          title="Toggle Node Inspector"
        >
          Node Inspector
        </DevToolButton>
        <DevToolButton
          className={`opacity-1 text-white rounded-lg bg-black border-2 p-2 text-center flex items-center justify-center hover:border-primary ${
            changeLoggerActive ? "border-primary bg-primary" : "border-white"
          }`}
          setActive={setChangeLoggerActive}
          active={changeLoggerActive}
          title="Toggle Change Logger"
        >
          Change Logger
        </DevToolButton>
        <DevToolButton
          className={`opacity-1 text-white rounded-lg bg-black border-2 p-2 text-center flex items-center justify-center hover:border-primary ${
            viewportLoggerActive ? "border-primary bg-primary" : "border-white"
          }`}
          setActive={setViewportLoggerActive}
          active={viewportLoggerActive}
          title="Toggle Viewport Logger"
        >
          Viewport Logger
        </DevToolButton>
        <DevToolButton
          className={`opacity-1 text-white rounded-lg bg-black border-2 p-2 text-center flex items-center justify-center hover:border-primary ${
            routeInspectorActive ? "border-primary bg-primary" : "border-white"
          }`}
          setActive={setRouteInspectorActive}
          active={routeInspectorActive}
          title="Toggle Route Inspector"
        >
          Route Inspector
        </DevToolButton>
      </Panel>
      {changeLoggerActive && <ChangeLogger />}
      {nodeInspectorActive && <NodeInspector />}
      {viewportLoggerActive && <ViewportLogger />}
      {routeInspectorActive && <RouteInspector />}
    </>
  );
}

function DevToolButton({
  active,
  setActive,
  children,
  ...rest
}: {
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
} & HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={() => setActive((a) => !a)}
      className={active ? "active" : ""}
      {...rest}
    >
      {children}
    </button>
  );
}
