"use client";

import { Button } from "@/app/_components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Beaker, FlaskConical, Users, Building } from "lucide-react";

const usageOptions = [
  {
    htmlId: "d6019c6f-4040-462d-bc00-e2aa28004126",
    id: "WILL_NOT_PAY",
    label: "Just exploring what's possible with AI pipelines.",
    icon: Compass,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    htmlId: "1296b227-6050-4054-a437-fb62fe111dcb",
    id: "WILL_NOT_PAY",
    label: "Testing it for a personal or academic project.",
    icon: Beaker,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    htmlId: "5545f2c1-e194-4511-9c5d-2e98aab670c9",
    id: "WILL_PAY_HOBBY",
    label: "Running individual experiments or publishing research using it.",
    icon: FlaskConical,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    htmlId: "4a461294-d21f-4238-a8d7-3500f0fe2a8c",
    id: "WILL_PAY_TEAM",
    label: "Using it in a team or research lab project.",
    icon: Users,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    htmlId: "f1e53f00-4064-443f-adf6-7518c2c89dc1",
    id: "ENTERPRISE_POTENTIAL",
    label:
      "Evaluating it for integration into our company's AI or R&D infrastructure.",
    icon: Building,
    gradient: "from-violet-500 to-indigo-500",
  },
] as const;

type Props = {
  onUsageSelected: (usageId: string) => void;
  onNext: () => void;
};

export function OnboardingUsage({ onUsageSelected, onNext }: Props) {
  const [selectedUsage, setSelectedUsage] = useState<string>("");
  const [hoveredUsage, setHoveredUsage] = useState<string | null>(null);

  const isValid = selectedUsage !== "";

  const handleUsageSelect = (usageId: string) => {
    // Only update if the selection has changed
    if (selectedUsage !== usageId) {
      setSelectedUsage(usageId);
      onUsageSelected(usageOptions.find((option) => option.htmlId === usageId)?.id || "");
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Select the option that best describes your intended use
        </p>
      </div> */}

      <div className="grid grid-cols-1 gap-2.5">
        {usageOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedUsage === option.htmlId;
          const isHovered = hoveredUsage === option.htmlId;

          return (
            <motion.button
              key={option.htmlId}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredUsage(option.htmlId)}
              onHoverEnd={() => setHoveredUsage(null)}
              onClick={() => handleUsageSelect(option.htmlId)}
              className={`relative flex items-center p-2.5 rounded-lg border outline-none transition-all duration-300 ${
                isSelected
                  ? "border-primary shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  option.gradient
                } opacity-0 transition-opacity duration-300 ${
                  isSelected || isHovered ? "opacity-[0.03]" : ""
                }`}
              />

              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    isSelected
                      ? `bg-gradient-to-r ${option.gradient} text-white shadow-sm`
                      : "bg-muted text-muted-foreground"
                  }`}
                  animate={{
                    rotate: isHovered ? [0, -5, 5, -5, 0] : 0,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                <span className="font-medium text-sm text-left">
                  {option.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        className="pt-2"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={onNext}
          disabled={!isValid}
          className={`w-full h-9 text-sm font-medium transition-all duration-300 ${
            isValid
              ? "bg-gradient-to-r from-primary to-primary/80 hover:shadow-md hover:shadow-primary/10"
              : ""
          }`}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
