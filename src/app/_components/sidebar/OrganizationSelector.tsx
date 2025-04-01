"use client";

import * as React from "react";
import {
  ChevronDown,
  Plus,
  User,
  LogOut,
  Settings,
  Globe,
  MoreHorizontal,
} from "lucide-react";
import { Avatar } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  isGuest?: boolean;
};

type OrganizationProps = {
  email?: string;
  currentOrg?: Organization;
  organizations?: Organization[];
  onChangeOrganization?: (org: Organization) => void;
};

export function OrganizationSelector({
  email = "loading...",
  currentOrg,
  organizations = [],
  onChangeOrganization = () => {},
}: OrganizationProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setIsOpen: setSidebarOpen } = useSidebar();

  // If no organizations provided, create some example ones
  const defaultOrgs =
    organizations.length > 0
      ? organizations
      : [
          { id: "user-notion", name: "Md Sahadul Hasan's", icon: "M" },
          { id: "university", name: "University", icon: "U", isGuest: true },
          { id: "alphawolf", name: "AlphaWolf Ventures, Inc.", icon: "A" },
        ];

  const activeOrg = currentOrg || defaultOrgs[2]; // Default to AlphaWolf

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-zinc-800/50 rounded-md cursor-pointer">
          <div className="flex items-center min-w-0">
            <Avatar className="h-6 w-6 mr-2 bg-zinc-800 flex items-center justify-center text-white text-xs">
              {activeOrg.icon}
            </Avatar>
            <span className="text-sm font-medium truncate">
              {activeOrg.name}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[300px] bg-[#1a1a1a] border-zinc-800 shadow-xl rounded-lg py-1"
      >
        <DropdownMenuLabel className="px-3 py-1.5">
          <div className="flex items-center justify-between">
            <Avatar className="h-8 w-8 mr-2 bg-zinc-800 flex items-center justify-center text-white text-sm">
              {activeOrg.icon}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{activeOrg.name}</div>
              <div className="text-xs text-zinc-400">Free Plan · 2 members</div>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="flex gap-2 px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-300 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Settings</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-300 cursor-pointer">
            <User className="h-4 w-4" />
            <span className="text-sm">Invite members</span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-zinc-800" />

        <div className="px-3 py-1.5 flex items-center justify-between text-zinc-400">
          <span className="text-sm">{email}</span>
          <MoreHorizontal className="h-4 w-4" />
        </div>

        {defaultOrgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            className="px-3 py-1.5 hover:bg-zinc-800"
            onSelect={() => onChangeOrganization(org)}
          >
            <div className="flex items-center w-full">
              <Avatar className="h-6 w-6 mr-2 bg-zinc-800 flex items-center justify-center text-white text-xs">
                {org.icon}
              </Avatar>
              <span className="flex-1 text-sm">{org.name}</span>
              {org.isGuest && (
                <span className="flex items-center text-amber-500/90 text-xs font-medium">
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  Guest
                </span>
              )}
              {org.id === activeOrg.id && (
                <span className="text-zinc-400 ml-2">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuItem className="px-3 py-1.5 hover:bg-zinc-800 hover:cursor-pointer">
          <div className="flex items-center text-zinc-400">
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm">New Organization</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-zinc-800" />

        <DropdownMenuItem className="px-3 py-1.5 hover:bg-zinc-800 hover:cursor-pointer">
          <div className="flex items-center text-zinc-400">
            <LogOut className="h-4 w-4 mr-2" />
            <span className="text-sm">Log out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
