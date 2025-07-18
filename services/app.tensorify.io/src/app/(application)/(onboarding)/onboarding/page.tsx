"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/app/_components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { OnboardingUsage } from "./_components/OnboardingUsage";
import { OnboardingOrg } from "./_components/OnboardingOrg";
import { OnboardingSetup } from "./_components/OnboardingSetup";
import { OnboardingApiQuestion } from "./_components/OnboardingApiQuestion";
import { onboardingQuestions } from "@/app/api/v1/_client/client";
import {
  OnboardingQuestion as OnboardingQuestionSchema,
  OnboardingAnswer as OnboardingAnswerSchema,
} from "@/app/api/v1/_contracts/schema";
import { z } from "zod";

type OnboardingQuestion = z.infer<typeof OnboardingQuestionSchema>;
type OnboardingAnswer = z.infer<typeof OnboardingAnswerSchema>;

// Define organizational data
interface OrgData {
  orgName: string;
  orgSlug: string;
  orgSize: string;
  orgUrl: string;
}

// Define all step types
const existingSteps = ["usage", "organization", "setup"] as const;
type ExistingStep = (typeof existingSteps)[number];
type ApiStep = { type: "api"; questionIndex: number };
type Step = ExistingStep | ApiStep;

// Titles for existing steps
const stepTitles = {
  usage: "How you plan to use Tensorify?",
  organization: "Setup your Organization",
  setup: "Setting up your workspace...",
} as const;

// Helper function to determine if a step is an API step
const isApiStep = (step: Step): step is ApiStep =>
  typeof step === "object" && step.type === "api";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apiQuestions, setApiQuestions] = useState<OnboardingQuestion[]>([]);
  const [apiAnswers, setApiAnswers] = useState<OnboardingAnswer[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [usageSelection, setUsageSelection] = useState("");
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const currentStep = steps[currentStepIndex];

  // Fetch API questions
  useEffect(() => {
    const fetchOnboardingQuestions = async () => {
      try {
        const response = await onboardingQuestions({});

        if (response.status === 200) {
          const data = response.body;
          setApiQuestions(data.questions);
        } else {
          throw new Error(response.body.message);
        }

        const data = response.body;

        // Generate steps based on API questions + existing steps
        const apiSteps: ApiStep[] = data.questions.map((_, index) => ({
          type: "api",
          questionIndex: index,
        }));

        setSteps([...apiSteps, ...existingSteps]);
      } catch (error) {
        console.error("Error fetching onboarding questions:", error);
        // Fallback to existing steps if API fails
        setSteps([...existingSteps]);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingQuestions();
  }, []);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // All steps completed
      router.push("/");
    }
  }, [currentStepIndex, steps.length, router]);

  const handleApiQuestionAnswer = useCallback(
    (answer: OnboardingAnswer) => {
      // Update answers array
      setApiAnswers((prev) => {
        const newAnswers = [...prev];
        const existingAnswerIndex = newAnswers.findIndex(
          (a) => a.questionId === answer.questionId
        );

        if (existingAnswerIndex >= 0) {
          newAnswers[existingAnswerIndex] = answer;
        } else {
          newAnswers.push(answer);
        }

        return newAnswers;
      });

      handleNext();
    },
    [handleNext]
  );

  const handleUsageSelection = useCallback((usageId: string) => {
    setUsageSelection(usageId);
  }, []);

  const handleOrgDataChange = useCallback((data: OrgData) => {
    setOrgData(data);
  }, []);

  // Get the title for the current step
  const getCurrentStepTitle = () => {
    if (isApiStep(currentStep)) {
      const question = apiQuestions[currentStep.questionIndex];
      return question?.title || "Loading...";
    }
    return stepTitles[currentStep];
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

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
            key={`step-${currentStepIndex}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            {getCurrentStepTitle()}
          </motion.h1>
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStepIndex >= index
                    ? "bg-primary scale-110"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`step-content-${currentStepIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isApiStep(currentStep) && (
              <OnboardingApiQuestion
                question={apiQuestions[currentStep.questionIndex]}
                onAnswer={handleApiQuestionAnswer}
              />
            )}
            {currentStep === "usage" && (
              <OnboardingUsage
                onUsageSelected={handleUsageSelection}
                onNext={handleNext}
              />
            )}
            {currentStep === "organization" && (
              <OnboardingOrg
                onOrgDataChange={handleOrgDataChange}
                onNext={handleNext}
              />
            )}
            {currentStep === "setup" && (
              <OnboardingSetup
                usageSelection={usageSelection}
                orgSize={orgData?.orgSize || "xs"}
                apiAnswers={apiAnswers.map((answer) => ({
                  ...answer,
                  customValue: answer.customValue ?? undefined,
                }))}
                orgName={orgData?.orgName || ""}
                onNext={handleNext}
                orgUrl={orgData?.orgUrl || ""}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
