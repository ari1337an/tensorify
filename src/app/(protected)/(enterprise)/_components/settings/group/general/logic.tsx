"use client";

import * as React from "react";

export function useGeneralLogic() {
  const [workspaceName, setWorkspaceName] = React.useState(
    "Tensorify Workspace"
  );
  const [workspaceSlug, setWorkspaceSlug] = React.useState(
    "tensorify-workspace"
  );

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving workspace details:", { workspaceName, workspaceSlug });
  };

  return {
    workspaceName,
    workspaceSlug,
    setWorkspaceName,
    setWorkspaceSlug,
    handleSave,
  };
}

export default useGeneralLogic;
