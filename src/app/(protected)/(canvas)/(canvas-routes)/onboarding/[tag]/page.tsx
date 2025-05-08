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
import {
  Gauge,
  BarChart3,
  Plus,
  Trash,
  GripVertical,
  FileText,
  Beaker,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Input } from "@/app/_components/ui/input";
import { ResponseTab } from "./response-tab";

// Define the API response types
interface ApiOnboardingQuestion {
  id: string;
  slug: string;
  title: string;
  type: string;
  iconSlug: string | null;
  sortOrder: number;
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

// Add response interface
interface OnboardingResponse {
  id: string;
  userId: string;
  userName: string;
  email: string;
  clientFingerprint?: string;
  intentTag?: string;
  orgSizeBracket?: string;
  tagVersionId?: string;
  createdAt: string;
  isDummy?: boolean; // Flag to identify test/dummy data
  answers: Array<{
    questionId: string;
    questionTitle: string;
    selectedOptions: Array<{
      optionId: string;
      optionLabel: string;
    }>;
  }>;
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
  const [testAnswers, setTestAnswers] = useState<Record<string, string[]>>({});
  const [showOnlyDummyData, setShowOnlyDummyData] = useState(false);

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
  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ["onboardingResponses", data?.id, tag],
    queryFn: async () => {
      if (!data?.id) return [];

      const response = await fetch(`/api/onboarding/by-tag/${tag}/responses`);
      if (!response.ok) {
        throw new Error("Failed to fetch responses");
      }

      const result = await response.json();
      return result.responses || [];
    },
    enabled: !!data?.id && activeTab === "responses",
  });

  // Memoize processed responses to avoid unnecessary updates
  const processedResponses = React.useMemo(() => {
    return responsesData || [];
  }, [responsesData]);

  // Restore the testDataResponses memo
  const testDataResponses = React.useMemo(() => {
    return showOnlyDummyData
      ? (responsesData || []).filter(
          (r: OnboardingResponse) => r.isDummy === true
        )
      : responsesData || [];
  }, [responsesData, showOnlyDummyData]);

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
  const initializeSortOrderIfNeeded = async () => {
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
  };

  // Call the initialization function when questions are loaded
  React.useEffect(() => {
    if (data?.questions && isDraft) {
      initializeSortOrderIfNeeded();
    }
  }, [data?.id, isDraft, questions.length]);

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
                <TabsTrigger
                  value="analytics"
                  disabled={!data?._count?.responses}
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="test-data">Test Data</TabsTrigger>
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
                  responses={processedResponses}
                  questions={questions}
                  isLoading={responsesLoading}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Response Analytics
                    </CardTitle>
                    <CardDescription>
                      View analytics for {data?._count?.responses || 0}{" "}
                      responses to this onboarding version.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <Gauge className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="text-lg font-semibold">
                            {data?._count?.responses || 0} Responses
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total responses collected
                          </div>
                        </div>
                      </div>

                      {/* Analytics will be expanded in a separate implementation */}
                      <div className="text-center text-muted-foreground py-12">
                        Detailed analytics dashboard is coming soon
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="test-data">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Beaker className="mr-2 h-5 w-5" />
                      Test Data
                    </CardTitle>
                    <CardDescription>
                      Add and manage test data for this onboarding version.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Test Data Form */}
                      <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="font-medium text-lg">Add Test Data</h3>

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
                                          testAnswers[question.id] || []
                                        ).includes(option.id)}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          setTestAnswers((prev) => {
                                            const currentAnswers =
                                              prev[question.id] || [];
                                            if (
                                              question.type === "single_choice"
                                            ) {
                                              return {
                                                ...prev,
                                                [question.id]: [option.id],
                                              };
                                            }
                                            // For multiple choice
                                            if (isChecked) {
                                              return {
                                                ...prev,
                                                [question.id]: [
                                                  ...currentAnswers,
                                                  option.id,
                                                ],
                                              };
                                            }
                                            return {
                                              ...prev,
                                              [question.id]:
                                                currentAnswers.filter(
                                                  (id) => id !== option.id
                                                ),
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
                              (answers) => answers.length > 0
                            );
                            if (!hasAnswers) {
                              toast.error("Please select at least one answer");
                              return;
                            }

                            // Generate a dummy response
                            const dummyResponse: OnboardingResponse = {
                              id: `dummy-${Date.now()}`,
                              userId: `dummy-user-${Date.now()}`,
                              userName: testUserName,
                              email: testEmail,
                              createdAt: new Date().toISOString(),
                              isDummy: true,
                              answers: questions
                                .filter(
                                  (q) =>
                                    testAnswers[q.id] &&
                                    testAnswers[q.id].length > 0
                                )
                                .map((question) => ({
                                  questionId: question.id,
                                  questionTitle: question.title,
                                  selectedOptions: (
                                    testAnswers[question.id] || []
                                  ).map((optionId) => {
                                    const option = question.options.find(
                                      (o) => o.id === optionId
                                    );
                                    return {
                                      optionId,
                                      optionLabel:
                                        option?.label || "Unknown Option",
                                    };
                                  }),
                                })),
                            };

                            // Store it directly in localStorage since we can't modify the state
                            const storedResponses =
                              localStorage.getItem("testResponses") || "[]";
                            const updatedResponses = JSON.stringify([
                              ...JSON.parse(storedResponses),
                              dummyResponse,
                            ]);
                            localStorage.setItem(
                              "testResponses",
                              updatedResponses
                            );

                            // Reset form
                            setTestUserName("");
                            setTestEmail("");
                            setTestAnswers({});

                            toast.success("Test data added successfully");
                          }}
                        >
                          Add Test Response
                        </Button>

                        <div className="mt-4 border-t pt-4">
                          <h3 className="font-medium text-lg mb-3">
                            Submit to API
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            This will submit a real response to the API endpoint
                            that will be stored in the database. Use this to
                            test the API integration.
                          </p>

                          <Button
                            variant="default"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={async () => {
                              try {
                                if (!data?.tag) {
                                  toast.error("Tag is required");
                                  return;
                                }

                                if (!testUserName || !testEmail) {
                                  toast.error(
                                    "Please provide both user name and email"
                                  );
                                  return;
                                }

                                const hasAnswers = Object.values(
                                  testAnswers
                                ).some((answers) => answers.length > 0);
                                if (!hasAnswers) {
                                  toast.error(
                                    "Please select at least one answer"
                                  );
                                  return;
                                }

                                // Convert the test answers to API format
                                const apiSubmission = {
                                  tag: data.tag,
                                  userId: testUserName,
                                  email: testEmail,
                                  clientFingerprint: `test-${Math.random()
                                    .toString(36)
                                    .substring(7)}`,
                                  intentTag: "WILL_PAY_TEAM",
                                  orgSizeBracket: "ONE_TO_FIVE",
                                  answers: Object.entries(testAnswers)
                                    .filter(
                                      ([, selectedIds]) =>
                                        selectedIds.length > 0
                                    )
                                    .map(([questionId, selectedOptionIds]) => ({
                                      questionId,
                                      selectedOptionIds,
                                    })),
                                };

                                // Submit to API using tag
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
                            }}
                          >
                            Submit to API
                          </Button>
                        </div>

                        <div className="mt-8 border-t pt-4">
                          <h3 className="font-medium text-lg mb-3">
                            API Documentation
                          </h3>
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
                              <h4 className="font-semibold">
                                Submit a Response
                              </h4>
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
  "orgSizeBracket": "ONE_TO_FIVE",
  "answers": [
${
  questions.length > 0
    ? questions
        .slice(0, Math.min(2, questions.length))
        .map(
          (q) =>
            `    {
      "questionId": "${q.id}",
      "selectedOptionIds": [${
        q.options.length > 0
          ? `"${q.options[0].id}"${
              q.type === "multiple_choice" && q.options.length > 1
                ? `, "${q.options[1].id}"`
                : ""
            }`
          : ""
      }]
    }`
        )
        .join(",\n")
    : `    {
      "questionId": "question_id_1",
      "selectedOptionIds": ["option_id_1"]
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
                                    <code>userId</code>: Optional - unique
                                    identifier for the user
                                  </li>
                                  <li>
                                    <code>email</code>: Optional - user&apos;s
                                    email address
                                  </li>
                                  <li>
                                    <code>clientFingerprint</code>: Optional -
                                    device identifier
                                  </li>
                                  <li>
                                    <code>intentTag</code>: Optional - one of:{" "}
                                    <code>WILL_NOT_PAY</code>,{" "}
                                    <code>WILL_PAY_HOBBY</code>,{" "}
                                    <code>WILL_PAY_TEAM</code>,{" "}
                                    <code>ENTERPRISE_POTENTIAL</code>
                                  </li>
                                  <li>
                                    <code>orgSizeBracket</code>: Optional - one
                                    of: <code>ONE_TO_FIVE</code>,{" "}
                                    <code>SIX_TO_TWENTY</code>,{" "}
                                    <code>TWENTYONE_TO_FIFTY</code>,{" "}
                                    <code>FIFTYONE_PLUS</code>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Get User Responses Example */}
                            <div className="space-y-2">
                              <h4 className="font-semibold">
                                Get User&apos;s Responses
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                GET from{" "}
                                <code className="bg-muted px-1 py-0.5 rounded">
                                  /api/onboarding/responses
                                </code>
                              </p>
                              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                                <pre>
                                  {`curl -X GET \\
  "${
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://controls.tensorify.io"
  }/api/onboarding/responses"

# Filter by tag
curl -X GET \\
  "${
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://controls.tensorify.io"
  }/api/onboarding/responses?tag=${data?.tag || "{tag}"}"
`}
                                </pre>
                              </div>
                            </div>

                            {/* Admin Get All Responses Example */}
                            <div className="space-y-2">
                              <h4 className="font-semibold">
                                Get All Responses (Admin Only)
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                GET from{" "}
                                <code className="bg-muted px-1 py-0.5 rounded">
                                  /api/onboarding/by-tag/{"{tag}"}/responses
                                </code>
                              </p>
                              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                                <pre>
                                  {`curl -X GET \\
  "${
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://controls.tensorify.io"
  }/api/onboarding/by-tag/${data?.tag || "{tag}"}/responses"
`}
                                </pre>
                              </div>
                            </div>

                            {/* Response Format */}
                            <div className="space-y-2">
                              <h4 className="font-semibold">Response Format</h4>
                              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                                <pre>
                                  {`{
  "responses": [
    {
      "id": "response_id",
      "userId": "user_id",
      "userName": "User Name",
      "email": "user@example.com",
      "createdAt": "2023-08-10T15:30:45.123Z",
      "answers": [
${
  questions.length > 0
    ? questions
        .slice(0, Math.min(2, questions.length))
        .map(
          (q) =>
            `        {
          "questionId": "${q.id}",
          "questionTitle": "${q.title}",
          "selectedOptions": [
            {
              "optionId": "${
                q.options.length > 0 ? q.options[0].id : "option_id"
              }",
              "optionLabel": "${
                q.options.length > 0 ? q.options[0].label : "Option Label"
              }"
            }${
              q.type === "multiple_choice" && q.options.length > 1
                ? `,
            {
              "optionId": "${q.options[1].id}",
              "optionLabel": "${q.options[1].label}"
            }`
                : ""
            }
          ]
        }`
        )
        .join(",\n")
    : `        {
          "questionId": "question_id",
          "questionTitle": "Question Title",
          "selectedOptions": [
            {
              "optionId": "option_id",
              "optionLabel": "Option Label"
            }
          ]
        }`
}
      ]
    }
  ]
}`}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Test Data Viewing */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">Test Data</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Show only test data</span>
                            <Button
                              variant={
                                showOnlyDummyData ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                setShowOnlyDummyData(!showOnlyDummyData)
                              }
                            >
                              {showOnlyDummyData
                                ? "Viewing Test Data"
                                : "View All Data"}
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testDataResponses.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={5}
                                    className="h-24 text-center"
                                  >
                                    No test data available.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                testDataResponses.map(
                                  (response: OnboardingResponse) => (
                                    <TableRow key={response.id}>
                                      <TableCell className="font-medium">
                                        {response.userName}
                                      </TableCell>
                                      <TableCell>{response.email}</TableCell>
                                      <TableCell>
                                        {new Date(
                                          response.createdAt
                                        ).toLocaleString()}
                                      </TableCell>
                                      <TableCell>
                                        {response.isDummy ? (
                                          <Badge
                                            variant="outline"
                                            className="bg-purple-100 text-purple-800"
                                          >
                                            Test
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="bg-blue-100 text-blue-800"
                                          >
                                            Real
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            console.log(
                                              "View details requested for response:",
                                              response.id
                                            );
                                            toast.info(
                                              "Response details are now handled by the ResponseTab component"
                                            );
                                          }}
                                        >
                                          <FileText className="h-4 w-4 mr-1" />{" "}
                                          View
                                        </Button>
                                        {response.isDummy && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              // Remove the response from localStorage
                                              const storedResponses =
                                                localStorage.getItem(
                                                  "testResponses"
                                                ) || "[]";
                                              const updatedResponses =
                                                JSON.parse(
                                                  storedResponses
                                                ).filter(
                                                  (r: OnboardingResponse) =>
                                                    r.id !== response.id
                                                );
                                              localStorage.setItem(
                                                "testResponses",
                                                JSON.stringify(updatedResponses)
                                              );
                                              toast.success(
                                                "Test data removed"
                                              );
                                            }}
                                            className="text-destructive"
                                          >
                                            <Trash className="h-4 w-4 mr-1" />{" "}
                                            Remove
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )
                              )}
                            </TableBody>
                          </Table>
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
