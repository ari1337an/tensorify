'use client';

import { Puzzle, Library, Share2 } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

const FEATURE_DESCRIPTIONS = {
  modular: "Build AI pipelines like LEGO® masterpieces—rapidly experiment with datasets, models, parameters and every aspect of your AI pipeline through visual workflows instead of endless code changes.",
  ecosystem: "Access our expanding library of low-code, pre-built AI components at plugins.tensorify.io—from data processors to custom neural networks—each ready to be dropped into your workflow with minimal programming required.",
  community: "Share your low-code innovations selectively—keep proprietary components within your organization or contribute to the community marketplace where others can build upon your breakthroughs without writing complex code."
};

export function Features() {
  return (
    <SectionWrapper
      id="features"
      className="pt-16 md:pt-24 pb-24 md:pb-32"
      containerClassName="flex flex-col items-center"
    >
      <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 text-center mb-16 md:mb-24 px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
          Build With{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto]">
            Powerful Features
          </span>
        </h2>
        <p className="max-w-4xl text-base md:text-lg lg:text-xl text-muted-foreground">
          Accelerate your AI development with our intuitive, modular platform
        </p>
      </div>

      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature box 1 - Modular */}
          <div className="flex flex-col items-center p-7 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
            <div className="p-4 rounded-full bg-[color:var(--hero-primary)]/15 mb-4">
              <Puzzle className="h-7 w-7 text-[color:var(--hero-primary)]" />
            </div>
            <h3 className="text-2xl font-semibold text-gradient-primary leading-tight mb-2 text-center">
              Visual Workflows
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed text-center">
              {FEATURE_DESCRIPTIONS.modular}
            </p>
          </div>

          {/* Feature box 2 - Ecosystem */}
          <div className="flex flex-col items-center p-7 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
            <div className="p-4 rounded-full bg-[color:var(--hero-primary)]/15 mb-4">
              <Library className="h-7 w-7 text-[color:var(--hero-primary)]" />
            </div>
            <h3 className="text-2xl font-semibold text-gradient-primary leading-tight mb-2 text-center">
              Low-Code Components
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed text-center">
              {FEATURE_DESCRIPTIONS.ecosystem}
            </p>
          </div>

          {/* Feature box 3 - Community */}
          <div className="flex flex-col items-center p-7 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
            <div className="p-4 rounded-full bg-[color:var(--hero-primary)]/15 mb-4">
              <Share2 className="h-7 w-7 text-[color:var(--hero-primary)]" />
            </div>
            <h3 className="text-2xl font-semibold text-gradient-primary leading-tight mb-2 text-center">
              Community Marketplace
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed text-center">
              {FEATURE_DESCRIPTIONS.community}
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}