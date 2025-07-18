import { Button } from "@/components/ui/button";
import { Panel } from "@xyflow/react";
import { ArrowRightFromLine } from "lucide-react";
import React from "react";

export default function ExportPanel() {
  return (
    <Panel position="top-right">
      <Button variant="outline" className="bg-primary hover:bg-primary/80">
        <ArrowRightFromLine className="h-4 w-4" />
        Export
      </Button>
    </Panel>
  );
}
