"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Share2, Users, BookOpen, HelpCircle } from "lucide-react";

// Icon mapping based on iconSlug
const iconMap: Record<string, React.ElementType> = {
  search: Search,
  "share-2": Share2,
  users: Users,
  "book-open": BookOpen,
  "help-circle": HelpCircle,
};

// Define types for the API data
interface OnboardingOption {
  id: string;
  questionId: string;
  value: string;
  label: string;
  iconSlug: string | null;
  sortOrder: number;
}

interface OnboardingQuestion {
  id: string;
  versionId: string;
  slug: string;
  type: "single_choice" | "multi_choice";
  title: string;
  iconSlug: string | null;
  isActive: boolean;
  sortOrder: number;
  allowOtherOption: boolean;
  options: OnboardingOption[];
}

// Record answers for API questions
interface SingleChoiceAnswer {
  questionId: string;
  customValue?: string;
}

interface MultiChoiceAnswer {
  questionId: string;
  selectedOptionIds: string[];
}

type OnboardingAnswer = SingleChoiceAnswer | MultiChoiceAnswer;

// Gradient colors for options
const gradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-indigo-500",
];

interface OnboardingApiQuestionProps {
  question: OnboardingQuestion;
  onAnswer: (answer: OnboardingAnswer) => void;
}

export function OnboardingApiQuestion({
  question,
  onAnswer,
}: OnboardingApiQuestionProps) {
  const [singleSelectedOption, setSingleSelectedOption] = useState<
    string | null
  >(null);
  const [multiSelectedOptions, setMultiSelectedOptions] = useState<Set<string>>(
    new Set()
  );
  const [customValue, setCustomValue] = useState("");
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleSingleOptionSelect = (optionId: string) => {
    setSingleSelectedOption(optionId);

    // Reset custom value if the new selection is not "other"
    const isOtherOption =
      question.options.find((opt) => opt.id === optionId)?.value === "other";
    if (!isOtherOption) {
      setCustomValue("");
    }
  };

  const handleMultiOptionToggle = (optionId: string) => {
    const newSelected = new Set(multiSelectedOptions);

    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);

      // If removing the "other" option, clear the custom value
      const isOtherOption =
        question.options.find((opt) => opt.id === optionId)?.value === "other";
      if (isOtherOption) {
        setCustomValue("");
      }
    } else {
      newSelected.add(optionId);
    }

    setMultiSelectedOptions(newSelected);
  };

  const handleSubmit = () => {
    if (question.type === "single_choice") {
      // For the "other" option with custom value
      const selectedOption = question.options.find(
        (opt) => opt.id === singleSelectedOption
      );
      if (selectedOption?.value === "other" && customValue) {
        onAnswer({
          questionId: question.id,
          customValue: customValue,
        });
      } else {
        onAnswer({
          questionId: question.id,
          selectedOptionIds: [singleSelectedOption!], // Pass the selected option ID for single choice
        });
      }
    } else if (question.type === "multi_choice") {
      const hasOtherSelected = Array.from(multiSelectedOptions).some(
        (id) => question.options.find((opt) => opt.id === id)?.value === "other"
      );

      if (hasOtherSelected && customValue) {
        // If "other" is selected and has a custom value
        // const otherOptionId = question.options.find(
        //   (opt) => opt.value === "other"
        // )?.id;
        const regularOptions = Array.from(multiSelectedOptions).filter(
          (id) =>
            question.options.find((opt) => opt.id === id)?.value !== "other"
        );

        onAnswer({
          questionId: question.id,
          selectedOptionIds: regularOptions,
          customValue: customValue,
        });
      } else {
        // Regular multi-select case
        onAnswer({
          questionId: question.id,
          selectedOptionIds: Array.from(multiSelectedOptions),
        });
      }
    }
  };

  const isValid = () => {
    if (question.type === "single_choice") {
      const selectedOption = question.options.find(
        (opt) => opt.id === singleSelectedOption
      );
      return (
        singleSelectedOption &&
        (selectedOption?.value !== "other" || customValue.trim().length > 0)
      );
    } else {
      // For multi_choice, at least one option must be selected
      // If "other" is selected, make sure custom value is provided
      const hasOtherSelected = Array.from(multiSelectedOptions).some(
        (id) => question.options.find((opt) => opt.id === id)?.value === "other"
      );

      return (
        multiSelectedOptions.size > 0 &&
        (!hasOtherSelected || customValue.trim().length > 0)
      );
    }
  };

  const renderSingleChoiceOptions = () => {
    return (
      <div className="grid grid-cols-1 gap-2.5">
        {question.options.map((option, index) => {
          const IconComponent = option.iconSlug
            ? iconMap[option.iconSlug]
            : HelpCircle;
          const isSelected = singleSelectedOption === option.id;
          const isHovered = hoveredOption === option.id;
          const gradient = gradients[index % gradients.length];

          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredOption(option.id)}
              onHoverEnd={() => setHoveredOption(null)}
              onClick={() => handleSingleOptionSelect(option.id)}
              className={`relative flex items-center p-2.5 rounded-lg border outline-none transition-all duration-300 ${
                isSelected
                  ? "border-primary shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 transition-opacity duration-300 ${
                  isSelected || isHovered ? "opacity-[0.03]" : ""
                }`}
              />

              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    isSelected
                      ? `bg-gradient-to-r ${gradient} text-white shadow-sm`
                      : "bg-muted text-muted-foreground"
                  }`}
                  animate={{
                    rotate: isHovered ? [0, -5, 5, -5, 0] : 0,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                </motion.div>
                <span className="font-medium text-sm text-left">
                  {option.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderMultiChoiceOptions = () => {
    return (
      <div className="space-y-4">
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            <Checkbox
              id={option.id}
              checked={multiSelectedOptions.has(option.id)}
              onCheckedChange={() => handleMultiOptionToggle(option.id)}
            />
            <Label
              htmlFor={option.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {question.type === "single_choice"
        ? renderSingleChoiceOptions()
        : renderMultiChoiceOptions()}

      <AnimatePresence>
        {((question.type === "single_choice" &&
          singleSelectedOption &&
          question.options.find((opt) => opt.id === singleSelectedOption)
            ?.value === "other") ||
          (question.type === "multi_choice" &&
            Array.from(multiSelectedOptions).some(
              (id) =>
                question.options.find((opt) => opt.id === id)?.value === "other"
            ))) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">
              <Label
                htmlFor="customValue"
                className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Please specify your answer
              </Label>
              <motion.div
                initial={false}
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  id="customValue"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value.slice(0, 100))}
                  placeholder="Enter your answer..."
                  maxLength={100}
                  className="h-9 text-sm transition-shadow duration-300 focus:shadow-md focus:shadow-primary/10"
                />
              </motion.div>
              <div className="flex justify-end">
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    customValue.length >= 90
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {customValue.length}/100
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="pt-2"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleSubmit}
          disabled={!isValid()}
          className={`w-full h-9 text-sm font-medium transition-all duration-300 ${
            isValid()
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
