import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/server/database/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;

    // Find the version by tag
    const version = await db.onboardingTagVersion.findUnique({
      where: { tag },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Onboarding version not found" },
        { status: 404 }
      );
    }

    // Fetch all responses for the version
    const responses = await db.onboardingResponse.findMany({
      where: { tagVersionId: version.id },
      select: {
        id: true,
        userId: true,
        email: true,
        createdAt: true,
        intentTag: true,
        orgSizeBracket: true,
        clientFingerprint: true,
        answers: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
              },
            },
            option: {
              select: {
                id: true,
                label: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format responses for API with proper grouping for multi-select questions
    const formattedResponses = responses.map((response) => {
      // Group answers by questionId for multi-select questions
      const answersMap = new Map();

      // First pass: set up the answer structure for each question
      response.answers.forEach((answer) => {
        if (!answersMap.has(answer.questionId)) {
          answersMap.set(answer.questionId, {
            questionId: answer.questionId,
            questionTitle: answer.question?.title || "Unknown Question",
            selectedOptions: [],
            customValue: null,
          });
        }
      });

      // Second pass: Add all selected options, preserving custom values
      response.answers.forEach((answer) => {
        const currentAnswerObj = answersMap.get(answer.questionId);

        // Store the custom value regardless of whether it has an option
        if (answer.customValue) {
          currentAnswerObj.customValue = answer.customValue;
        }

        // Add the option if it exists
        if (answer.option) {
          currentAnswerObj.selectedOptions.push({
            optionId: answer.optionId,
            optionLabel: answer.option.label,
          });
        }
      });

      return {
        id: response.id,
        userId: response.userId,
        userName: response.userId || "Anonymous User", // Use userId as name if available
        email: response.email,
        clientFingerprint: response.clientFingerprint,
        createdAt: response.createdAt,
        intentTag: response.intentTag,
        orgSizeBracket: response.orgSizeBracket,
        answers: Array.from(answersMap.values()),
        isDummy: response.clientFingerprint?.startsWith("test-") || false,
      };
    });

    return NextResponse.json({ responses: formattedResponses });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
