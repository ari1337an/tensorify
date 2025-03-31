"use client";
import { History, MessageSquare, Share } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

export function NavbarRight() {
  return (
    <div className="flex items-center gap-2 px-3">
      <Button variant="ghost" size="icon" className="h-8 w-8" title="History">
        <History className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8" title="Comments">
        <MessageSquare className="h-4 w-4" />
      </Button>

      <Button variant="secondary" size="sm" className="h-8 px-3">
        <Share className="h-4 w-4 mr-1" />
        Share
      </Button>

      <UserButton
        appearance={{
          elements: {
            avatarBox:
              "h-8 w-8 hover:ring-primary/30 transition-colors duration-200",
          },
        }}
      />
    </div>
  );
}
