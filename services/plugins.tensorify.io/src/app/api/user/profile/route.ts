import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/user/profile
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

          // Return test user profile in the format CLI expects
          return NextResponse.json({
            data: {
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
