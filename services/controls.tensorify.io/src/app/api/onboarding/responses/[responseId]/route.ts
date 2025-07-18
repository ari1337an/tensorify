import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/server/database/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> }
) {
  try {
    const { responseId } = await params;

    // Fetch the specific response by ID
    const response = await db.onboardingResponse.findUnique({
      where: { id: responseId },
      select: {
        id: true,
        userId: true,
        email: true,
        createdAt: true,
        intentTag: true,
        orgSizeBracket: true,
        clientFingerprint: true,
        tagVersionId: true,
        tagVersion: {
          select: {
            id: true,
            tag: true,
            title: true,
          },
        },
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
    });

    if (!response) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    // Format the response for API with proper grouping for multi-select questions
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

    const formattedResponse = {
      id: response.id,
      userId: response.userId,
      userName: response.userId || "Anonymous User", // Use userId as name if available
      email: response.email,
      clientFingerprint: response.clientFingerprint,
      createdAt: response.createdAt,
      intentTag: response.intentTag,
      orgSizeBracket: response.orgSizeBracket,
      tagVersion: response.tagVersion,
      answers: Array.from(answersMap.values()),
      isDummy: response.clientFingerprint?.startsWith("test-") || false,
    };

    return NextResponse.json({ response: formattedResponse });
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
