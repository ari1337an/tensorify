"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useClientFingerprint } from "@/app/_utils/clientFingerprint";
import { onboardingSetup } from "@/app/api/v1/_client/client";
import { OnboardingSetupRequest } from "@/app/api/v1/_contracts/schema";

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
  orgName: string;
  orgUrl: string;
};

export function OnboardingSetup({
  onNext,
  usageSelection,
  orgSize,
  apiAnswers,
  orgName,
  orgUrl,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "submitting_data" | "setting_up_account" | "completed"
  >("submitting_data");
  const { fingerprint, isLoading: isFingerprintLoading } =
    useClientFingerprint();

  // Create a function for the submission process so it can be called again on retry
  const processOnboarding = useCallback(async () => {
    try {
      setCurrentStep("submitting_data");
      setError(null);

      const body = {
        orgUrl,
        orgName,
        answers: apiAnswers,
        usageSelection,
        orgSize,
        clientFingerprint: fingerprint,
      };

      const parsedBody = OnboardingSetupRequest.safeParse(body);

      if (!parsedBody.success) {
        setError(parsedBody.error.message);
        return;
      }

      // Setup account with onboarding data
      const response = await onboardingSetup({
        body: parsedBody.data,
      });

      if (response.status !== 201) {
        setError(
          response.status === 400 ||
            response.status === 500 ||
            response.status === 401
            ? response.body.message
            : "Failed to setup account"
        );
        return;
      }

      setCurrentStep("setting_up_account");

      setCurrentStep("completed");

      // Complete onboarding after a short delay
      setTimeout(() => {
        onNext();
      }, 1000);
    } catch (error) {
      console.error("Error in onboarding process:", error);
      setError("An unexpected error occurred");
    }
  }, [
    apiAnswers,
    fingerprint,
    onNext,
    orgName,
    orgSize,
    usageSelection,
    orgUrl,
  ]);

  // Handle the onboarding process
  useEffect(() => {
    // Don't start submission until we have fingerprint
    if (isFingerprintLoading) return;

    let isMounted = true;
    const timeout: NodeJS.Timeout | null = null;

    // Start the onboarding process after a brief delay
    // to ensure the component is fully mounted
    const startTimeout = setTimeout(() => {
      if (isMounted) {
        processOnboarding();
      }
    }, 500);

    return () => {
      isMounted = false;
      if (timeout) clearTimeout(timeout);
      clearTimeout(startTimeout);
    };
  }, [fingerprint, isFingerprintLoading, processOnboarding]);

  const getStatusMessage = () => {
    if (isFingerprintLoading) return "Generating device signature...";
    if (currentStep === "submitting_data")
      return "Processing your preferences...";
    if (currentStep === "setting_up_account")
      return "Setting up your account...";
    return "All done! Preparing your workspace...";
  };

  const handleRetry = () => {
    console.log("Retrying onboarding...");
    processOnboarding();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-4">
      {error ? (
        <div className="text-red-500 text-center space-y-4">
          <p className="font-medium pb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6">
          <Loader2 className="h-12 w-12 text-primary-readable animate-spin" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-medium text-center text-muted-foreground"
          >
            {getStatusMessage()}
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
