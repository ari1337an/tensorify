"use client";

import { Label } from "@/app/_components/ui/label";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Share2, Users, BookOpen, HelpCircle } from "lucide-react";

const sources = [
  {
    id: "search",
    label: "Search Engine (Google, Bing, etc.)",
    icon: Search,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "social",
    label: "Social Media",
    icon: Share2,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "friend",
    label: "Friend or Colleague",
    icon: Users,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "blog",
    label: "Blog or Article",
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "other",
    label: "Other",
    icon: HelpCircle,
    gradient: "from-violet-500 to-indigo-500",
  },
] as const;

type Props = {
  onNext: () => void;
};

export function OnboardingSource({ onNext }: Props) {
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [otherSource, setOtherSource] = useState("");
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  const isValid =
    selectedSource && (selectedSource !== "other" || otherSource.length > 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          We&apos;d love to know how you discovered Tensorify
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {sources.map((source) => {
          const Icon = source.icon;
          const isSelected = selectedSource === source.id;
          const isHovered = hoveredSource === source.id;

          return (
            <motion.button
              key={source.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredSource(source.id)}
              onHoverEnd={() => setHoveredSource(null)}
              onClick={() => setSelectedSource(source.id)}
              className={`relative flex items-center p-2.5 rounded-lg border outline-none transition-all duration-300 ${
                isSelected
                  ? "border-primary shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  source.gradient
                } opacity-0 transition-opacity duration-300 ${
                  isSelected || isHovered ? "opacity-[0.03]" : ""
                }`}
              />

              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    isSelected
                      ? `bg-gradient-to-r ${source.gradient} text-white shadow-sm`
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
                  {source.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedSource === "other" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">
              <Label
                htmlFor="otherSource"
                className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Please specify where you heard about us
              </Label>
              <motion.div
                initial={false}
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  id="otherSource"
                  value={otherSource}
                  onChange={(e) => setOtherSource(e.target.value.slice(0, 100))}
                  placeholder="Enter your answer..."
                  maxLength={100}
                  className="h-9 text-sm transition-shadow duration-300 focus:shadow-md focus:shadow-primary/10"
                />
              </motion.div>
              <div className="flex justify-end">
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    otherSource.length >= 90
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {otherSource.length}/100
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
