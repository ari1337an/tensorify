import { Node, Position } from "@xyflow/react";
import { ReactNode, useRef, useState } from "react";
import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useStore from "@/app/store/store";
import { addRouteLevel } from "@/lib/routeHelper";

type TNodeProps = {
  id: string;
  data: Node["data"];
  version?: string;
  route: string;
  dragHandle?: string;
  type?: string;
  selected?: boolean;
  isConnectable?: boolean;
  zIndex?: number;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
  dragging: boolean;
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
}: TNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null); // Reference to the node element
  const updateNodeData = useStore((state) => state.updateNodeData);
  const setRoute = useStore((state) => state.setRoute);
  const currentRoute = useStore((state) => state.route);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleNestedClick = () => {
    setRoute(addRouteLevel(currentRoute, id)); // TODO: later figure out what would be the level name for users convenience
    // TODO: editable label name for the nested node
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
        }}
      >
        <SheetContent side="right">
          <DialogTitle className="text-center p-4">Settings</DialogTitle>
          <div>
            <Tabs defaultValue="properties" className="w-full">
              <TabsList className="flex flex-row justify-center">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="scope">Variables</TabsTrigger>
              </TabsList>
              <TabsContent value="properties">
                <div className="grid py-4">
                  {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="grid w-full gap-1.5">
                      <Label htmlFor={key}>{key}</Label>
                      {typeof value === "string" ? (
                        <Textarea
                          id={key}
                          value={value}
                          onChange={(evt) =>
                            updateNodeData(id, { [key]: evt.target.value })
                          }
                          placeholder={`Enter ${key}`}
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
              <TabsContent value="scope">
                View the current scope variables.{" "}
                {/* TODO: Calculate the variable scopes and render them */}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
