"use client";

import * as React from "react";
import {
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Home,
  FileText,
  Users,
  Settings,
  Trash2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Avatar } from "./ui/avatar";
import { TeamDialog } from "./TeamDialog";
import { cn } from "@/app/_lib/utils";

type SidebarContextProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  sidebarWidth: string;
};

const SIDEBAR_WIDTH = "16rem";

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
}

type SidebarProviderProps = {
  children: React.ReactNode;
};

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const toggleSidebar = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggleSidebar,
      sidebarWidth: SIDEBAR_WIDTH,
    }),
    [isOpen, setIsOpen, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

type OrganizationProps = {
  name: string;
  icon: string;
};

function OrganizationSelector({ name, icon }: OrganizationProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className="flex items-center px-4 h-14 rounded-lg cursor-pointer relative overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      transition={{ duration: 0.2 }}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent opacity-0 transition-opacity duration-300"
        style={{ opacity: isHovered ? 0.6 : 0 }}
      />

      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Avatar className="h-8 w-8 mr-2 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md">
          {icon}
        </Avatar>
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
      </div>

      <motion.div
        whileHover={{ y: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/30 backdrop-blur-sm hover:bg-background/50"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Animated menu item component for consistent styling and behavior
function MenuItem({
  icon,
  label,
  active = false,
  collapsed = false,
  notification = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  notification?: boolean;
  onClick?: () => void;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all relative overflow-hidden",
              active
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
          >
            {/* Background decoration for active item */}
            {active && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/80 opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            )}

            <span className="text-lg">{icon}</span>
            <span className="flex-1 truncate">{label}</span>

            {/* Notification dot */}
            {notification && (
              <motion.div
                className="h-2 w-2 rounded-full bg-blue-500"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            )}
          </motion.button>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen, setIsOpen } = useSidebar();
  const [teamspacesOpen, setTeamspacesOpen] = React.useState(true);
  const [activeItem, setActiveItem] = React.useState("Projects");

  // Animation variants for the sidebar
  const sidebarVariants = {
    open: {
      width: SIDEBAR_WIDTH,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    closed: {
      width: "0",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0 },
  };

  return (
    <motion.aside
      className={cn(
        "flex-shrink-0 flex flex-col border-r border-border/50 bg-background/95 backdrop-blur-sm overflow-hidden",
        className
      )}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      initial="open"
      {...props}
    >
      {/* Header with organization selector and close button */}
      <motion.div
        className="flex items-center justify-between p-3 border-b border-border/30"
        variants={itemVariants}
      >
        <OrganizationSelector name="AlphaWolf Ventures, Inc." icon="A" />
        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      <ScrollArea className="flex-1 px-3 py-3">
        {/* Draft Workflows Section */}
        <motion.div className="py-2" variants={itemVariants}>
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            <span>DRAFT WORKFLOWS</span>
          </div>
          <div className="space-y-1">
            <MenuItem icon={<Home className="h-4 w-4" />} label="New page" />
            <MenuItem
              icon={<Plus className="h-4 w-4" />}
              label="Add new"
              notification
            />
          </div>
        </motion.div>

        {/* Teamspaces Section with animation */}
        <motion.div variants={itemVariants}>
          <Collapsible
            open={teamspacesOpen}
            onOpenChange={setTeamspacesOpen}
            className="py-2"
          >
            <div className="flex items-center justify-between px-2 mb-1">
              <CollapsibleTrigger asChild>
                <motion.button
                  className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
                  whileHover={{ x: 2 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  }}
                >
                  <motion.div
                    animate={{ rotate: teamspacesOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-3 w-3 mr-1" />
                  </motion.div>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    TEAMSPACES
                  </span>
                </motion.button>
              </CollapsibleTrigger>

              {/* Team dialog trigger with animations */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <TeamDialog />
              </motion.div>
            </div>

            <AnimatePresence>
              {teamspacesOpen && (
                <CollapsibleContent className="mt-1 space-y-1">
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-full justify-start text-left relative pl-9 text-sm py-2 px-3 rounded-md cursor-pointer flex items-center hover:bg-accent group"
                      whileHover={{ x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <motion.div
                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                        whileHover={{ scale: 1.1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        <Avatar className="h-5 w-5 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xs shadow-sm group-hover:shadow-md transition-shadow">
                          A
                        </Avatar>
                      </motion.div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        AlphaWolf Ventures, Inc.
                      </span>
                    </motion.div>

                    <motion.div
                      className="w-full justify-start text-left relative pl-9 text-sm py-2 px-3 rounded-md cursor-pointer flex items-center hover:bg-accent group"
                      whileHover={{ x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <motion.div
                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                        whileHover={{ scale: 1.1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        <Avatar className="h-5 w-5 bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white text-xs shadow-sm group-hover:shadow-md transition-shadow">
                          α
                        </Avatar>
                      </motion.div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        alphawolfventures
                      </span>
                    </motion.div>
                  </motion.div>
                </CollapsibleContent>
              )}
            </AnimatePresence>
          </Collapsible>
        </motion.div>

        {/* Projects Section */}
        <motion.div className="py-3" variants={itemVariants}>
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            <span>PROJECTS</span>
          </div>

          <MenuItem
            icon={
              <div className="relative">
                <Avatar className="h-5 w-5 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs">
                  P
                </Avatar>
                {activeItem === "Projects" && (
                  <motion.div
                    className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-500"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1.2 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )}
              </div>
            }
            label="Projects"
            active={activeItem === "Projects"}
            onClick={() => setActiveItem("Projects")}
          />

          <div className="space-y-1 mt-1 ml-7">
            {["Wiki", "Meetings", "Docs", "Tasks Tracker"].map((item) => (
              <MenuItem
                key={item}
                icon={<div className="w-5" />} // Empty space for alignment
                label={item}
                active={activeItem === item}
                onClick={() => setActiveItem(item)}
              />
            ))}
          </div>
        </motion.div>

        {/* Settings & other links */}
        <motion.div className="py-2 mt-2" variants={itemVariants}>
          <div className="space-y-1">
            <MenuItem
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              active={activeItem === "Settings"}
              onClick={() => setActiveItem("Settings")}
            />
            <MenuItem
              icon={<FileText className="h-4 w-4" />}
              label="Templates"
              active={activeItem === "Templates"}
              onClick={() => setActiveItem("Templates")}
            />
            <MenuItem
              icon={<Trash2 className="h-4 w-4" />}
              label="Trash"
              active={activeItem === "Trash"}
              onClick={() => setActiveItem("Trash")}
            />
          </div>
        </motion.div>
      </ScrollArea>

      {/* Invite members footer */}
      <motion.div
        className="p-3 border-t border-border/30"
        variants={itemVariants}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full justify-start text-left text-sm relative overflow-hidden group"
          >
            {/* Animated gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="mr-2"
            >
              <Plus className="h-4 w-4" />
            </motion.div>
            Invite members
          </Button>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
}
