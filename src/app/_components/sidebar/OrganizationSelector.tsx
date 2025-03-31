"use client";

import * as React from "react";
import { ChevronDown, X, Plus, User, LogOut, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSidebar } from "./SidebarContext";

type Organization = {
  id: string;
  name: string;
  icon: string;
};

type OrganizationProps = {
  name: string;
  icon: string;
  currentOrg?: Organization;
  organizations?: Organization[];
  onChangeOrganization?: (org: Organization) => void;
};

export function OrganizationSelector({
  name,
  icon,
  currentOrg,
  organizations = [],
  onChangeOrganization = () => {},
}: OrganizationProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const { setIsOpen: setSidebarOpen } = useSidebar();

  // Default organization if not provided
  const defaultOrg = { id: "default", name, icon };
  const orgList = organizations.length > 0 ? organizations : [defaultOrg];
  const activeOrg = currentOrg || defaultOrg;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className="flex items-center px-2 h-10 rounded-md cursor-pointer relative overflow-hidden hover:bg-white/5 transition-colors duration-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle background gradient */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent transition-opacity duration-300"
            style={{ opacity: isHovered ? 0.6 : 0 }}
          />

          <div className="hover:scale-105 transition-transform duration-200">
            <Avatar className="h-6 w-6 mr-2 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md text-xs">
              {activeOrg.icon}
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate max-w-[150px]">
              {activeOrg.name}
            </div>
          </div>

          <div className="hover:translate-y-0.5 transition-transform duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 bg-background/30 backdrop-blur-sm hover:bg-background/50"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[300px] bg-sidebar border-border/50 p-0"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
          <div className="flex items-center space-x-2">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Close sidebar
            </button>
            <span className="text-xs text-muted-foreground">⌘\</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false);
              setSidebarOpen(false);
            }}
            className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="p-2">
          <DropdownMenuLabel className="px-2 py-2">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md text-sm">
                {activeOrg.icon}
              </Avatar>
              <div>
                <div className="font-medium">{activeOrg.name}</div>
                <div className="text-xs text-muted-foreground">
                  Free Plan · 2 members
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <div className="px-2 pt-1 pb-2 flex gap-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Settings className="mr-1 h-3 w-3" /> Settings
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Plus className="mr-1 h-3 w-3" /> Invite members
            </Button>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {organizations.length > 0 ? "Your workspaces" : "Your accounts"}
            </DropdownMenuLabel>

            {orgList.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className="px-2 py-1.5"
                onSelect={() => onChangeOrganization(org)}
              >
                <div className="flex items-center w-full">
                  <Avatar className="h-6 w-6 mr-2 bg-background flex items-center justify-center text-foreground text-xs">
                    {org.icon}
                  </Avatar>
                  <span className="flex-1">{org.name}</span>
                  {org.id === activeOrg.id && (
                    <span className="text-primary">✓</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem className="px-2 py-1.5 mt-1">
              <div className="flex items-center w-full">
                <div className="h-6 w-6 mr-2 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">New workspace</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem className="px-2 py-1.5">
              <div className="flex items-center w-full">
                <div className="h-6 w-6 mr-2 flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">
                  Add another account
                </span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="px-2 py-1.5">
              <div className="flex items-center w-full">
                <div className="h-6 w-6 mr-2 flex items-center justify-center">
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">Log out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
