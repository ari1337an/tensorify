import React from "react";
import { FileQuestion } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="text-center max-w-md p-6 rounded-lg border border-dashed">
        <div className="flex justify-center mb-4">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <p className="text-sm text-muted-foreground">
          Please select a valid option from the sidebar.
        </p>
      </div>
    </div>
  );
}
