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
      .enum(["<20", "20-99", "100-499", "500-999", "1000+"])
      .optional(),
    answers: z
      .array(
        z
          .object({
            questionId: z.string().min(1, "Question ID is required"),
            selectedOptionIds: z
              .array(z.string().min(1, "Option ID is required"))
              .optional(),
            customValue: z.string().optional(),
          })
          .refine(
            (data) => {
              // Either selectedOptionIds must have values OR customValue must be present
              return (
                (data.selectedOptionIds && data.selectedOptionIds.length > 0) ||
                (data.customValue && data.customValue.length > 0)
              );
            },
            {
              message:
                "Either selectedOptionIds or customValue must be provided",
            }
          )
      )
      .min(1, "At least one answer is required"),
  })
  .refine((data) => data.versionId || data.tag, {
    message: "Either versionId or tag must be provided",
    path: ["versionId"],
  });

// Map API org size values to internal enum
const orgSizeApiToEnum = {
  "<20": OrgSizeBracket.LT_20,
  "20-99": OrgSizeBracket.FROM_20_TO_99,
  "100-499": OrgSizeBracket.FROM_100_TO_499,
  "500-999": OrgSizeBracket.FROM_500_TO_999,
  "1000+": OrgSizeBracket.GTE_1000,
};

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
        orgSizeBracket: orgSizeBracket
          ? orgSizeApiToEnum[orgSizeBracket]
          : OrgSizeBracket.LT_20,
        tagVersionId: actualVersionId,
      },
    });

    // Verify all questions and options exist before creating answers
    for (const answer of answers) {
      // Verify question exists
      const question = await db.onboardingQuestion.findUnique({
        where: { id: answer.questionId },
        include: { options: true },
      });

      if (!question) {
        await db.onboardingResponse.delete({ where: { id: response.id } });
        return NextResponse.json(
          { error: `Question with ID ${answer.questionId} not found` },
          { status: 400 }
        );
      }

      // If selected options provided, verify they exist and belong to the question
      if (answer.selectedOptionIds?.length) {
        const validOptionIds = question.options.map((opt) => opt.id);
        const invalidOptions = answer.selectedOptionIds.filter(
          (id) => !validOptionIds.includes(id)
        );

        if (invalidOptions.length > 0) {
          await db.onboardingResponse.delete({ where: { id: response.id } });
          return NextResponse.json(
            {
              error: `Invalid options for question ${answer.questionId}`,
              details: `Options not found or don't belong to the question: ${invalidOptions.join(
                ", "
              )}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Create answers
    try {
      await Promise.all(
        answers.map(async (answer) => {
          if (answer.customValue) {
            // For custom value answers
            await db.onboardingAnswer.create({
              data: {
                responseId: response.id,
                questionId: answer.questionId,
                customValue: answer.customValue,
              },
            });
          } else if (answer.selectedOptionIds?.length) {
            // For selected options
            await Promise.all(
              answer.selectedOptionIds.map((optionId) =>
                db.onboardingAnswer.create({
                  data: {
                    responseId: response.id,
                    questionId: answer.questionId,
                    optionId,
                  },
                })
              )
            );
          }
        })
      );

      return NextResponse.json(
        { success: true, responseId: response.id },
        { status: 201 }
      );
    } catch (error) {
      // If something goes wrong while creating answers, delete the response
      await db.onboardingResponse.delete({ where: { id: response.id } });
      throw error;
    }
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
