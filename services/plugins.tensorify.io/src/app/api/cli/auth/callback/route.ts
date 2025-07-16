import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { getDecodedJwt } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Get current user authentication
    const { userId, sessionId } = await auth();

    if (!userId || !sessionId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL("/sign-in", request.url);
      const callbackUrl =
        request.nextUrl.searchParams.get("redirect_url") ||
        request.nextUrl.searchParams.get("callback_url");

      if (callbackUrl) {
        signInUrl.searchParams.set("redirect_url", callbackUrl);
      }

      return NextResponse.redirect(signInUrl);
    }

    // Initialize Clerk client to get JWT token
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Get a JWT token for the authenticated session
    const tokenResponse = await clerk.sessions.getToken(sessionId, "jwt", 3600); // 1 hour

    // Extract the JWT token string
    const jwtToken = tokenResponse.jwt;

    if (!jwtToken) {
      return NextResponse.json(
        { error: "Failed to generate authentication token" },
        { status: 500 }
      );
    }

    // Verify the token with JWKS before using it
    const verificationResult = await getDecodedJwt(jwtToken);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message || "Token verification failed" },
        { status: 500 }
      );
    }

    // Get the CLI callback URL from query parameters
    const callbackUrl =
      request.nextUrl.searchParams.get("redirect_url") ||
      request.nextUrl.searchParams.get("callback_url");
    const port = request.nextUrl.searchParams.get("port");

    if (!callbackUrl) {
      return NextResponse.json(
        { error: "No callback URL provided" },
        { status: 400 }
      );
    }

    // Construct the CLI callback URL with JWT token
    const cliCallbackUrl = new URL(callbackUrl);
    cliCallbackUrl.searchParams.set("session", jwtToken);
    cliCallbackUrl.searchParams.set("user_id", userId);

    // If port is provided, update the URL
    if (port && callbackUrl.includes("localhost")) {
      const url = new URL(callbackUrl);
      url.port = port;
      url.searchParams.set("session", jwtToken);
      url.searchParams.set("user_id", userId);

      return NextResponse.redirect(url.toString());
    }

    // Redirect back to CLI with JWT token
    return NextResponse.redirect(cliCallbackUrl.toString());
  } catch (error) {
    console.error("CLI auth callback error:", error);

    return NextResponse.json(
      { error: "Authentication callback failed" },
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
