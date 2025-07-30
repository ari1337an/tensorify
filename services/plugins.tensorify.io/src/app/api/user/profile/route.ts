import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { getDecodedJwt } from "@/lib/auth-utils";

// Response schema for user profile
const userProfileSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable(),
  email: z.string(),
  username: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    // Add CORS headers for CLI access
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "No valid authentication token provided",
        },
        { status: 401, headers }
      );
    }

    // Verify JWT token
    const verificationResult = await getDecodedJwt(token);

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: verificationResult.message || "Token verification failed",
        },
        { status: 401, headers }
      );
    }

    // Format user data for CLI consumption
    const userProfile = {
      id: verificationResult.data?.id,
      fullName:
        verificationResult.data?.firstName +
        " " +
        verificationResult.data?.lastName,
      email: verificationResult.data?.email,
      username: verificationResult.data?.username,
    };

    // Validate the response data
    const validatedProfile = userProfileSchema.parse(userProfile);

    return NextResponse.json(
      {
        status: "success",
        data: validatedProfile,
        message: "User profile retrieved successfully",
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Token expired",
        },
        { status: 401, headers }
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid token",
        },
        { status: 401, headers }
      );
    } else if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid user data",
          message: "User profile data validation failed",
          details: error.errors,
        },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to retrieve user profile",
      },
      { status: 500, headers }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}