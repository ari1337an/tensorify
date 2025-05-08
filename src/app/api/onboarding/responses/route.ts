import { NextResponse } from "next/server";
import db from "@/server/database/db";
import { z } from "zod";
import { IntentTag, OrgSizeBracket } from "@prisma/client";

// Validation schema for response submission
const responseSchema = z
  .object({
    versionId: z.string().min(1, "Version ID is required").optional(),
    tag: z.string().min(1, "Tag is required").optional(),
    userId: z.string().optional(),
    email: z.string().email("Valid email is required").optional(),
    clientFingerprint: z.string().optional(),
    intentTag: z
      .enum([
        IntentTag.WILL_NOT_PAY,
        IntentTag.WILL_PAY_HOBBY,
        IntentTag.WILL_PAY_TEAM,
        IntentTag.ENTERPRISE_POTENTIAL,
      ])
      .optional(),
    orgSizeBracket: z
      .enum([
        OrgSizeBracket.ONE_TO_FIVE,
        OrgSizeBracket.SIX_TO_TWENTY,
        OrgSizeBracket.TWENTYONE_TO_FIFTY,
        OrgSizeBracket.FIFTYONE_PLUS,
      ])
      .optional(),
    answers: z
      .array(
        z.object({
          questionId: z.string().min(1, "Question ID is required"),
          selectedOptionIds: z
            .array(z.string().min(1, "Option ID is required"))
            .min(1, "At least one option must be selected"),
        })
      )
      .min(1, "At least one answer is required"),
  })
  .refine((data) => data.versionId || data.tag, {
    message: "Either versionId or tag must be provided",
    path: ["versionId"],
  });

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();
    console.log("Received body:", body);

    // Validate request body
    const validationResult = responseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      versionId,
      tag,
      answers,
      userId,
      email,
      clientFingerprint,
      intentTag,
      orgSizeBracket,
    } = validationResult.data;

    let actualVersionId = versionId;

    // If tag is provided but no versionId, look up the versionId by tag
    if (!versionId && tag) {
      const tagVersion = await db.onboardingTagVersion.findUnique({
        where: { tag },
        select: { id: true },
      });

      if (!tagVersion) {
        return NextResponse.json(
          { error: "Onboarding version with provided tag not found" },
          { status: 404 }
        );
      }

      actualVersionId = tagVersion.id;
    }

    console.log("Using version ID:", actualVersionId);

    // Verify version exists
    const version = await db.onboardingTagVersion.findUnique({
      where: { id: actualVersionId },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Onboarding version not found" },
        { status: 404 }
      );
    }

    // Ensure we have a non-undefined version ID
    if (!actualVersionId) {
      return NextResponse.json(
        { error: "Version ID is required" },
        { status: 400 }
      );
    }

    // Generate random values for required fields if not provided
    const generatedUserId =
      userId || "test-user-" + Math.random().toString(36).substring(7);
    const generatedFingerprint =
      clientFingerprint || "test-" + Math.random().toString(36).substring(7);
    const generatedEmail = email || "test@example.com";

    // Create response record
    const response = await db.onboardingResponse.create({
      data: {
        userId: generatedUserId,
        email: generatedEmail,
        clientFingerprint: generatedFingerprint,
        intentTag: intentTag || IntentTag.WILL_PAY_TEAM,
        orgSizeBracket: orgSizeBracket || OrgSizeBracket.ONE_TO_FIVE,
        tagVersionId: actualVersionId,
        answers: {
          create: answers.flatMap((answer) =>
            answer.selectedOptionIds.map((optionId) => ({
              questionId: answer.questionId,
              optionId: optionId,
            }))
          ),
        },
      },
    });

    return NextResponse.json(
      { success: true, responseId: response.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting onboarding response:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// Get all responses for a user
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");
    let whereClause = {};

    // Filter by tag if provided
    if (tag) {
      // First find the version with this tag
      const version = await db.onboardingTagVersion.findUnique({
        where: { tag },
        select: { id: true },
      });

      if (!version) {
        return NextResponse.json(
          { error: "Version with provided tag not found" },
          { status: 404 }
        );
      }

      whereClause = { tagVersionId: version.id };
    }

    // Fetch responses
    const responses = await db.onboardingResponse.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tagVersion: {
          select: {
            tag: true,
            title: true,
          },
        },
      },
    });

    // Make sure the response includes the clientFingerprint in the returned data
    const responsesWithFingerprint = responses.map((response) => ({
      ...response,
      clientFingerprint: response.clientFingerprint || null,
    }));

    return NextResponse.json({ responses: responsesWithFingerprint });
  } catch (error) {
    console.error("Error fetching onboarding responses:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
