"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { CreatePluginInput } from "@/server/validation/plugin-schema";
import { PublishVersionDialog } from "./PublishVersionDialog";

export function PublishNewVersionButton({
  baseSlug,
  pluginData,
}: {
  baseSlug: string;
  pluginData: CreatePluginInput;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)} 
        data-testid="publish-new-version-button"
      >
        Publish New Version
      </Button>
      
      <PublishVersionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        baseSlug={baseSlug}
        pluginData={pluginData}
      />
    </>
  );
}
