"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { Plus, Trash, GripVertical, Beaker, FileText } from "lucide-react";
import Link from "next/link";
import {
  deleteOnboardingQuestion,
  updateQuestionOrder,
  publishOnboardingTagVersion,
  submitOnboardingResponseByTag,
} from "@/server/actions/onboarding";
import { AddQuestionDialog } from "./add-question-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Input } from "@/app/_components/ui/input";
import { ResponseTab } from "./response-tab";
import { AnalyticsTab } from "./analytics-tab";

// Define the API response types
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

interface ApiOnboardingTagVersion {
  id: string;
  tag: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  questions: ApiOnboardingQuestion[];
  _count: {
    responses: number;
  };
}

// Sortable Question Card component
function SortableQuestionCard({
  question,
  isDraft,
  onDelete,
}: {
  question: ApiOnboardingQuestion;
  isDraft: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? "relative" : "static",
  } as React.CSSProperties;

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isDraft && (
              <button
                className="cursor-grab touch-none"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <span>{question.title}</span>
          </div>
          {isDraft && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this question? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(question.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardTitle>
        <CardDescription>
          Type:{" "}
          {question.type === "single_choice"
            ? "Single Choice"
            : "Multiple Choice"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="font-semibold">Options:</div>
          <ul className="list-disc list-inside space-y-1">
            {question.options.map((option) => (
              <li key={option.id}>{option.label}</li>
            ))}
            {question.allowOtherOption && <li>Other?</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OnboardingVersionPage() {
  const { tag } = useParams() as { tag: string };
  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState<ApiOnboardingQuestion[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [testUserName, setTestUserName] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testClientFingerprint, setTestClientFingerprint] = useState("");
  const [testIntentTag, setTestIntentTag] = useState("");
  const [testOrgSizeBracket, setTestOrgSizeBracket] = useState("");
  const [testAnswers, setTestAnswers] = useState<
    Record<string, { selectedOptions: string[]; customValue: string }>
  >({});

  const { data, error, isLoading, refetch } = useQuery<ApiOnboardingTagVersion>(
    {
      queryKey: ["onboardingVersion", tag],
      queryFn: async () => {
        // Use the new simplified API route
        const versionResponse = await fetch(
          `/api/onboarding?tag=${encodeURIComponent(tag)}`
        );
        const versionData = await versionResponse.json();

        if (versionData.error) {
          throw new Error(versionData.error);
        }

        if (!versionData.version) {
          throw new Error("Onboarding version not found");
        }

        return versionData.version;
      },
    }
  );

  // Update local questions state when data changes
  React.useEffect(() => {
    if (data?.questions) {
      setQuestions(data.questions);
    }
  }, [data]);

  // Add response data fetching - fix to prevent infinite loops
  const {
    data: responsesData,
    isLoading: responsesLoading,
    error: responsesError,
  } = useQuery({
    queryKey: ["onboardingResponses", data?.id, tag],
    queryFn: async () => {
      if (!data?.id) return [];

      try {
        console.log(`Fetching responses for tag ${tag}...`);
        const response = await fetch(`/api/onboarding/by-tag/${tag}/responses`);

        if (!response.ok) {
          // Improved error handling - safely extract error details
          let errorMessage = `Failed to fetch responses: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
            if (errorData && errorData.details) {
              errorMessage += ` - ${errorData.details}`;
            }
          } catch (jsonError) {
            // If JSON parsing fails, use the status text
            console.error("Error parsing JSON response:", jsonError);
          }

          console.error("Error fetching responses:", errorMessage);
          throw new Error(errorMessage);
        }

        // Parse JSON response safely
        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse response JSON:", jsonError);
          throw new Error("Invalid response format from server");
        }

        if (!result || !Array.isArray(result.responses)) {
          console.error("Unexpected response format:", result);
          throw new Error("Unexpected response format from server");
        }

        console.log(`Received ${result.responses?.length || 0} responses`);
        return result.responses || [];
      } catch (error) {
        console.error("Fetch error:", error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    enabled: !!data?.id && !!tag,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Get local storage test responses and combine with API responses
  const combinedResponses = React.useMemo(() => {
    const apiResponses = responsesData || [];
    console.log(`Processing ${apiResponses.length} API responses`);

    // Get test responses from localStorage if available
    let testResponses = [];
    if (typeof window !== "undefined") {
      try {
        const storedResponses = localStorage.getItem("testResponses");
        if (storedResponses) {
          testResponses = JSON.parse(storedResponses);
          console.log(`Found ${testResponses.length} test responses`);
        }
      } catch (error) {
        console.error("Error loading test responses:", error);
      }
    }

    // Combine both sources
    return [...apiResponses, ...testResponses];
  }, [responsesData]);

  // Use filtered responses for test data tab
  const testDataResponses = React.useMemo(() => {
    return combinedResponses;
  }, [combinedResponses]);

  const isDraft = data?.status === "DRAFT";
  const isPublished = data?.status === "PUBLISHED";
  const isArchived = data?.status === "ARCHIVED";

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setIsReordering(true);

    try {
      // Reorder questions locally
      setQuestions((prevQuestions) => {
        const oldIndex = prevQuestions.findIndex((q) => q.id === active.id);
        const newIndex = prevQuestions.findIndex((q) => q.id === over.id);

        return arrayMove(prevQuestions, oldIndex, newIndex);
      });

      // Update the backend with new order
      if (data?.id) {
        const reorderedQuestions = questions.map((q, index) => ({
          id: q.id,
          sortOrder: index,
        }));

        const result = await updateQuestionOrder({
          versionId: data.id,
          questionOrders: reorderedQuestions,
        });

        if (result.error) {
          toast.error(result.error);
          await refetch();
          return;
        }

        toast.success("Question order updated");
      }
    } catch (error) {
      toast.error("Failed to update question order");
      console.error(error);
      await refetch();
    } finally {
      setIsReordering(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const result = await deleteOnboardingQuestion(questionId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Question deleted successfully");
      refetch(); // Refresh the data
    } catch (error) {
      toast.error("Failed to delete question");
      console.error(error);
    }
  };

  // Initialize sort order for existing questions if needed
  const initializeSortOrderIfNeeded = React.useCallback(async () => {
    if (!data?.id || !isDraft || !questions.length) return;

    // Check if sort order needs to be initialized (all questions have sort order 0)
    const needsInitialization = questions.every((q) => q.sortOrder === 0);

    if (needsInitialization) {
      try {
        // Create an array of questions with incremental sort orders
        const orderedQuestions = questions.map((q, index) => ({
          id: q.id,
          sortOrder: index,
        }));

        const result = await updateQuestionOrder({
          versionId: data.id,
          questionOrders: orderedQuestions,
        });

        if (result.error) {
          console.error("Failed to initialize question order:", result.error);
        } else {
          console.log("Question order initialized successfully");
          refetch();
        }
      } catch (error) {
        console.error("Error initializing question order:", error);
      }
    }
  }, [data?.id, isDraft, questions, refetch]);

  // Call the initialization function when questions are loaded
  React.useEffect(() => {
    if (data?.questions && isDraft) {
      initializeSortOrderIfNeeded();
    }
  }, [data?.questions, isDraft, initializeSortOrderIfNeeded]);

  const handlePublish = async () => {
    if (!data?.id) return;

    try {
      setIsPublishing(true);
      const result = await publishOnboardingTagVersion(data.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Onboarding version published successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to publish onboarding version");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/onboarding"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to Onboarding Versions
          </Link>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error
              ? error.message
              : "Failed to load onboarding version"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-65px)] overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/onboarding"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to Onboarding Versions
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{data?.title}</h1>
                  {data?.status && (
                    <Badge
                      variant="outline"
                      className={
                        isPublished
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          : isArchived
                          ? "bg-gray-100 dark:bg-gray-800/20 text-gray-800 dark:text-gray-400"
                          : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                      }
                    >
                      {isPublished
                        ? "Published"
                        : isArchived
                        ? "Archived"
                        : "Draft"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  Tag: {data?.tag}
                </p>
                {data?.description && (
                  <p className="text-muted-foreground mt-2">
                    {data.description}
                  </p>
                )}
              </div>
              <div className="flex flex-row gap-2">
                {isDraft && (
                  <>
                    <AddQuestionDialog
                      versionId={data?.id}
                      onQuestionAdded={() => refetch()}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isPublishing ? "Publishing..." : "Publish Now"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Publish Onboarding Version
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to publish this onboarding
                            version? Once published, you won&apos;t be able to
                            modify questions or their order.
                            {questions.length === 0 && (
                              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-md">
                                You cannot publish a version with no questions.
                                Please add at least one question first.
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handlePublish}
                            disabled={isPublishing || questions.length === 0}
                            className={
                              questions.length === 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          >
                            Publish
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="responses">
                  Responses
                  {data?._count?.responses
                    ? ` (${data?._count?.responses})`
                    : ""}
                </TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="manually-add-data">
                  Manually Add Data
                </TabsTrigger>
                <TabsTrigger value="api-examples">API Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4">
                {questions.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Questions Yet</CardTitle>
                      <CardDescription>
                        Start by adding questions to this onboarding version.
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      {isDraft && (
                        <AddQuestionDialog
                          versionId={data?.id}
                          onQuestionAdded={() => refetch()}
                        >
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Question
                          </Button>
                        </AddQuestionDialog>
                      )}
                    </CardFooter>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {isDraft && (
                      <div className="bg-muted/50 p-3 rounded-md text-sm mb-4">
                        <p className="flex items-center">
                          <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
                          {isReordering ? (
                            <span className="text-muted-foreground">
                              Saving order changes...
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Drag questions to reorder them
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={questions.map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                        disabled={!isDraft || isReordering}
                      >
                        <div className="grid grid-cols-1 gap-4">
                          {questions.map((question) => (
                            <SortableQuestionCard
                              key={question.id}
                              question={question}
                              isDraft={isDraft}
                              onDelete={handleDeleteQuestion}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="responses" className="space-y-4">
                <ResponseTab
                  responses={testDataResponses}
                  questions={questions}
                  isLoading={responsesLoading}
                  error={responsesError}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsTab
                  responses={testDataResponses}
                  questions={questions}
                  isLoading={responsesLoading}
                />
              </TabsContent>

              <TabsContent value="manually-add-data">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Beaker className="mr-2 h-5 w-5" />
                      Manually Add Data
                    </CardTitle>
                    <CardDescription>
                      Add test data for this onboarding version.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Test Data Form */}
                      <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="font-medium text-lg">
                          Add Manual Test Data
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Test User Name
                            </label>
                            <Input
                              placeholder="Test User"
                              value={testUserName}
                              onChange={(e) => setTestUserName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Test Email
                            </label>
                            <Input
                              placeholder="test@example.com"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Client Fingerprint
                            </label>
                            <Input
                              placeholder="test-fingerprint-123"
                              value={testClientFingerprint}
                              onChange={(e) =>
                                setTestClientFingerprint(e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Intent Tag
                            </label>
                            <select
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={testIntentTag}
                              onChange={(e) => setTestIntentTag(e.target.value)}
                            >
                              <option value="">Select Intent...</option>
                              <option value="WILL_PAY_TEAM">
                                Will Pay (Team)
                              </option>
                              <option value="WILL_PAY_HOBBY">
                                Will Pay (Hobby)
                              </option>
                              <option value="WILL_NOT_PAY">Will Not Pay</option>
                              <option value="ENTERPRISE_POTENTIAL">
                                Enterprise Potential
                              </option>
                              <option value="CURIOUS">Curious</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Organization Size
                            </label>
                            <select
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={testOrgSizeBracket}
                              onChange={(e) =>
                                setTestOrgSizeBracket(e.target.value)
                              }
                            >
                              <option value="">Select Org Size...</option>
                              <option value="LT_20">&lt;20</option>
                              <option value="FROM_20_TO_99">20-99</option>
                              <option value="FROM_100_TO_499">100-499</option>
                              <option value="FROM_500_TO_999">500-999</option>
                              <option value="GTE_1000">1000+</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Test Answers</h4>
                          <div className="space-y-4">
                            {questions.map((question) => (
                              <div
                                key={question.id}
                                className="space-y-2 p-3 border rounded-md"
                              >
                                <p className="font-medium">{question.title}</p>
                                <div className="grid grid-cols-1 gap-2">
                                  {question.options.map((option) => (
                                    <div
                                      key={option.id}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type={
                                          question.type === "single_choice"
                                            ? "radio"
                                            : "checkbox"
                                        }
                                        id={option.id}
                                        name={question.id}
                                        checked={(
                                          testAnswers[question.id]
                                            ?.selectedOptions || []
                                        ).includes(option.id)}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          setTestAnswers((prev) => {
                                            const currentAnswers =
                                              prev[question.id]
                                                ?.selectedOptions || [];
                                            if (
                                              question.type === "single_choice"
                                            ) {
                                              return {
                                                ...prev,
                                                [question.id]: {
                                                  selectedOptions: [option.id],
                                                  customValue:
                                                    prev[question.id]
                                                      ?.customValue || "",
                                                },
                                              };
                                            }
                                            // For multiple choice
                                            if (isChecked) {
                                              return {
                                                ...prev,
                                                [question.id]: {
                                                  selectedOptions: [
                                                    ...currentAnswers,
                                                    option.id,
                                                  ],
                                                  customValue:
                                                    prev[question.id]
                                                      ?.customValue || "",
                                                },
                                              };
                                            }
                                            return {
                                              ...prev,
                                              [question.id]: {
                                                selectedOptions:
                                                  currentAnswers.filter(
                                                    (id) => id !== option.id
                                                  ),
                                                customValue:
                                                  prev[question.id]
                                                    ?.customValue || "",
                                              },
                                            };
                                          });
                                        }}
                                      />
                                      <label
                                        htmlFor={option.id}
                                        className="text-sm"
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                {question.allowOtherOption && (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Other"
                                      value={
                                        testAnswers[question.id]?.customValue ||
                                        ""
                                      }
                                      onChange={(e) => {
                                        const customValue = e.target.value;
                                        setTestAnswers((prev) => ({
                                          ...prev,
                                          [question.id]: {
                                            ...prev[question.id],
                                            customValue,
                                          },
                                        }));
                                      }}
                                      className="border rounded-md p-1 w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4"
                          onClick={() => {
                            if (!testUserName || !testEmail) {
                              toast.error(
                                "Please provide both user name and email"
                              );
                              return;
                            }

                            const hasAnswers = Object.values(testAnswers).some(
                              (answers) => answers.selectedOptions.length > 0
                            );
                            if (!hasAnswers) {
                              toast.error("Please select at least one answer");
                              return;
                            }

                            // Convert the test answers to API format
                            const apiSubmission = {
                              tag: data?.tag || "",
                              userId: testUserName,
                              email: testEmail,
                              clientFingerprint:
                                testClientFingerprint ||
                                `test-${Math.random()
                                  .toString(36)
                                  .substring(7)}`,
                              intentTag: testIntentTag || "WILL_PAY_TEAM",
                              orgSizeBracket: testOrgSizeBracket || "LT_20",
                              answers: Object.entries(testAnswers)
                                .filter(
                                  ([, answers]) =>
                                    answers.selectedOptions.length > 0
                                )
                                .map(([questionId, answers]) => {
                                  const result = {
                                    questionId,
                                    selectedOptionIds: answers.selectedOptions,
                                  };

                                  // Only add customValue if it exists and is not empty
                                  if (
                                    answers.customValue &&
                                    answers.customValue.trim()
                                  ) {
                                    return {
                                      ...result,
                                      customValue: answers.customValue.trim(),
                                    };
                                  }

                                  return result;
                                }),
                            };

                            // Submit to API using tag
                            const submitResponse = async () => {
                              try {
                                const result =
                                  await submitOnboardingResponseByTag(
                                    apiSubmission
                                  );

                                if (result.error) {
                                  toast.error(result.error);
                                  return;
                                }

                                toast.success(
                                  "Response submitted to API successfully!"
                                );

                                // Reset form
                                setTestUserName("");
                                setTestEmail("");
                                setTestClientFingerprint("");
                                setTestIntentTag("");
                                setTestOrgSizeBracket("");
                                setTestAnswers({});

                                // Refresh data to show the new response
                                refetch();
                              } catch (error) {
                                console.error(
                                  "Error submitting to API:",
                                  error
                                );
                                toast.error("Failed to submit response to API");
                              }
                            };

                            submitResponse();
                          }}
                        >
                          Submit to API
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api-examples">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      API Examples
                    </CardTitle>
                    <CardDescription>
                      Examples for integrating with the onboarding API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Fetch Questions Example */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">
                          Fetch Onboarding Questions
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          GET from{" "}
                          <code className="bg-muted px-1 py-0.5 rounded">
                            /api/onboarding?tag=${"{tag}"}
                          </code>
                        </p>
                        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                          <pre>
                            {`curl -X GET \\
  "${
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://controls.tensorify.io"
  }/api/onboarding?tag=${data?.tag || "{tag}"}"`}
                          </pre>
                        </div>
                      </div>

                      {/* Submission Example */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Submit a Response</h4>
                        <p className="text-sm text-muted-foreground">
                          POST to{" "}
                          <code className="bg-muted px-1 py-0.5 rounded">
                            /api/onboarding/responses
                          </code>
                        </p>
                        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                          <pre>
                            {`# Submit with tag (recommended)
curl -X POST \\
  "${
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://controls.tensorify.io"
  }/api/onboarding/responses" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tag": "${data?.tag || "your_tag_here"}",
  "userId": "optional-user-id",
  "email": "optional-email@example.com",
  "clientFingerprint": "optional-device-identifier",
  "intentTag": "WILL_PAY_TEAM",
  "orgSizeBracket": "LT_20",
  "answers": [
${
  questions.length > 0
    ? questions
        .slice(0, Math.min(2, questions.length))
        .map(
          (q, i) =>
            `    {
        "questionId": "${q.id}",
        ${
          i === 0 && q.allowOtherOption
            ? `"customValue": "Your custom answer here"`
            : `"selectedOptionIds": [${
                q.options.length > 0
                  ? `"${q.options[0].id}"` +
                    (q.type === "multiple_choice" && q.options.length > 1
                      ? `, "${q.options[1].id}"`
                      : "")
                  : ""
              }]`
        }
      }`
        )
        .join(",\n")
    : `    {
        "questionId": "question_id_1",
        "customValue": "Your custom answer text here"
      },
      {
        "questionId": "question_id_2",
        "selectedOptionIds": ["option_id_2", "option_id_3"]
      }`
}
  ]
}'`}
                          </pre>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>
                            Expected response:{" "}
                            <code>{`{ "success": true, "responseId": "..." }`}</code>
                          </p>
                          <p className="mt-1">
                            <strong>Supported fields:</strong>
                          </p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>
                              <code>tag</code> or <code>versionId</code>:
                              Required - at least one must be provided
                            </li>
                            <li>
                              <code>userId</code>: Optional - unique identifier
                              for the user
                            </li>
                            <li>
                              <code>email</code>: Optional - user&apos;s email
                              address
                            </li>
                            <li>
                              <code>clientFingerprint</code>: Optional - device
                              identifier
                            </li>
                            <li>
                              <code>intentTag</code>: Optional - one of:{" "}
                              <code>WILL_NOT_PAY</code>,{" "}
                              <code>WILL_PAY_HOBBY</code>,{" "}
                              <code>WILL_PAY_TEAM</code>,{" "}
                              <code>ENTERPRISE_POTENTIAL</code>
                            </li>
                            <li>
                              <code>orgSizeBracket</code>: Optional - one of:{" "}
                              <code>&lt;20</code>, <code>20-99</code>,{" "}
                              <code>100-499</code>,{" "}
                              <code>500-999</code>,{" "}
                              <code>1000+</code>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
