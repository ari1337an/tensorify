"use client";

import { Plugin } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { cn } from "@/app/_lib/utils";

interface VersionSwitcherProps {
  currentVersion: string;
  versions: Plugin[];
  isOwner: boolean;
}

export function VersionSwitcher({
  currentVersion,
  versions,
  isOwner,
}: VersionSwitcherProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Filter out unpublished versions for non-owners
  const availableVersions = versions.filter(
    (version) => isOwner || version.processingStatus === "published"
  );

  const sortedVersions = [...availableVersions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const handleVersionChange = async (version: string) => {
    setIsLoading(true);
    const selectedPlugin = versions.find((p) => p.version === version);
    if (selectedPlugin) {
      router.replace(`/plugins/${selectedPlugin.slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <Skeleton className="h-7 w-[120px] rounded-md" />
          <Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    );
  }

  return (
    <Select value={currentVersion} onValueChange={handleVersionChange}>
      <SelectTrigger
        className={cn(
          "h-7 w-[120px] text-sm bg-secondary/50",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        disabled={isLoading}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortedVersions.map((version) => (
          <SelectItem
            key={version.id}
            value={version.version}
            className="text-sm"
          >
            v{version.version}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
