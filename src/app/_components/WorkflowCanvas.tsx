import React from "react";

export function WorkflowCanvas() {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-2.75rem)] bg-muted/10">
      <div className="text-center max-w-md p-6 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium mb-2">Workflow Canvas</h3>
        <p className="text-muted-foreground text-sm">
          This is the app's workflow canvas, where you can create and edit
          workflows using drag and drop functionality. The implementation of the
          drag and drop feature will be added later.
        </p>
      </div>
    </div>
  );
}
