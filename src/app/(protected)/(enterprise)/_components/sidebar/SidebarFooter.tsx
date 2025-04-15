"use client";

import { AppWindowMac, Plane } from "lucide-react";
import { Button } from "@/app/_components/ui/button";

export function SidebarFooter() {
  return (
    <>
      <div className="p-3 border-t border-border/30 space-y-2">
        <div className="transition-transform duration-200">
          <Button
            variant="outline"
            className="w-full justify-start text-left text-sm relative overflow-hidden group"
            onClick={() => {
              window.open("https://app.tensorify.io", "_blank");
            }}
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 transition-opacity duration-300" />
            <div className="mr-2 hover:rotate-180 transition-transform duration-300">
              <AppWindowMac className="h-4 w-4" />
            </div>
            app.tensorify.io
          </Button>
        </div>
        <div className="transition-transform duration-200">
          <Button
            variant="outline"
            className="w-full justify-start text-left text-sm relative overflow-hidden group"
            onClick={() => {
              window.open("https://tensorify.io", "_blank");
            }}
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 transition-opacity duration-300" />
            <div className="mr-2 hover:rotate-180 transition-transform duration-300">
              <Plane className="h-4 w-4" />
            </div>
            tensorify.io
          </Button>
        </div>
      </div>
    </>
  );
}
