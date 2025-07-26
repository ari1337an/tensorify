import { type NodeProps } from "@xyflow/react";
import { ReactNode, useRef, useState, useEffect } from "react";
import React from "react";
import { Sheet, SheetContent } from "@/app/_components/ui/sheet";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Badge } from "@/app/_components/ui/badge";
import { SettingsIcon, CodeIcon, TypeIcon } from "lucide-react";
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
        <SheetContent
          side="right"
          className="w-full sm:max-w-md border-l border-border/50 backdrop-blur-xl p-4"
        >
          <div className="flex flex-col h-full">
            <DialogHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SettingsIcon className="h-5 w-5 text-primary-readable" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-semibold">
                    Node Settings
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Configure properties and variables for this node
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {data.label || id}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {type?.split("/").pop() || "Node"}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs
              defaultValue="properties"
              className="flex flex-col flex-1 overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="properties"
                  className="flex items-center gap-2"
                >
                  <CodeIcon className="h-4 w-4" />
                  Properties
                </TabsTrigger>
                <TabsTrigger value="scope" className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" />
                  Variables
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="flex-1 overflow-auto">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Node Properties</CardTitle>
                    <CardDescription>
                      Customize the behavior and appearance of this node
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(data).map(([key, value]) => (
                      <div key={key} className="space-y-3">
                        <Label
                          htmlFor={key}
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          {key === "label" && (
                            <Badge variant="outline" className="text-xs">
                              Display Name
                            </Badge>
                          )}
                        </Label>
                        {typeof value === "string" && value.length > 50 ? (
                          <Textarea
                            id={key}
                            value={value}
                            onChange={(evt) =>
                              updateNodeData(id, { [key]: evt.target.value })
                            }
                            placeholder={`Enter ${key
                              .replace(/([A-Z])/g, " $1")
                              .trim()
                              .toLowerCase()}`}
                            className="min-h-[100px] resize-none"
                          />
                        ) : (
                          <Input
                            id={key}
                            type="text"
                            value={value as string | number}
                            onChange={(evt) =>
                              updateNodeData(id, { [key]: evt.target.value })
                            }
                            placeholder={`Enter ${key
                              .replace(/([A-Z])/g, " $1")
                              .trim()
                              .toLowerCase()}`}
                            className="transition-colors"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scope" className="flex-1">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Scope Variables</CardTitle>
                    <CardDescription>
                      Variables available in the current execution context
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32 text-center">
                      <div className="space-y-2">
                        <TypeIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          No variables available in current scope
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Variables will appear here during execution
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
