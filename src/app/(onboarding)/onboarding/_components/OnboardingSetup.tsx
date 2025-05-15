"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { submitOnboardingData } from "@/server/actions/onboarding-actions";
import { useClientFingerprint } from "@/app/_utils/clientFingerprint";
import useStore from "@/app/_store/store";
import { setupInitialTensorifyAccountWithDefaults } from "@/server/flows/onboarding/setup-account";

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
  const { currentUser } = useStore();

  // Create a function for the submission process so it can be called again on retry
  const processOnboarding = useCallback(async () => {
    try {
      // Get user id and email from store
      const userId = currentUser?.id || "";
      const email = currentUser?.email || "";
      const firstName =
        currentUser?.firstName || orgName.split(" ")[0] || "User";
      const lastName = currentUser?.lastName || "";
      const imageUrl = currentUser?.imageUrl || "";

      setCurrentStep("submitting_data");
      setError(null);

      // Step 1: Submit onboarding data
      const result = await submitOnboardingData({
        userId,
        email,
        answers: apiAnswers,
        usageSelection,
        orgSize,
        clientFingerprint: fingerprint,
      });

      if (!result.success) {
        setError(result.error || "Failed to submit onboarding data");
        return;
      }

      setCurrentStep("setting_up_account");

      // Step 2: Setup account with Tensorify defaults
      const accountSetupResult = await setupInitialTensorifyAccountWithDefaults(
        userId,
        email,
        imageUrl,
        firstName,
        lastName,
        orgUrl,
        orgName
      );

      if (!accountSetupResult.success) {
        setError(accountSetupResult.error || "Failed to setup account");
        return;
      }

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
    currentUser,
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
    processOnboarding();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-4">
      {error ? (
        <div className="text-red-500 text-center space-y-4">
          <p>Something went wrong:</p>
          <p className="font-medium">{error}</p>
          <button
            onClick={handleRetry}
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
