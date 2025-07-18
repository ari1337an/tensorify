"use client";

import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { CreateOnboardingVersionDialog } from "./create-onboarding-version-dialog";
import { getOnboardingTagVersions } from "@/server/actions/onboarding";
import { OnboardingTagVersion } from "./columns";

// Define the API response type
interface ApiOnboardingTagVersion {
  id: string;
  tag: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  _count: {
    questions: number;
    responses: number;
  };
}

interface ApiResponse {
  versions?: ApiOnboardingTagVersion[];
  error?: string;
}

export default function OnboardingPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["onboardingTagVersions"],
    queryFn: async () => {
      const response = (await getOnboardingTagVersions()) as ApiResponse;
      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.versions) {
        return [];
      }

      // Transform the data to match the OnboardingTagVersion type
      const transformedVersions: OnboardingTagVersion[] = response.versions.map(
        (version) => ({
          id: version.id,
          tag: version.tag,
          title: version.title,
          description: version.description || "",
          status: version.status,
          createdAt: version.createdAt,
          publishedAt: version.publishedAt,
          questionCount: version._count.questions,
          responseCount: version._count.responses,
        })
      );

      return transformedVersions;
    },
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Onboarding Versions</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error
              ? error.message
              : "Failed to load onboarding versions"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Onboarding Versions</h1>
        <CreateOnboardingVersionDialog />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </div>
  );
}
