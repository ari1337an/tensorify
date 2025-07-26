import { type NodeProps } from "@xyflow/react";
import { ReactNode, useRef, useState, useEffect } from "react";
import React from "react";
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
import useWorkflowStore, {
  addRouteLevel,
  type WorkflowNode,
} from "../../../store/workflowStore";

type TNodeProps = NodeProps<WorkflowNode> & {
  children: ReactNode;
};

export default function TNode({
  children,
  selected,
  data,
  id,
  type,
}: TNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editingLabel, setEditingLabel] = useState(data.label || id);
  const nodeRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const setRoute = useWorkflowStore((state) => state.setRoute);
  const currentRoute = useWorkflowStore((state) => state.currentRoute);

  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🔥 TNode handleClick fired!", { id, selected, type });
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleNestedClick = () => {
    console.log("🔥 TNode handleNestedClick fired!", { id, currentRoute });
    setRoute(addRouteLevel(currentRoute, id));
  };

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLabel(true);
    setEditingLabel(data.label || id);
  };

  const handleLabelSave = () => {
    const newLabel = editingLabel.trim() || id;
    updateNodeData(id, { label: newLabel });
    setIsEditingLabel(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLabelSave();
    } else if (e.key === "Escape") {
      setIsEditingLabel(false);
      setEditingLabel(data.label || id);
    }
  };

  console.log("🔥 TNode render:", { id, selected, isOpen, type });

  return (
    <>
      <div className="relative">
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

        {/* Label below the node */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[120px]">
          {isEditingLabel ? (
            <input
              ref={labelInputRef}
              type="text"
              value={editingLabel}
              onChange={(e) => setEditingLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleLabelKeyDown}
              className="text-xs text-center w-full px-1 py-0.5 bg-background border border-border rounded text-foreground focus:outline-none focus:border-primary"
              maxLength={25}
            />
          ) : (
            <p
              className="text-xs text-center text-muted-foreground cursor-pointer hover:text-foreground transition-colors truncate px-1"
              onDoubleClick={handleLabelDoubleClick}
              title={`${data.label || id} - Double-click to edit`}
            >
              {data.label || id}
            </p>
          )}
        </div>
      </div>

      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          console.log("🔥 Sheet onOpenChange:", { open, isOpen, nodeId: id });
          if (!open && nodeRef.current?.contains(document.activeElement)) {
            return; // Don't close if the node itself has focus
          }
          setIsOpen(open); // Update the state to match the sheet's desired state
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          <div className="flex flex-col gap-6 h-full">
            <DialogTitle className="text-xl font-semibold text-center">
              Node Settings - {data.label || id}
            </DialogTitle>

            <Tabs
              defaultValue="properties"
              className="flex flex-col gap-4 flex-1"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="scope">Variables</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="flex-1 space-y-4">
                <div className="space-y-4">
                  {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium">
                        {key}
                      </Label>
                      {typeof value === "string" ? (
                        <Textarea
                          id={key}
                          value={value}
                          onChange={(evt) =>
                            updateNodeData(id, { [key]: evt.target.value })
                          }
                          placeholder={`Enter ${key}`}
                          className="min-h-[80px] resize-none"
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

              <TabsContent value="scope" className="flex-1">
                <div className="text-sm text-muted-foreground">
                  View the current scope variables.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
