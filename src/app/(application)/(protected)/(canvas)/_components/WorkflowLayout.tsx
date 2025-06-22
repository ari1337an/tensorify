"use client";

import { Workflow } from "@/app/_store/store";

export function WorkflowLayout({ workflow }: { workflow: Workflow }) {
  if (!workflow) return null;

  // beautify the json
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <pre>
        <code>{JSON.stringify(workflow, null, 2)}</code>
      </pre>
    </div>
  );
}
