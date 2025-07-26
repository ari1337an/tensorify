"use client";

import { ReactNode, useRef, useState } from "react";
import React from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { Sheet, SheetContent } from "@/app/_components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import useWorkflowStore, { addRouteLevel } from "../../../store/workflowStore";
import {
  type WorkflowNode,
  type WorkflowNodeData,
} from "../../../store/workflowStore";

// TNode now accepts NodeProps<WorkflowNode> and children
type TNodeProps = NodeProps<WorkflowNode> & {
  children: ReactNode;
};

export default function TNode(props: TNodeProps) {
  const { children, selected, data, id, type, ...nodeProps } = props;

  const [isOpen, setIsOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const setRoute = useWorkflowStore((state) => state.setRoute);
  const currentRoute = useWorkflowStore((state) => state.currentRoute);

  // Extract route and version safely - these properties might be in nodeProps
  // or we fall back to defaults from the workflow store
  const route = (nodeProps as any).route || currentRoute;
  const version = (nodeProps as any).version || "1.0.0";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleNestedClick = () => {
    setRoute(addRouteLevel(currentRoute, id));
  };

  return (
    <>
      {selected ? (
        type === "@tensorify/core/CustomNestedNode" ? (
          <div ref={nodeRef} onClick={handleNestedClick}>
            {children}
          </div>
        ) : (
          <div ref={nodeRef} onClick={handleClick}>
            {children}
          </div>
        )
      ) : (
        children
      )}

      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && nodeRef.current?.contains(document.activeElement))
            return;
          setIsOpen(open);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          <DialogTitle className="text-center p-4 text-xl font-semibold">
            Node Settings
          </DialogTitle>
          <div>
            <Tabs defaultValue="properties" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="scope">Variables</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="space-y-4">
                <div className="grid gap-4 py-4">
                  {/* Node metadata */}
                  <div className="grid gap-2 p-3 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium">Node Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">ID:</span>
                        <span className="ml-1 font-mono">{id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-1 font-mono">
                          {type || "default"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Route:</span>
                        <span className="ml-1 font-mono">{route}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <span className="ml-1 font-mono">{version}</span>
                      </div>
                    </div>
                  </div>

                  {/* Editable properties */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Properties</h4>
                    {Object.entries(data).map(([key, value]) => (
                      <div key={key} className="grid w-full gap-2">
                        <Label htmlFor={key} className="text-sm font-medium">
                          {key}
                        </Label>
                        {typeof value === "string" && value.length > 50 ? (
                          <Textarea
                            id={key}
                            value={value}
                            onChange={(evt) =>
                              updateNodeData(id, { [key]: evt.target.value })
                            }
                            placeholder={`Enter ${key}`}
                            className="min-h-[80px]"
                          />
                        ) : (
                          <Input
                            id={key}
                            type="text"
                            value={value as string | number}
                            onChange={(evt) =>
                              updateNodeData(id, { [key]: evt.target.value })
                            }
                            placeholder={`Enter ${key}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scope" className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Variable scope analysis coming soon...
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will show the current scope variables and their values.
                  </p>
                  <div className="mt-3 text-xs">
                    <p>
                      <span className="font-medium">Current Route:</span>{" "}
                      {route}
                    </p>
                    <p>
                      <span className="font-medium">Node Version:</span>{" "}
                      {version}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
