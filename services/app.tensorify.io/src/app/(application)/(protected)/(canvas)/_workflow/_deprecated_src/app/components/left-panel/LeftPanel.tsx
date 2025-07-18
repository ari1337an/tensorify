"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import LeftPanelTypeItem from "./LeftPanelTypeItem";
import { Panel } from "@xyflow/react";
import NodeItem from "@/app/nodes/types/NodeItem.interface";
import defaultNodes from "@/app/nodes/lists/defaultNodes";

const LeftPanel = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNestedSheetOpen, setIsNestedSheetOpen] = useState(false);
  const [nestedItems, setNestedItems] = useState<NodeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nestedSearchTerm, setNestedSearchTerm] = useState("");

  const items = defaultNodes;

  const handleParentClick = (children?: NodeItem[]) => {
    setSearchTerm(""); // Clear the search bar
    if (children && children.length > 0) {
      setNestedItems(children);
      setIsNestedSheetOpen(true);
    }
  };

  const matchSearch = (text: string, search: string) => {
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    return words.every((word) => text.toLowerCase().includes(word));
  };

  const filterNodes = (nodes: NodeItem[], search: string): NodeItem[] => {
    return nodes.filter(
      (node) =>
        matchSearch(node.title, search) || matchSearch(node.description, search)
    );
  };

  const parentResults = filterNodes(items, searchTerm).map((item) => ({
    ...item,
    children: item.children ? filterNodes(item.children, searchTerm) : [],
  }));

  const allChildResults = items.flatMap((parent) =>
    parent.children ? filterNodes(parent.children, searchTerm) : []
  );

  const shouldShowParentResults = parentResults.length > 0;
  const resultsToShow = shouldShowParentResults
    ? parentResults
    : allChildResults;

  const renderSearchBar = (
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div className="flex items-center border-b px-3 bg-popover text-popover-foreground">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        value={value}
        onChange={onChange}
        type="text"
        placeholder="Search node..."
        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );

  return (
    <Panel
      className="text-white rounded-full bg-orange-500 p-2 text-center flex flex-row items-center justify-center hover:bg-orange-700"
      position="top-left"
    >
      {/* Main Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <button
            onClick={() => setIsSheetOpen(true)}
            className="text-white rounded-full bg-orange-500 p-2 text-center flex items-center justify-center hover:bg-orange-700"
          >
            <Plus className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="text-center p-4">
              Select Node Category
            </SheetTitle>
            {renderSearchBar(searchTerm, (e) => setSearchTerm(e.target.value))}
            <ScrollArea className="mt-4 h-[calc(100vh-100px)] sm:h-[calc(100vh-150px)] lg:h-[calc(100vh-200px)] w-full rounded-md">
              {resultsToShow.length > 0 ? (
                shouldShowParentResults ? (
                  parentResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleParentClick(item.children)}
                      className="hover:cursor-pointer"
                    >
                      <LeftPanelTypeItem
                        id={item.id}
                        Icon={item.Icon}
                        draggable={item.draggable}
                        title={item.title}
                        description={item.description}
                        {...(item.draggable ? { version: item.version } : {})}
                      />
                    </div>
                  ))
                ) : (
                  allChildResults.map((child) => (
                    <LeftPanelTypeItem
                      id={child.id}
                      draggable={child.draggable}
                      key={child.id}
                      Icon={child.Icon}
                      title={child.title}
                      description={child.description}
                      {...(child.draggable ? { version: child.version } : {})}
                    />
                  ))
                )
              ) : (
                <div className="text-center text-muted-foreground mt-4">
                  No results found.
                </div>
              )}
            </ScrollArea>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* Nested Sheet */}
      <Sheet open={isNestedSheetOpen} onOpenChange={setIsNestedSheetOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Choose Your Node</SheetTitle>
            {renderSearchBar(nestedSearchTerm, (e) =>
              setNestedSearchTerm(e.target.value)
            )}
            <ScrollArea className="mt-4 h-[calc(100vh-100px)] sm:h-[calc(100vh-150px)] lg:h-[calc(100vh-200px)] w-full rounded-md">
              {nestedItems.length > 0 ? (
                filterNodes(nestedItems, nestedSearchTerm).map((child) => (
                  <LeftPanelTypeItem
                    id={child.id}
                    draggable={child.draggable}
                    key={child.id}
                    Icon={child.Icon}
                    title={child.title}
                    description={child.description}
                    {...(child.draggable ? { version: child.version } : {})}
                  />
                ))
              ) : (
                <div className="text-center text-muted-foreground mt-4">
                  No results found.
                </div>
              )}
            </ScrollArea>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </Panel>
  );
};

export default LeftPanel;
