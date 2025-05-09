"use server";

type OnboardingAnswer = {
  questionId: string;
  customValue?: string;
  selectedOptionIds?: string[];
};

interface OnboardingSubmitParams {
  answers: OnboardingAnswer[];
  usageSelection: string;
  orgSize: string;
  userId: string;
  email: string;
  clientFingerprint?: string;
}

/**
 * Server action to submit onboarding responses to the external API
 */
export async function submitOnboardingData({
  answers,
  usageSelection,
  orgSize,
  userId,
  email,
  clientFingerprint,
}: OnboardingSubmitParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the onboarding tag from environment variables
    const onboardingTag =
      process.env.NEXT_PUBLIC_ONBOARDING_TAG ||
      "apptensorifyio-onboarding-beta-v01";

    // Map the usage selection to intent tag
    const intentTag = mapUsageToIntentTag(usageSelection);

    // Map org size to API format
    const orgSizeBracket = mapOrgSizeToApiFormat(orgSize);

    // Prepare the payload
    const payload = {
      tag: onboardingTag,
      userId,
      email,
      clientFingerprint,
      intentTag,
      orgSizeBracket,
      answers,
    };

    // Make the API call
    const response = await fetch(
      "https://controls.tensorify.io/api/onboarding/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting onboarding responses:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Maps the usage selection to the corresponding intentTag value
 */
function mapUsageToIntentTag(usageId: string): string {
  const mapping: Record<string, string> = {
    exploring: "CURIOUS",
    personal: "WILL_NOT_PAY",
    individual: "WILL_PAY_HOBBY",
    team: "WILL_PAY_TEAM",
    company: "ENTERPRISE_POTENTIAL",
  };

  return mapping[usageId] || "CURIOUS"; // Default to CURIOUS if no match
}

/**
 * Maps the organization size to the expected API format
 */
function mapOrgSizeToApiFormat(sizeId: string): string {
  const mapping: Record<string, string> = {
    xs: "<20",
    sm: "20-99",
    md: "100-499",
    lg: "500-999",
    xl: "1000+",
  };

  return mapping[sizeId] || "<20";
}
