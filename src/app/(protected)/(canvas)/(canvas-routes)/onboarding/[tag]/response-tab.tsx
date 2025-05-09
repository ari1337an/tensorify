"use client";

import React, { useState, useEffect } from "react";
import { Users, FileDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Button } from "@/app/_components/ui/button";
import { ResponseDataTable } from "./response-data-table";
import { columns, OnboardingResponse } from "./response-columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Badge } from "@/app/_components/ui/badge";

// Define ApiOnboardingQuestion directly here since there's an import issue
interface ApiOnboardingQuestion {
  id: string;
  slug: string;
  title: string;
  type: string;
  iconSlug: string | null;
  sortOrder: number;
  allowOtherOption: boolean;
  options: Array<{
    id: string;
    value: string;
    label: string;
    iconSlug: string | null;
    sortOrder: number;
  }>;
}

interface ResponseTabProps {
  responses: OnboardingResponse[];
  questions: ApiOnboardingQuestion[];
  isLoading: boolean;
  error?: Error | null;
}

export function ResponseTab({
  responses,
  questions,
  isLoading,
  error,
}: ResponseTabProps) {
  // Use a ref to track if the component is mounted to prevent updates after unmounting
  const isMounted = React.useRef(true);

  // Memoize to prevent unnecessary re-renders
  const [filteredResponses, setFilteredResponses] = useState<
    OnboardingResponse[]
  >([]);

  // State for response details dialog
  const [selectedResponse, setSelectedResponse] =
    useState<OnboardingResponse | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // When component unmounts, set the ref to false
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Add event listener for view-response-details
  React.useEffect(() => {
    const handleViewResponseDetails = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.response) {
        setSelectedResponse(customEvent.detail.response);
        setShowDetailsDialog(true);
      }
    };

    document.addEventListener(
      "view-response-details",
      handleViewResponseDetails
    );

    return () => {
      document.removeEventListener(
        "view-response-details",
        handleViewResponseDetails
      );
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
  const handleFilteredDataChange = React.useCallback(
    (filteredData: OnboardingResponse[]) => {
      if (!isMounted.current) return;

      // Use a small timeout to debounce updates and prevent excessive rerenders
      setTimeout(() => {
        if (isMounted.current) {
          setFilteredResponses(filteredData);
        }
      }, 50);
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
    const headers = [
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
          let answerText = "";

          // Add selected options if they exist
          if (answer.selectedOptions.length > 0) {
            answerText += answer.selectedOptions
              .map((opt) => opt.optionLabel)
              .join(", ");
          }

          // Add custom value if it exists
          if (answer.customValue) {
            // If there were also selected options, add a separator
            if (answer.selectedOptions.length > 0) {
              answerText += "; ";
            }
            answerText += `Other: "${answer.customValue}"`;
          }

          row[questionMap.get(qId) || `Question (${qId})`] = answerText || "—";
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
          ) : error ? (
            <div className="text-center text-red-500 py-12 space-y-2">
              <p>Error fetching responses: {error.message}</p>
              <p className="text-sm text-muted-foreground">
                Check the console for more details or try refreshing the page.
              </p>
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
              onFilteredDataChange={handleFilteredDataChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Response Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
            <DialogDescription>
              Detailed information for this response
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            {selectedResponse && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">User Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p>{selectedResponse.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        User ID
                      </p>
                      <p>{selectedResponse.userId || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Client Fingerprint
                      </p>
                      <p>{selectedResponse.clientFingerprint || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Submission Date
                      </p>
                      <p>
                        {new Date(selectedResponse.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Intent
                      </p>
                      <p>{selectedResponse.intentTag || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Organization Size
                      </p>
                      <p>{selectedResponse.orgSizeBracket || "—"}</p>
                    </div>
                    {selectedResponse.isDummy && (
                      <div className="col-span-2">
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-800"
                        >
                          Test Data
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Response Answers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Answers</h3>
                  {selectedResponse.answers.length === 0 ? (
                    <p className="text-muted-foreground">No answers provided</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedResponse.answers.map((answer) => (
                        <div
                          key={answer.questionId}
                          className="border rounded-md p-4"
                        >
                          <h4 className="font-medium mb-2">
                            {answer.questionTitle}
                          </h4>

                          {/* Display selected options with "Other" value clearly marked */}
                          {answer.selectedOptions.length > 0 ? (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Selected Options:
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                {answer.selectedOptions.map((option) => (
                                  <li key={option.optionId}>
                                    {option.optionLabel}
                                  </li>
                                ))}

                                {/* Always show the "Other" value if it exists, regardless of selection state */}
                                {answer.customValue && (
                                  <li className="text-primary font-medium">
                                    Other: <span>{answer.customValue}</span>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ) : answer.customValue ? (
                            // Handle case where ONLY a custom value was provided (no selected options)
                            <div className="mb-2">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Custom Value:
                              </p>
                              <p className="text-primary font-medium ml-6">
                                {answer.customValue}
                              </p>
                            </div>
                          ) : (
                            // No options or custom value selected
                            <p className="text-muted-foreground italic">
                              No selection made
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Raw Response Data */}
                <div className="space-y-2">
                  <details className="text-sm">
                    <summary className="font-medium cursor-pointer">
                      View Raw Response Data
                    </summary>
                    <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto text-xs">
                      {JSON.stringify(selectedResponse, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                if (selectedResponse) {
                  const dataStr = JSON.stringify(selectedResponse, null, 2);
                  const dataUri =
                    "data:application/json;charset=utf-8," +
                    encodeURIComponent(dataStr);
                  const exportFileDefaultName = `response-${
                    selectedResponse.id
                  }-${new Date().toISOString().slice(0, 10)}.json`;

                  const linkElement = document.createElement("a");
                  linkElement.setAttribute("href", dataUri);
                  linkElement.setAttribute("download", exportFileDefaultName);
                  linkElement.click();
                }
              }}
              variant="outline"
            >
              Export JSON
            </Button>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
