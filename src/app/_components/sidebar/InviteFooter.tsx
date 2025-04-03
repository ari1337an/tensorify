"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/button";

export function InviteFooter() {
  return (
    <>
      <div className="p-3 border-t border-border/30">
        <div className="transition-transform duration-200">
          <Button
            variant="outline"
            className=" w-full justify-start text-left text-sm relative overflow-hidden group"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="mr-2 hover:rotate-180 transition-transform duration-300">
              <Plus className="h-4 w-4" />
            </div>
            Invite members
          </Button>
        </div>
      </div>
    </>
  );
}
