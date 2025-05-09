import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();

    // Get the controls base URL from environment variables
    const controlsBaseUrl =
      process.env.CONTROLS_BASE_URL || "https://controls.tensorify.io";

    // Forward the request to the external API
    const response = await fetch(
      `${controlsBaseUrl}/api/onboarding/responses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to submit onboarding responses: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in onboarding responses API route:", error);
    return NextResponse.json(
      { error: "Failed to submit onboarding responses" },
      { status: 500 }
    );
  }
}
