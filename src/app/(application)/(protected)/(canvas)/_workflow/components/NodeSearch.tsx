"use client";

import React, { useMemo, useState } from "react";
import { Panel } from "@xyflow/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Plus, Search, ChevronRight, ArrowLeft } from "lucide-react";
import defaultNodes from "../data/defaultNodes";
import { type NodeItem } from "../types/NodeItem";
import { ScrollArea } from "@/app/_components/ui/scroll-area";

const NodeListItem = ({
  item,
  onClick,
}: {
  item: NodeItem;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex items-center gap-3.5 p-3 rounded-lg transition-colors duration-200 hover:bg-muted/70"
    >
      <div className="flex-shrink-0 bg-muted/40 rounded-md p-2.5 transition-colors duration-200 group-hover:bg-primary/10">
        <div className="relative z-10 text-primary transition-transform duration-200 group-hover:scale-110">
          <item.Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex-grow">
        <p className="font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      {item.children && item.children.length > 0 && (
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      )}
    </div>
  );
};

const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="px-3 py-1 sticky top-0 z-10">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for a node..."
        className="w-full pl-9 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

export default function NodeSearch() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNestedSheetOpen, setIsNestedSheetOpen] = useState(false);
  const [nestedContent, setNestedContent] = useState<{
    title: string;
    items: NodeItem[];
  }>({ title: "", items: [] });

  const [searchTerm, setSearchTerm] = useState("");
  const [nestedSearchTerm, setNestedSearchTerm] = useState("");

  const handleParentClick = (item: NodeItem) => {
    if (item.children && item.children.length > 0) {
      setNestedContent({ title: item.title, items: item.children });
      setIsNestedSheetOpen(true);
      setNestedSearchTerm("");
    }
  };

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const matchSearch = (text: string, search: string) =>
    text.toLowerCase().includes(search.toLowerCase());

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return defaultNodes;
    const lowercasedFilter = searchTerm.toLowerCase();

    const matchingCategories = defaultNodes.filter(
      (category) =>
        matchSearch(category.title, lowercasedFilter) ||
        matchSearch(category.description, lowercasedFilter)
    );

    if (matchingCategories.length > 0) {
      return matchingCategories;
    }

    const matchingChildren = defaultNodes.flatMap(
      (category) =>
        category.children?.filter(
          (child) =>
            matchSearch(child.title, lowercasedFilter) ||
            matchSearch(child.description, lowercasedFilter)
        ) || []
    );

    return matchingChildren;
  }, [searchTerm]);

  const filteredNestedNodes = useMemo(() => {
    if (!nestedSearchTerm) return nestedContent.items;
    return nestedContent.items.filter(
      (item) =>
        matchSearch(item.title, nestedSearchTerm) ||
        matchSearch(item.description, nestedSearchTerm)
    );
  }, [nestedSearchTerm, nestedContent.items]);

  return (
    <Panel position="top-right">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-12 rounded-xl border-border/40 hover:border-primary/30 hover:bg-card shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <Plus className="size-6 text-primary" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md border-l border-border/50 backdrop-blur-xl bg-card/90 p-0 flex flex-col"
          onInteractOutside={(e) => {
            if (isNestedSheetOpen) {
              e.preventDefault();
            }
          }}
        >
          <SheetHeader className="p-4 border-b border-border/50">
            <SheetTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Add Node
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              Browse nodes and drag them to the canvas.
            </SheetDescription>
          </SheetHeader>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScrollArea className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            <div className="flex flex-col gap-1 p-3">
              {filteredNodes.map((item) => (
                <div
                  key={item.id}
                  draggable={item.draggable}
                  onDragStart={(e) => item.draggable && onDragStart(e, item.id)}
                  className={
                    item.draggable
                      ? "cursor-grab"
                      : item.children && item.children.length > 0
                        ? "cursor-pointer"
                        : "cursor-default"
                  }
                >
                  <NodeListItem
                    item={item}
                    onClick={() => handleParentClick(item)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={isNestedSheetOpen} onOpenChange={setIsNestedSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md border-l border-border/50 backdrop-blur-xl bg-card/90 p-0 flex flex-col"
          showOverlay={false}
        >
          <SheetHeader className="p-4 border-b border-border/50">
            <button
              onClick={() => setIsNestedSheetOpen(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 -ml-1"
            >
              <ArrowLeft className="h-4 w-4" />
              All Categories
            </button>
            <SheetTitle className="text-xl font-semibold">
              {nestedContent.title}
            </SheetTitle>
          </SheetHeader>
          <SearchBar
            value={nestedSearchTerm}
            onChange={(e) => setNestedSearchTerm(e.target.value)}
          />
          <ScrollArea className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            <div className="flex flex-col gap-1 p-3">
              {filteredNestedNodes.map((item) => (
                <div
                  key={item.id}
                  draggable={item.draggable}
                  onDragStart={(e) => onDragStart(e, item.id)}
                  className={item.draggable ? "cursor-grab" : "cursor-default"}
                >
                  <NodeListItem item={item} onClick={() => {}} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </Panel>
  );
}
