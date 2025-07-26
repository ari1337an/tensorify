"use client";

import { ReactNode, useRef, useState } from "react";
import React from "react";
import { Position } from "@xyflow/react";
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
import { type WorkflowNodeData } from "../../../store/workflowStore";

type TNodeProps = {
  id: string;
  data: WorkflowNodeData;
  version?: string;
  route: string;
  dragHandle?: string;
  type?: string;
  selected?: boolean;
  isConnectable?: boolean;
  zIndex?: number;
  positionAbsoluteX?: number;
  positionAbsoluteY?: number;
  dragging?: boolean;
  targetPosition?: Position;
  sourcePosition?: Position;
  children: ReactNode;
};

export default function TNode({
  children,
  selected,
  data,
  id,
  type,
  route,
}: TNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const setRoute = useWorkflowStore((state) => state.setRoute);
  const currentRoute = useWorkflowStore((state) => state.currentRoute);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
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
              </TabsContent>

              <TabsContent value="scope" className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Variable scope analysis coming soon...
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will show the current scope variables and their values.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
