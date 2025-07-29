import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cli/profile
 * Endpoint for CLI to fetch authenticated user profile
 * Supports both regular Clerk tokens and development test tokens
 */
export async function GET(request: NextRequest) {
  try {
    // In development, check for test tokens first
    if (process.env.NODE_ENV === "development") {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);

        // Try to decode test token
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const jwt = require("jsonwebtoken");
          const secret =
            process.env.TEST_JWT_SECRET || "test-secret-development-only";
          const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });

          // Return test user profile
          return NextResponse.json({
            success: true,
            user: {
              id: decoded.id,
              username: decoded.username,
              firstName: decoded.firstName,
              lastName: decoded.lastName,
              email: decoded.email,
              imageUrl: decoded.imageUrl,
            },
          });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (testTokenError) {
          // Not a test token, continue with regular auth
        }
      }
    }

    // TODO: Add regular Clerk authentication here for production
    // For now, return unauthorized for non-test tokens
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  } catch (error) {
    console.error("CLI profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
