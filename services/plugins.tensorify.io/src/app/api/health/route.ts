import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Simple health check endpoint for the frontend service
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "plugins.tensorify.io",
    timestamp: new Date().toISOString(),
  });
}
