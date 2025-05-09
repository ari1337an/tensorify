import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Extract the tag parameter from the request URL
    const url = new URL(request.url);
    const defaultTag =
      process.env.NEXT_PUBLIC_ONBOARDING_TAG ||
      "apptensorifyio-onboarding-beta-v01";
    const tag = url.searchParams.get("tag") || defaultTag;

    // Make a server-side request to the external API
    const response = await fetch(
      `https://controls.tensorify.io/api/onboarding?tag=${tag}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch onboarding data: ${response.status}`);
    }

    const data = await response.json();

    // Return the data from our API route
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in onboarding API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}
