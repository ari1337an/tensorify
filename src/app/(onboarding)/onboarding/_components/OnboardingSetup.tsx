"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/app/_components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  Settings,
  Database,
  Rocket,
} from "lucide-react";

type Props = {
  onNext: () => void;
};

const steps = [
  {
    text: "Creating your organization...",
    icon: Settings,
    color: "text-blue-500",
  },
  {
    text: "Setting up your workspace...",
    icon: Database,
    color: "text-purple-500",
  },
  {
    text: "Configuring default settings...",
    icon: Settings,
    color: "text-amber-500",
  },
  {
    text: "Almost there...",
    icon: Rocket,
    color: "text-green-500",
  },
];

export function OnboardingSetup({ onNext }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate setup process with progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    // Rotate through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1000);

    // Complete after 4 seconds
    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setProgress(100);
      onNext();
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(timer);
    };
  }, [onNext]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Please wait while we prepare everything for you
        </p>
      </div>

      <div className="space-y-4">
        <Progress value={progress} className="h-2" />

        <div className="h-24 relative">
          <AnimatePresence mode="wait">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <motion.div
                  key={step.text}
                  className={`absolute inset-0 flex items-center justify-center gap-3 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className={`h-6 w-6 ${step.color}`} />
                  ) : isActive ? (
                    <Loader2 className={`h-6 w-6 ${step.color} animate-spin`} />
                  ) : (
                    <Icon className={`h-6 w-6 ${step.color}`} />
                  )}
                  <p className={`text-center ${step.color}`}>{step.text}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
