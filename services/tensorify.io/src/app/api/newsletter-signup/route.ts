import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, role, otherRole, consentGiven } = body;

    // Basic validation
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    if (role === "other" && !otherRole) {
      return NextResponse.json(
        { error: "Please specify your role" },
        { status: 400 }
      );
    }

    // Check for existing email
    const existingSignup = await prisma.newsletterSignup.findUnique({
      where: { email },
    });

    if (existingSignup) {
      return NextResponse.json(
        { message: "You are already signed up for our newsletter!" },
        { status: 200 }
      );
    }

    // Create new signup
    const signup = await prisma.newsletterSignup.create({
      data: {
        email,
        role,
        otherRole: role === "other" ? otherRole : null,
        consentGiven: !!consentGiven, // Cast to boolean to handle undefined/null values
      },
    });

    return NextResponse.json(
      { message: "Thank you for signing up!", signup },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Failed to sign up for newsletter" },
      { status: 500 }
    );
  }
}
