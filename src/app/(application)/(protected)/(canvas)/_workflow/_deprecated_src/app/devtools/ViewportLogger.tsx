import { Panel, useStore } from "@xyflow/react";

export default function ViewportLogger() {
  const viewport = useStore(
    (s) =>
      `x: ${s.transform[0].toFixed(2)}, y: ${s.transform[1].toFixed(
        2
      )}, zoom: ${s.transform[2].toFixed(2)}`
  );

  return <Panel position="bottom-center" className="z-10 bg-black border-2 border-primary text-white px-2 py-1 rounded-sm">{viewport}</Panel>;
}
