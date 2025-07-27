"use server";
import { revalidatePath } from "next/cache";
import db from "@/server/database/db";
import { QuestionType } from "@/server/database/prisma/generated/client";

// Get all onboarding tag versions
export async function getOnboardingTagVersions() {
  try {
    const versions = await db.onboardingTagVersion.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            questions: true,
            responses: true,
          },
        },
      },
    });

    return { versions };
  } catch (error) {
    console.error("Error fetching onboarding tag versions:", error);
    return { error: "Failed to fetch onboarding tag versions" };
  }
}

// Get a single onboarding tag version with its questions and options
export async function getOnboardingTagVersion(id: string) {
  try {
    const version = await db.onboardingTagVersion.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              createdAt: "asc", // Fallback sort for existing data
            },
          ],
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    if (!version) {
      return { error: "Onboarding tag version not found" };
    }

    return { version };
  } catch (error) {
    console.error("Error fetching onboarding tag version:", error);
    return { error: "Failed to fetch onboarding tag version" };
  }
}

// Create a new onboarding tag version
export async function createOnboardingTagVersion(data: {
  tag: string;
  title: string;
  description?: string;
}) {
  try {
    // Check if tag already exists
    const existingTag = await db.onboardingTagVersion.findUnique({
      where: { tag: data.tag },
    });

    if (existingTag) {
      return { error: "Tag already exists" };
    }

    const version = await db.onboardingTagVersion.create({
      data: {
        tag: data.tag,
        title: data.title,
        description: data.description,
        status: "DRAFT",
      },
    });

    revalidatePath("/onboarding");
    return { version };
  } catch (error) {
    console.error("Error creating onboarding tag version:", error);
    return { error: "Failed to create onboarding tag version" };
  }
}

// Update an existing onboarding tag version
export async function updateOnboardingTagVersion(
  id: string,
  data: {
    title: string;
    description?: string;
  }
) {
  try {
    const version = await db.onboardingTagVersion.findUnique({
      where: { id },
    });

    if (!version) {
      return { error: "Onboarding tag version not found" };
    }

    // Cannot update published or archived versions
    if (version.status !== "DRAFT") {
      return { error: "Cannot update a published or archived version" };
    }

    const updatedVersion = await db.onboardingTagVersion.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
      },
    });

    revalidatePath("/onboarding");
    return { version: updatedVersion };
  } catch (error) {
    console.error("Error updating onboarding tag version:", error);
    return { error: "Failed to update onboarding tag version" };
  }
}

// Publish an onboarding tag version
export async function publishOnboardingTagVersion(id: string) {
  try {
    const version = await db.onboardingTagVersion.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!version) {
      return { error: "Onboarding tag version not found" };
    }

    if (version.status !== "DRAFT") {
      return { error: "Only draft versions can be published" };
    }

    if (version.questions.length === 0) {
      return { error: "Cannot publish a version without questions" };
    }

    const updatedVersion = await db.onboardingTagVersion.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    revalidatePath("/onboarding");
    return { version: updatedVersion };
  } catch (error) {
    console.error("Error publishing onboarding tag version:", error);
    return { error: "Failed to publish onboarding tag version" };
  }
}

// Archive an onboarding tag version
export async function archiveOnboardingTagVersion(id: string) {
  try {
    const version = await db.onboardingTagVersion.findUnique({
      where: { id },
    });

    if (!version) {
      return { error: "Onboarding tag version not found" };
    }

    const updatedVersion = await db.onboardingTagVersion.update({
      where: { id },
      data: {
        status: "ARCHIVED",
      },
    });

    revalidatePath("/onboarding");
    return { version: updatedVersion };
  } catch (error) {
    console.error("Error archiving onboarding tag version:", error);
    return { error: "Failed to archive onboarding tag version" };
  }
}

// Delete an onboarding tag version
export async function deleteOnboardingTagVersion(id: string) {
  try {
    const version = await db.onboardingTagVersion.findUnique({
      where: { id },
      include: {
        responses: true,
      },
    });

    if (!version) {
      return { error: "Onboarding tag version not found" };
    }

    if (version.responses.length > 0) {
      return {
        error: "Cannot delete a version with responses. Archive it instead.",
      };
    }

    await db.onboardingTagVersion.delete({
      where: { id },
    });

    revalidatePath("/onboarding");
    return { success: true };
  } catch (error) {
    console.error("Error deleting onboarding tag version:", error);
    return { error: "Failed to delete onboarding tag version" };
  }
}

// Add a question to an onboarding tag version
export async function addOnboardingQuestion(data: {
  versionId: string;
  title: string;
  slug: string;
  type: QuestionType;
  iconSlug?: string;
  allowOtherOption?: boolean;
  options: Array<{ value: string; label: string; iconSlug?: string }>;
}) {
  try {
    const version = await db.onboardingTagVersion.findUnique({
      where: { id: data.versionId },
    });

    if (!version) {
      return { error: "Onboarding tag version not found" };
    }

    if (version.status !== "DRAFT") {
      return {
        error: "Cannot add questions to a published or archived version",
      };
    }

    // Check if slug is unique within this version
    const existingQuestion = await db.onboardingQuestion.findFirst({
      where: {
        versionId: data.versionId,
        slug: data.slug,
      },
    });

    if (existingQuestion) {
      return { error: "Question slug must be unique within this version" };
    }

    // Get highest sort order to place this question at the end
    const highestSortOrder = await db.onboardingQuestion.findFirst({
      where: { versionId: data.versionId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const nextSortOrder = highestSortOrder ? highestSortOrder.sortOrder + 1 : 0;

    const question = await db.onboardingQuestion.create({
      data: {
        versionId: data.versionId,
        title: data.title,
        slug: data.slug,
        type: data.type,
        iconSlug: data.iconSlug,
        allowOtherOption: data.allowOtherOption ?? false,
        sortOrder: nextSortOrder,
        options: {
          create: data.options.map((option, index) => ({
            value: option.value,
            label: option.label,
            iconSlug: option.iconSlug,
            sortOrder: index,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    revalidatePath(`/onboarding/${version.tag}`);
    return { question };
  } catch (error) {
    console.error("Error adding onboarding question:", error);
    return { error: "Failed to add onboarding question" };
  }
}

// Get onboarding responses for a specific tag version
export async function getOnboardingResponses(versionId: string) {
  try {
    const responses = await db.onboardingResponse.findMany({
      where: {
        tagVersionId: versionId,
      },
      include: {
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { responses };
  } catch (error) {
    console.error("Error fetching onboarding responses:", error);
    return { error: "Failed to fetch onboarding responses" };
  }
}

// Get analytics for a specific tag version
export async function getOnboardingAnalytics(versionId: string) {
  try {
    const version = await db.onboardingTagVersion.findUnique({
      where: { id: versionId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        responses: {
          include: {
            answers: {
              include: {
                question: true,
                option: true,
              },
            },
          },
        },
      },
    });

    if (!version) {
      return { error: "Onboarding tag version not found" };
    }

    // Calculate response stats
    const totalResponses = version.responses.length;

    // Calculate question-specific stats
    const questionStats = version.questions.map((question) => {
      const optionCounts = new Map();
      const otherResponses = new Map(); // Track "Other" responses and their counts

      // Initialize counts for all options
      question.options.forEach((option) => {
        optionCounts.set(option.id, 0);
      });

      // Count answers for each option
      version.responses.forEach((response) => {
        const answers = response.answers.filter(
          (a) => a.questionId === question.id
        );
        answers.forEach((answer) => {
          if (answer.optionId) {
            optionCounts.set(
              answer.optionId,
              (optionCounts.get(answer.optionId) || 0) + 1
            );
          }
          if (answer.customValue) {
            otherResponses.set(
              answer.customValue,
              (otherResponses.get(answer.customValue) || 0) + 1
            );
          }
        });
      });

      // Format option stats
      const optionStats = question.options.map((option) => ({
        optionId: option.id,
        label: option.label,
        count: optionCounts.get(option.id) || 0,
        percentage:
          totalResponses > 0
            ? ((optionCounts.get(option.id) || 0) / totalResponses) * 100
            : 0,
      }));

      // Format "Other" responses
      const otherResponseStats = Array.from(otherResponses.entries()).map(
        ([value, count]) => ({
          value,
          count,
          percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
        })
      );

      return {
        questionId: question.id,
        title: question.title,
        slug: question.slug,
        type: question.type,
        allowOtherOption: question.allowOtherOption,
        optionStats,
        otherResponseStats,
        otherCount: otherResponseStats.reduce(
          (sum, stat) => sum + stat.count,
          0
        ),
        otherPercentage:
          totalResponses > 0
            ? (otherResponseStats.reduce((sum, stat) => sum + stat.count, 0) /
                totalResponses) *
              100
            : 0,
      };
    });

    // Calculate organization size distribution
    const orgSizeDistribution = {
      LT_20: 0,
      FROM_20_TO_99: 0,
      FROM_100_TO_499: 0,
      FROM_500_TO_999: 0,
      GTE_1000: 0,
    };

    version.responses.forEach((response) => {
      orgSizeDistribution[response.orgSizeBracket]++;
    });

    // Calculate intent tag distribution
    const intentTagDistribution = {
      WILL_NOT_PAY: 0,
      WILL_PAY_HOBBY: 0,
      WILL_PAY_TEAM: 0,
      ENTERPRISE_POTENTIAL: 0,
    };

    version.responses.forEach((response) => {
      intentTagDistribution[response.intentTag]++;
    });

    return {
      analytics: {
        totalResponses,
        questionStats,
        orgSizeDistribution,
        intentTagDistribution,
      },
    };
  } catch (error) {
    console.error("Error fetching onboarding analytics:", error);
    return { error: "Failed to fetch onboarding analytics" };
  }
}

// Delete an onboarding question
export async function deleteOnboardingQuestion(questionId: string) {
  try {
    // Find the question with its version
    const question = await db.onboardingQuestion.findUnique({
      where: { id: questionId },
      include: {
        version: true,
      },
    });

    if (!question) {
      return { error: "Question not found" };
    }

    // Check if the version is in DRAFT status
    if (question.version.status !== "DRAFT") {
      return {
        error: "Cannot delete questions from published or archived versions",
      };
    }

    // Delete all options associated with the question
    await db.onboardingOption.deleteMany({
      where: { questionId },
    });

    // Delete the question
    await db.onboardingQuestion.delete({
      where: { id: questionId },
    });

    revalidatePath(`/onboarding/${question.version.tag}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting onboarding question:", error);
    return { error: "Failed to delete onboarding question" };
  }
}

// Update the order of questions in an onboarding tag version
export async function updateQuestionOrder(data: {
  versionId: string;
  questionOrders: Array<{ id: string; sortOrder: number }>;
}) {
  try {
    const version = await db.onboardingTagVersion.findUnique({
      where: { id: data.versionId },
    });

    if (!version) {
      return { error: "Onboarding tag version not found" };
    }

    // Can only update order in DRAFT versions
    if (version.status !== "DRAFT") {
      return {
        error: "Cannot update questions in published or archived versions",
      };
    }

    // Use a transaction for bulk updates
    await db.$transaction(
      data.questionOrders.map((item) =>
        db.onboardingQuestion.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidatePath(`/onboarding/${version.tag}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating question order:", error);
    return { error: "Failed to update question order" };
  }
}

export interface OnboardingResponseSubmission {
  versionId: string;
  userId?: string;
  email?: string;
  clientFingerprint?: string;
  intentTag?: string;
  // orgSizeBracket should be one of: '<20', '20-99', '100-499', '500-999', '1000+'
  orgSizeBracket?: string;
  answers: Array<{
    questionId: string;
    selectedOptionIds: string[];
    customValue?: string;
  }>;
}

export interface OnboardingResponseByTagSubmission {
  tag: string;
  userId?: string;
  email?: string;
  clientFingerprint?: string;
  intentTag?: string;
  // orgSizeBracket should be one of: '<20', '20-99', '100-499', '500-999', '1000+'
  orgSizeBracket?: string;
  answers: Array<{
    questionId: string;
    selectedOptionIds: string[];
    customValue?: string;
  }>;
}

export interface OnboardingResponseResult {
  success?: boolean;
  responseId?: string;
  error?: string;
}

export async function submitOnboardingResponse(
  data: OnboardingResponseSubmission
): Promise<OnboardingResponseResult> {
  try {
    const response = await fetch("/api/onboarding/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || "Failed to submit response" };
    }

    return {
      success: true,
      responseId: result.responseId,
    };
  } catch (error) {
    console.error("Error submitting onboarding response:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function submitOnboardingResponseByTag(
  data: OnboardingResponseByTagSubmission
): Promise<OnboardingResponseResult> {
  try {
    // First, get the version ID from the tag
    const versionResponse = await fetch(
      `/api/onboarding/versions?tag=${encodeURIComponent(data.tag)}`
    );
    const versionData = await versionResponse.json();

    if (!versionResponse.ok || !versionData.version) {
      return {
        error:
          versionData.error || "Failed to find version with the provided tag",
      };
    }

    // Then submit the response using the version ID
    const submitData: OnboardingResponseSubmission = {
      versionId: versionData.version.id,
      userId: data.userId,
      email: data.email,
      clientFingerprint: data.clientFingerprint,
      intentTag: data.intentTag,
      orgSizeBracket: data.orgSizeBracket,
      answers: data.answers,
    };

    return submitOnboardingResponse(submitData);
  } catch (error) {
    console.error("Error submitting onboarding response by tag:", error);
    return { error: "An unexpected error occurred" };
  }
}
