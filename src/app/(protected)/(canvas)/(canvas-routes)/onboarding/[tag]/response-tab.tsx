"use client";

import React, { useState, useEffect } from "react";
import { Users, FileText, FileDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Separator } from "@/app/_components/ui/separator";
import { ResponseDataTable } from "./response-data-table";
import { columns } from "./response-columns";
import { ApiOnboardingQuestion } from "./page";
import { OnboardingResponse } from "./response-columns";

interface ResponseTabProps {
  responses: OnboardingResponse[];
  questions: ApiOnboardingQuestion[];
  isLoading: boolean;
}

export function ResponseTab({
  responses,
  questions,
  isLoading,
}: ResponseTabProps) {
  // Use a ref to track if the component is mounted to prevent updates after unmounting
  const isMounted = React.useRef(true);

  // Memoize to prevent unnecessary re-renders
  const [filteredResponses, setFilteredResponses] = useState<
    OnboardingResponse[]
  >([]);
  const [responseDetailsOpen, setResponseDetailsOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] =
    useState<OnboardingResponse | null>(null);

  // When component unmounts, set the ref to false
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Use proper dependency tracking and prevent unnecessary updates
  useEffect(() => {
    // Use RequestAnimationFrame to ensure we're not blocking the main thread
    // This helps prevent React rendering issues when multiple state updates happen
    const updateResponses = () => {
      if (!isMounted.current) return;

      // Only update if responses exist and are different from current filtered responses
      if (responses && !isLoading) {
        setFilteredResponses(responses);
      }
    };

    // Delay the update slightly to avoid React concurrent mode issues
    const timeoutId = setTimeout(updateResponses, 50);
    return () => clearTimeout(timeoutId);
  }, [responses, isLoading]);

  // Memoize the callback to prevent re-renders
  const handleFilteredDataChange = React.useCallback((filteredData: any[]) => {
    if (!isMounted.current) return;

    // Use a small timeout to debounce updates and prevent excessive rerenders
    setTimeout(() => {
      if (isMounted.current) {
        setFilteredResponses(filteredData as OnboardingResponse[]);
      }
    }, 50);
  }, []);

  // Memoize view details callback
  const viewResponseDetails = React.useCallback(
    (response: OnboardingResponse) => {
      if (!isMounted.current) return;
      setSelectedResponse(response);
      setResponseDetailsOpen(true);
    },
    []
  );

  // Function to convert responses to CSV
  const exportToCSV = () => {
    // Ensure we have responses to export
    if (!filteredResponses.length) return;

    // Get all question IDs from all responses to ensure we include all
    const allQuestionIds = new Set<string>();
    filteredResponses.forEach((response) => {
      response.answers.forEach((answer) => {
        allQuestionIds.add(answer.questionId);
      });
    });

    // Create headers
    let headers = [
      "Fingerprint",
      "Email",
      "Intent",
      "Organization Size",
      "Submission Date",
      "Test Data",
    ];

    // Add question headers
    const questionMap = new Map<string, string>();
    questions.forEach((q) => {
      questionMap.set(q.id, q.title);
    });

    // Add all questions as columns
    allQuestionIds.forEach((id) => {
      headers.push(questionMap.get(id) || `Question (${id})`);
    });

    // Create rows
    const rows = filteredResponses.map((response) => {
      const row: Record<string, string> = {
        Fingerprint: response.clientFingerprint || "—",
        Email: response.email || "—",
        Intent: response.intentTag || "—",
        "Organization Size": response.orgSizeBracket || "—",
        "Submission Date": new Date(response.createdAt).toLocaleString(),
        "Test Data": response.isDummy ? "Yes" : "No",
      };

      // Add answer data
      allQuestionIds.forEach((qId) => {
        const answer = response.answers.find((a) => a.questionId === qId);
        if (answer) {
          row[questionMap.get(qId) || `Question (${qId})`] =
            answer.selectedOptions.map((opt) => opt.optionLabel).join(", ");
        } else {
          row[questionMap.get(qId) || `Question (${qId})`] = "—";
        }
      });

      return row;
    });

    // Convert to CSV
    let csv = headers.map((header) => `"${header}"`).join(",") + "\n";

    rows.forEach((row) => {
      const values = headers.map((header) => {
        // Escape quotes in the value
        const value = row[header] ? row[header].replace(/"/g, '""') : "";
        return `"${value}"`;
      });
      csv += values.join(",") + "\n";
    });

    // Create and download the file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `onboarding-responses-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Responses
            </CardTitle>
            <CardDescription>
              View and filter individual user responses to this onboarding.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={filteredResponses.length === 0 || isLoading}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No responses have been collected yet.
            </div>
          ) : (
            <ResponseDataTable
              columns={columns}
              data={responses}
              questions={questions}
              onViewDetails={viewResponseDetails}
              onFilteredDataChange={handleFilteredDataChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Response Details Dialog */}
      <Dialog open={responseDetailsOpen} onOpenChange={setResponseDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
            <DialogDescription>
              {selectedResponse?.createdAt && (
                <span className="text-sm">
                  Submitted on{" "}
                  {new Date(selectedResponse.createdAt).toLocaleString()}
                </span>
              )}
              {selectedResponse?.isDummy && (
                <span className="text-xs ml-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2 py-0.5 rounded">
                  Test Data
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedResponse && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Fingerprint
                  </h3>
                  <p className="mt-1">
                    {selectedResponse.clientFingerprint || "—"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h3>
                  <p className="mt-1">{selectedResponse.email || "—"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Intent
                  </h3>
                  <p className="mt-1">
                    {selectedResponse.intentTag || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Organization Size
                  </h3>
                  <p className="mt-1">
                    {selectedResponse.orgSizeBracket || "Not specified"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-3">Answers</h3>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-6">
                    {selectedResponse.answers.map((answer) => (
                      <div key={answer.questionId} className="space-y-2">
                        <h4 className="font-medium">{answer.questionTitle}</h4>
                        <ul className="pl-6 list-disc space-y-1">
                          {answer.selectedOptions.map((option) => (
                            <li key={option.optionId}>{option.optionLabel}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {selectedResponse.answers.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No answers provided
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setResponseDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
