"use client";
import { Download, History, MessageSquare, Share } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { CollaboratorAvatars } from "../CollaboratorAvatars";

// Example collaborators data - in a real app, this would come from your collaboration system
const collaborators = [
  {
    id: "1",
    name: "User 1",
    avatarUrl: "https://github.com/shadcn.png",
    status: "editing" as const,
    colorIndex: 0,
  },
  {
    id: "2",
    name: "User 2",
    avatarUrl: "https://github.com/shadcn.png",
    status: "editing" as const,
    colorIndex: 1,
  },
  {
    id: "3",
    name: "User 3",
    avatarUrl: "https://github.com/shadcn.png",
    status: "idle" as const,
    colorIndex: 2,
  },
  {
    id: "4",
    name: "User 4",
    avatarUrl: "https://github.com/shadcn.png",
    status: "editing" as const,
    colorIndex: 3,
  },
];

export function NavbarRight() {
  return (
    <div className="flex items-center gap-2 px-3 shrink-0">
      <div className="mr-2">
        <CollaboratorAvatars collaborators={collaborators} maxVisible={2} />
      </div>

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

      <Button
        variant="default"
        size="sm"
        className="h-8 px-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Download className="h-4 w-4 mr-1" />
        Export
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
