"use client";

import React, { useMemo, useState } from "react";
import { BarChart3, Users, Building, ListFilter, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Rectangle,
  Label,
  Cell,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Label as UILabel } from "@/app/_components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";

// Define types
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
  isDummy?: boolean;
  answers: Array<{
    questionId: string;
    questionTitle: string;
    selectedOptions: Array<{
      optionId: string;
      optionLabel: string;
    }>;
    customValue?: string;
  }>;
}

// Color palettes
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

// Intent tag labels mapping
const INTENT_LABELS: Record<string, string> = {
  WILL_PAY_TEAM: "Will Pay (Team)",
  WILL_PAY_INDIVIDUAL: "Will Pay (Individual)",
  WILL_PAY_HOBBY: "Will Pay (Hobby)",
  WILL_NOT_PAY: "Will Not Pay",
  ENTERPRISE_POTENTIAL: "Enterprise Potential",
  CURIOUS: "Curious",
};

// Org size labels mapping
const ORG_SIZE_LABELS: Record<string, string> = {
  LT_20: "<20",
  FROM_20_TO_99: "20-99",
  FROM_100_TO_499: "100-499",
  FROM_500_TO_999: "500-999",
  GTE_1000: "1000+",
};

interface AnalyticsTabProps {
  responses: OnboardingResponse[];
  questions: ApiOnboardingQuestion[];
  isLoading: boolean;
}

export function AnalyticsTab({
  responses,
  questions,
  isLoading,
}: AnalyticsTabProps) {
  // Filter state
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
  const [selectedOrgSizes, setSelectedOrgSizes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedQuestionFilters, setSelectedQuestionFilters] = useState<
    Record<string, string[]>
  >({});

  // Filter responses based on selected filters
  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      // Filter by intent
      if (selectedIntents.length > 0 && response.intentTag) {
        if (!selectedIntents.includes(response.intentTag)) {
          return false;
        }
      }

      // Filter by org size
      if (selectedOrgSizes.length > 0 && response.orgSizeBracket) {
        if (!selectedOrgSizes.includes(response.orgSizeBracket)) {
          return false;
        }
      }

      // Filter by date range
      if (dateRange.from || dateRange.to) {
        const responseDate = new Date(response.createdAt);
        if (dateRange.from && responseDate < dateRange.from) {
          return false;
        }
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (responseDate > endOfDay) {
            return false;
          }
        }
      }

      // Filter by question options
      if (Object.keys(selectedQuestionFilters).length > 0) {
        for (const [questionId, selectedOptionIds] of Object.entries(
          selectedQuestionFilters
        )) {
          if (selectedOptionIds.length === 0) continue;

          const answer = response.answers.find(
            (a) => a.questionId === questionId
          );
          if (!answer) return false;

          const hasMatchingOption = answer.selectedOptions.some((option) =>
            selectedOptionIds.includes(option.optionId)
          );
          if (!hasMatchingOption) return false;
        }
      }

      return true;
    });
  }, [
    responses,
    selectedIntents,
    selectedOrgSizes,
    dateRange,
    selectedQuestionFilters,
  ]);

  // Prepare data for intent distribution chart
  const intentData = useMemo(() => {
    if (!filteredResponses.length) return [];

    const intentCounts: Record<string, number> = {};

    filteredResponses.forEach((response) => {
      const intent = response.intentTag || "Unknown";
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    });

    return Object.entries(intentCounts).map(([intent, count], index) => ({
      browser: intent,
      visitors: count,
      fill: COLORS[index % COLORS.length],
    }));
  }, [filteredResponses]);

  // Calculate total responses
  const totalResponses = useMemo(() => {
    return intentData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, [intentData]);

  // Create chart config for intent data
  const intentChartConfig = useMemo(() => {
    const config: ChartConfig = {
      visitors: {
        label: "Responses",
      },
    };

    intentData.forEach((item, index) => {
      config[item.browser] = {
        label: INTENT_LABELS[item.browser] || item.browser,
        color: COLORS[index % COLORS.length],
      };
    });

    return config;
  }, [intentData]);

  // Prepare data for org size distribution chart
  const orgSizeData = useMemo(() => {
    if (!filteredResponses.length) return [];

    const orgSizeCounts: Record<string, number> = {};

    filteredResponses.forEach((response) => {
      const orgSize = response.orgSizeBracket || "Unknown";
      orgSizeCounts[orgSize] = (orgSizeCounts[orgSize] || 0) + 1;
    });

    return Object.entries(orgSizeCounts)
      .map(([orgSize, count], index) => ({
        month: ORG_SIZE_LABELS[orgSize] || orgSize,
        desktop: count,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => {
        // Sort org sizes in logical order
        const sizeOrder = Object.keys(ORG_SIZE_LABELS);
        const aIndex = sizeOrder.indexOf(
          Object.entries(ORG_SIZE_LABELS).find(([, v]) => v === a.month)?.[0] ||
            ""
        );
        const bIndex = sizeOrder.indexOf(
          Object.entries(ORG_SIZE_LABELS).find(([, v]) => v === b.month)?.[0] ||
            ""
        );

        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
  }, [filteredResponses]);

  // Create chart config for org size data
  const orgSizeChartConfig = useMemo(() => {
    const config: ChartConfig = {
      desktop: {
        label: "Responses",
      },
    };

    orgSizeData.forEach((item, index) => {
      config[item.month] = {
        label: item.month,
        color: COLORS[index % COLORS.length],
      };
    });

    return config;
  }, [orgSizeData]);

  // Prepare data for question response histograms
  const questionResponseData = useMemo(() => {
    if (!filteredResponses.length || !questions.length) return {};

    const result: Record<
      string,
      Array<{ name: string; label: string; count: number; fill: string }>
    > = {};

    questions.forEach((question) => {
      const optionCounts: Record<string, number> = {};

      // Initialize counts for all options
      question.options.forEach((option) => {
        optionCounts[option.id] = 0;
      });

      // Count responses for each option
      filteredResponses.forEach((response) => {
        const answer = response.answers.find(
          (a) => a.questionId === question.id
        );
        if (answer) {
          answer.selectedOptions.forEach((selectedOption) => {
            optionCounts[selectedOption.optionId] =
              (optionCounts[selectedOption.optionId] || 0) + 1;
          });
        }
      });

      // Format data for chart
      result[question.id] = question.options.map((option, index) => ({
        name: option.id,
        label: option.label,
        count: optionCounts[option.id] || 0,
        fill: COLORS[index % COLORS.length],
      }));
    });

    return result;
  }, [filteredResponses, questions]);

  // Create chart configs for each question
  const questionChartConfigs = useMemo(() => {
    const configs: Record<string, ChartConfig> = {};

    questions.forEach((question) => {
      const config: ChartConfig = {
        count: {
          label: "Count",
        },
      };

      const data = questionResponseData[question.id] || [];
      data.forEach((item) => {
        config[item.name] = {
          label: item.label,
          color: item.fill,
        };
      });

      configs[question.id] = config;
    });

    return configs;
  }, [questionResponseData, questions]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedIntents.length > 0) count++;
    if (selectedOrgSizes.length > 0) count++;
    if (dateRange.from || dateRange.to) count++;

    const questionFilterCount = Object.values(selectedQuestionFilters).filter(
      (options) => options.length > 0
    ).length;

    return count + questionFilterCount;
  }, [selectedIntents, selectedOrgSizes, dateRange, selectedQuestionFilters]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedIntents([]);
    setSelectedOrgSizes([]);
    setDateRange({ from: undefined, to: undefined });
    setSelectedQuestionFilters({});
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Response Analytics
            </CardTitle>
            <CardDescription>
              Visual insights from {filteredResponses.length} of{" "}
              {responses.length} responses
              {activeFilterCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {activeFilterCount}{" "}
                  {activeFilterCount === 1 ? "filter" : "filters"} active
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Analytics</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Date Range</h4>
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <UILabel className="text-xs">From Date</UILabel>
                          <input
                            type="date"
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={
                              dateRange.from
                                ? dateRange.from.toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => {
                              const newDate = e.target.value
                                ? new Date(e.target.value)
                                : undefined;
                              setDateRange((prev) => ({
                                ...prev,
                                from: newDate,
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <UILabel className="text-xs">To Date</UILabel>
                          <input
                            type="date"
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={
                              dateRange.to
                                ? dateRange.to.toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => {
                              const newDate = e.target.value
                                ? new Date(e.target.value)
                                : undefined;
                              setDateRange((prev) => ({
                                ...prev,
                                to: newDate,
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Intent</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(INTENT_LABELS).map(([value, label]) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`intent-${value}`}
                            checked={selectedIntents.includes(value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedIntents((prev) => [...prev, value]);
                              } else {
                                setSelectedIntents((prev) =>
                                  prev.filter((i) => i !== value)
                                );
                              }
                            }}
                          />
                          <UILabel htmlFor={`intent-${value}`}>{label}</UILabel>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Organization Size</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(ORG_SIZE_LABELS).map(([value, label]) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`org-${value}`}
                            checked={selectedOrgSizes.includes(value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOrgSizes((prev) => [...prev, value]);
                              } else {
                                setSelectedOrgSizes((prev) =>
                                  prev.filter((i) => i !== value)
                                );
                              }
                            }}
                          />
                          <UILabel htmlFor={`org-${value}`}>{label}</UILabel>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Questions</h4>
                    <div className="space-y-3">
                      {questions.map((question) => (
                        <Popover key={question.id}>
                          <div className="flex justify-between items-center">
                            <div className="text-sm truncate max-w-[250px]">
                              {question.title}
                            </div>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                {selectedQuestionFilters[question.id]?.length
                                  ? `${
                                      selectedQuestionFilters[question.id]
                                        .length
                                    } selected`
                                  : "Select options"}
                              </Button>
                            </PopoverTrigger>
                          </div>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">{question.title}</h4>
                              <div className="space-y-2">
                                {question.options.map((option) => (
                                  <div
                                    key={option.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`q-${question.id}-opt-${option.id}`}
                                      checked={
                                        selectedQuestionFilters[
                                          question.id
                                        ]?.includes(option.id) || false
                                      }
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedQuestionFilters(
                                            (prev) => ({
                                              ...prev,
                                              [question.id]: [
                                                ...(prev[question.id] || []),
                                                option.id,
                                              ],
                                            })
                                          );
                                        } else {
                                          setSelectedQuestionFilters(
                                            (prev) => ({
                                              ...prev,
                                              [question.id]: (
                                                prev[question.id] || []
                                              ).filter(
                                                (id) => id !== option.id
                                              ),
                                            })
                                          );
                                        }
                                      }}
                                    />
                                    <UILabel
                                      htmlFor={`q-${question.id}-opt-${option.id}`}
                                    >
                                      {option.label}
                                    </UILabel>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="questions" className="flex items-center">
              <ListFilter className="mr-2 h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="intent" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Intent
            </TabsTrigger>
            <TabsTrigger value="orgSize" className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              Org Size
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {responses.length === 0
                  ? "No responses have been collected yet. Add test data or collect responses to see analytics."
                  : "No responses match the current filters. Try adjusting your filter criteria."}
              </div>
            ) : (
              <ScrollArea className="pr-4">
                <div className="space-y-4">
                  {questions.map((question) => (
                    <Card key={question.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{question.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="h-[300px] w-full">
                          <ChartContainer
                            config={questionChartConfigs[question.id]}
                            className="w-full h-full"
                          >
                            <BarChart
                              accessibilityLayer
                              data={questionResponseData[question.id] || []}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 30,
                              }}
                            >
                              <CartesianGrid vertical={false} />
                              <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={8}
                                axisLine={false}
                                fontSize={10}
                                tick={{ fill: "var(--foreground)" }}
                                tickFormatter={(value) => {
                                  const config =
                                    questionChartConfigs[question.id];
                                  const label =
                                    config[value as keyof typeof config]
                                      ?.label || value;
                                  // Truncate long labels
                                  return label.length > 15
                                    ? label.substring(0, 12) + "..."
                                    : label;
                                }}
                              />
                              <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "var(--foreground)" }}
                                fontSize={10}
                                width={30}
                              />
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                              />
                              <Bar
                                dataKey="count"
                                strokeWidth={2}
                                radius={8}
                                activeIndex={2}
                                activeBar={({ ...props }) => {
                                  return (
                                    <Rectangle
                                      {...props}
                                      fillOpacity={0.8}
                                      stroke={props.payload.fill}
                                      strokeDasharray={4}
                                      strokeDashoffset={4}
                                    />
                                  );
                                }}
                              />
                            </BarChart>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="intent" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {responses.length === 0
                  ? "No responses have been collected yet. Add test data or collect responses to see analytics."
                  : "No responses match the current filters. Try adjusting your filter criteria."}
              </div>
            ) : (
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-base">
                    Intent Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of user intent categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <div className="h-[350px] w-full">
                    <ChartContainer
                      config={intentChartConfig}
                      className="w-full h-full"
                    >
                      <PieChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={intentData}
                          dataKey="visitors"
                          nameKey="browser"
                          innerRadius={60}
                          strokeWidth={5}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (
                                viewBox &&
                                "cx" in viewBox &&
                                "cy" in viewBox
                              ) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="fill-foreground text-3xl font-bold"
                                    >
                                      {totalResponses.toLocaleString()}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 24}
                                      className="fill-muted-foreground"
                                    >
                                      Responses
                                    </tspan>
                                  </text>
                                );
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="leading-none text-muted-foreground">
                    Distribution of user intent categories from{" "}
                    {filteredResponses.length} responses
                    {activeFilterCount > 0 && " (filtered)"}
                  </div>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orgSize" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {responses.length === 0
                  ? "No responses have been collected yet. Add test data or collect responses to see analytics."
                  : "No responses match the current filters. Try adjusting your filter criteria."}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Organization Size Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of respondents by organization size
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ChartContainer
                      config={orgSizeChartConfig}
                      className="w-full h-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={orgSizeData}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 60,
                          bottom: 20,
                        }}
                      >
                        <XAxis type="number" dataKey="desktop" hide />
                        <YAxis
                          dataKey="month"
                          type="category"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="desktop" fillOpacity={0.8} radius={5}>
                          {orgSizeData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="leading-none text-muted-foreground">
                    Distribution of organization sizes from{" "}
                    {filteredResponses.length} responses
                    {activeFilterCount > 0 && " (filtered)"}
                  </div>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
