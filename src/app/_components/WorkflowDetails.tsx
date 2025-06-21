"use client";

import useStore from "@/app/_store/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { Skeleton } from "@/app/_components/ui/skeleton";

export function WorkflowDetails() {
  const currentWorkflow = useStore((state) => state.currentWorkflow);

  if (!currentWorkflow) {
    return (
      <div className="w-full h-full p-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-7 w-48 mb-3" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{currentWorkflow.name}</CardTitle>
              <CardDescription className="mt-2">
                {currentWorkflow.description}
              </CardDescription>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">
                Workflow ID:
              </span>
              <p className="mt-1 font-mono text-xs">{currentWorkflow.id}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Project:
              </span>
              <p className="mt-1">{currentWorkflow.projectName}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Team:</span>
              <p className="mt-1">{currentWorkflow.teamName}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Created:
              </span>
              <p className="mt-1">
                {new Date(currentWorkflow.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Members:
              </span>
              <p className="mt-1">{currentWorkflow.memberCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
