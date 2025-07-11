"use client";

import { useQuery } from "@tanstack/react-query";
import { getTensorifyVersions } from "@/server/actions/tensorify-actions";

export function useTensorifyVersions() {
  return useQuery({
    queryKey: ["tensorify-versions"],
    queryFn: getTensorifyVersions,
    select: (data) => {
      // Sort versions in descending order (latest first)
      const sortedVersions = [...data].sort((a, b) => {
        return b.version.localeCompare(a.version, undefined, { numeric: true });
      });
      
      return {
        versions: sortedVersions,
        latestVersion: sortedVersions[0]?.version || "",
      };
    },
  });
}
