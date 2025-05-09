import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();

    // Forward the request to the external API
    const response = await fetch(
      "https://controls.tensorify.io/api/onboarding/responses",
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
