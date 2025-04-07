"use client";
import {
  Download,
  History,
  Lock,
  MessageSquare,
  Share,
  Unlock,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/app/_components/ui/button";
import { CollaboratorAvatars } from "@/app/(protected)/(enterprise)/_components/navbar/CollaboratorAvatars";
import { ThemeToggle } from "@/app/_components/ui/theme-toggle";
import { useState } from "react";
import { cn } from "@/app/_lib/utils";
import { ExportDialog } from "@/app/(protected)/(enterprise)/_components/dialog/ExportDialog";
import { ShareDialog } from "@/app/(protected)/(enterprise)/_components/dialog/ShareDialog";
import { Skeleton } from "@/app/_components/ui/skeleton";
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
  const [isLocked, setIsLocked] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { isLoaded } = useUser();

  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-2 px-3 shrink-0">
      <div className="mr-2">
        <CollaboratorAvatars collaborators={collaborators} maxVisible={2} />
      </div>

      <ThemeToggle />

      <Button
        variant={isLocked ? "destructive" : "ghost"}
        size="icon"
        className={cn("h-8 w-8 transition-all duration-300")}
        title={isLocked ? "Workflow is locked" : "Unlock workflow"}
        onClick={toggleLock}
      >
        {isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8" title="History">
        <History className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8" title="Comments">
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 px-3"
        onClick={() => setIsShareDialogOpen(true)}
      >
        <Share className="h-4 w-4 mr-1" />
        Share
      </Button>

      <Button
        variant="default"
        size="sm"
        className="h-8 px-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white inest-shadow-lg hover:inset-shadow-xl shadow-black/20 transition-all duration-200"
        onClick={() => setIsExportDialogOpen(true)}
      >
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>

      <div className="h-8 w-8 flex items-center justify-center">
        {isLoaded ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-8 w-8 hover:ring-primary/30 transition-colors duration-200",
              },
            }}
          />
        ) : (
          <Skeleton className="h-8 w-8 rounded-full bg-secondary" />
        )}
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </div>
  );
}
