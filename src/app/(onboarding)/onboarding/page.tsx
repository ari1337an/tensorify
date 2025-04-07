"use client";

import { useState } from "react";
import { Card } from "@/app/_components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { OnboardingSource } from "./_components/OnboardingSource";
import { OnboardingOrg } from "./_components/OnboardingOrg";
import { OnboardingSetup } from "./_components/OnboardingSetup";

const steps = ["source", "organization", "setup"] as const;
type Step = (typeof steps)[number];

const stepTitles = {
  source: "How did you hear about us?",
  organization: "Setup your Organization",
  setup: "Setting up your workspace...",
} as const;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>("source");
  const router = useRouter();

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
      </div>

      <Card className="w-full max-w-2xl p-8 shadow-lg border-primary/10 backdrop-blur-sm relative z-10">
        <div className="flex justify-between items-center">
          <motion.h1
            key={currentStep}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            {stepTitles[currentStep]}
          </motion.h1>
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  steps.indexOf(currentStep) >= index
                    ? "bg-primary scale-110"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {currentStep === "source" && (
              <OnboardingSource onNext={handleNext} />
            )}
            {currentStep === "organization" && (
              <OnboardingOrg onNext={handleNext} />
            )}
            {currentStep === "setup" && <OnboardingSetup onNext={handleNext} />}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
