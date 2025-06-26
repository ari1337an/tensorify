"use client";

import React from "react";
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
import {
  Plus,
  Webhook,
  MessageCircle,
  Database,
  Search,
  ChevronRight,
} from "lucide-react";

const nodeTypes = [
  {
    icon: <Webhook className="h-6 w-6" />,
    name: "Webhook",
    description: "Trigger workflow from a webhook.",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    name: "Send Message",
    description: "Send a message to a user or channel.",
  },
  {
    icon: <Database className="h-6 w-6" />,
    name: "Database Query",
    description: "Run a query on your connected database.",
  },
];

const NodeListItem = ({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="group relative flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg border border-border/40 hover:border-primary/30 bg-card/50 hover:bg-card">
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Icon container with animated background */}
          <div className="relative flex-shrink-0 bg-muted/30 rounded-lg p-3 group-hover:bg-primary/10 transition-colors duration-300 overflow-hidden">
            <div className="relative z-10 text-primary group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="flex-grow space-y-1">
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {name}
            </p>
            <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {description}
            </p>
          </div>

          {/* Arrow icon with animation */}
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-l border-border/50 backdrop-blur-xl bg-card/95"
      >
        <SheetHeader className="p-6 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <div className="text-primary">{icon}</div>
            </div>
            <SheetTitle className="text-xl font-semibold text-foreground">
              Configure {name}
            </SheetTitle>
          </div>
          <SheetDescription className="text-sm text-muted-foreground">
            Set up the details for your {name.toLowerCase()} node.
          </SheetDescription>
        </SheetHeader>
        <div className="p-6 pt-2">
          {/* Placeholder for node configuration form */}
          <p className="text-muted-foreground">
            Configuration options for {name} will be here.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default function NodeSearch() {
  return (
    <Panel position="top-right">
      <Sheet>
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
          className="w-full sm:max-w-md border-l border-border/50 backdrop-blur-xl bg-card/95 p-0 flex flex-col"
        >
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Add a node
            </SheetTitle>
            <SheetDescription className="text-muted-foreground mt-2">
              Select a component to add to your workflow.
            </SheetDescription>
          </SheetHeader>

          {/* Search input with modern styling */}
          <div className="px-6 pb-4">
            <div className="relative group">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for a node..."
                  className="w-full pl-9 bg-muted/50 border-border/40 hover:border-primary/30 focus:border-primary/50 transition-colors duration-300"
                />
              </div>
            </div>
          </div>

          {/* Node list with smooth scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-primary/20">
            <div className="flex flex-col gap-3">
              {nodeTypes.map((node, index) => (
                <NodeListItem
                  key={index}
                  icon={node.icon}
                  name={node.name}
                  description={node.description}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Panel>
  );
}
