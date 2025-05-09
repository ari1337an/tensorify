"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { submitOnboardingData } from "@/server/actions/onboarding-actions";
import { useClientFingerprint } from "@/app/_utils/clientFingerprint";
import useStore from "@/app/_store/store";

type OnboardingAnswer = {
  questionId: string;
  customValue?: string;
  selectedOptionIds?: string[];
};

type Props = {
  onNext: () => void;
  usageSelection: string;
  orgSize: string;
  apiAnswers: OnboardingAnswer[];
};

export function OnboardingSetup({
  onNext,
  usageSelection,
  orgSize,
  apiAnswers,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const { fingerprint, isLoading: isFingerprintLoading } =
    useClientFingerprint();
  const { currentUser } = useStore();

  // Handle the onboarding process
  useEffect(() => {
    // Don't start submission until we have fingerprint
    if (isFingerprintLoading) return;

    let isMounted = true;
    let timeout: NodeJS.Timeout | null = null;

    const processOnboarding = async () => {
      try {
        // Get user id and email from store
        const userId = currentUser?.id || "";
        const email = currentUser?.emailAddresses?.[0]?.emailAddress || "";

        // Submit data using server action
        const result = await submitOnboardingData({
          userId,
          email,
          answers: apiAnswers,
          usageSelection,
          orgSize,
          clientFingerprint: fingerprint,
        });

        if (!result.success) {
          if (isMounted) {
            setError(result.error || "Failed to submit onboarding data");
          }
          return;
        }

        // Simulate completion delay to avoid flashing
        timeout = setTimeout(() => {
          if (isMounted) {
            onNext();
          }
        }, 1500);
      } catch (error) {
        console.error("Error in onboarding process:", error);
        if (isMounted) {
          setError("An unexpected error occurred");
        }
      }
    };

    // Start the onboarding process after a brief delay
    // to ensure the component is fully mounted
    const startTimeout = setTimeout(() => {
      processOnboarding();
    }, 500);

    return () => {
      isMounted = false;
      if (timeout) clearTimeout(timeout);
      clearTimeout(startTimeout);
    };
  }, [
    onNext,
    apiAnswers,
    usageSelection,
    orgSize,
    fingerprint,
    isFingerprintLoading,
    currentUser,
  ]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-4">
      {error ? (
        <div className="text-red-500 text-center space-y-4">
          <p>Something went wrong:</p>
          <p className="font-medium">{error}</p>
          <button
            onClick={() => {
              setError(null);
              location.reload();
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-medium text-center text-muted-foreground"
          >
            {isFingerprintLoading
              ? "Generating device signature..."
              : "Setting up your account..."}
          </motion.p>
          <p className="text-sm text-center text-muted-foreground/80 max-w-xs">
            We&apos;re configuring everything for you. This will only take a
            moment.
          </p>
        </div>
      )}
    </div>
  );
}
