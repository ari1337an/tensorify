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
            // customValue: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format responses for API
    const formattedResponses = responses.map((response) => ({
      id: response.id,
      userId: response.userId,
      userName: "Anonymous User", // Cannot get user name from this model
      email: response.email,
      clientFingerprint: response.clientFingerprint,
      createdAt: response.createdAt,
      intentTag: response.intentTag,
      orgSizeBracket: response.orgSizeBracket,
      answers: response.answers.map((answer) => ({
        questionId: answer.questionId,
        questionTitle: answer.question.title,
        selectedOptions: answer.option
          ? [
              {
                optionId: answer.optionId,
                optionLabel: answer.option.label,
              },
            ]
          : [],
        customValue: answer.customValue,
      })),
    }));

    return NextResponse.json({ responses: formattedResponses });
  } catch (error) {
    console.error("Error fetching version responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
