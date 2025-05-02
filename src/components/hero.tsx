"use client";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Clock, Code, Zap } from "lucide-react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
import { InteractiveFlow } from "./interactive-flow";

// Standard feature description length to ensure visual balance
const FEATURE_DESCRIPTIONS = {
  time: "From concept to deployment in minutes, not weeks",
  boilerplate: "Focus on architecture, not implementation details",
  results: "Rapid experimentation and iteration cycles",
};

export function Hero() {
  const { openNewsletterSignup } = useNewsletterSignup();

  return (
    <section className="relative pt-32 pb-40 md:pt-40 md:pb-56 overflow-hidden bg-gradient-to-b from-background to-background/95 hero-gradient-bg">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--accent))]/5 via-[hsl(var(--primary))]/3 to-[hsl(var(--primary))]/5 z-0" />

      <div className="container max-w-7xl mx-auto relative z-10 px-4 md:px-6">
        {/* Main content with improved layout */}
        <div className="flex flex-col items-center gap-10">
          {/* Hero heading with full width */}
          <div className="w-full">
            <h1 className="text-center font-extrabold tracking-tight w-full">
              <div className="flex flex-wrap justify-center items-baseline text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3">
                <span className="text-gradient-primary">Accelerate Your AI </span>
                <span className="relative ml-2 inline-block">
                  {/* Glass background effect with extra padding */}
                  <span className="absolute inset-0 -left-2 -right-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-400/20 backdrop-blur-sm border border-purple-300/20 shadow-xl shadow-purple-500/10 transform -skew-x-3 z-0"></span>

                  {/* Inner text with purple gradient and more padding */}
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-500 px-6 py-1">
                    Experiments
                  </span>

                  {/* Subtle glow effect with extended reach */}
                  <span className="absolute -inset-2 bg-purple-400/5 rounded-xl filter blur-sm z-0"></span>
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-zinc-400 text-3xl md:text-4xl font-semibold w-2xl md:w-4xl">
                  Create, Connect, Re-use AI Components and Generate PyTorch Code
                </span>
              </div>
            </h1>
          </div>
          
          {/* CTA Button with modern styling */}
          <div className="mt-2">
            <Button
              size="lg"
              onClick={openNewsletterSignup}
              variant="default"
              className="group min-w-[220px] hero-button-gradient text-white hover:opacity-90 relative overflow-hidden border border-[color:var(--hero-primary)]/20 py-6 px-8 text-lg"
              style={{
                boxShadow: "0 4px 14px 0 rgba(var(--hero-primary), 0.39), 0 2px 4px 0 rgba(var(--hero-primary), 0.15)",
              }}
            >
              Get Early Access
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 rounded-md bg-black/5" />
            </Button>
          </div>
          
          {/* Clean description with solid metallic color and highlight */}
          <div className="w-full max-w-3xl mx-auto relative my-4">
            {/* Subtle top accent line */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-violet-400/30 to-purple-400/30 mx-auto mb-8"></div>

            <p className="text-center font-medium text-xl leading-relaxed mb-5 text-zinc-400">
              Tensorify is a node-based AI development platform that lets you visually create,
              connect, and reuse model components —
              like snapping together LEGO blocks.
            </p>

            <p className="text-center font-medium leading-relaxed text-zinc-500">
              Whether you&apos;re building attention mechanisms, embedding layers, or custom data pipelines,
              Tensorify helps AI researchers and engineers focus on innovative architecture rather than
              boilerplate code.
            </p>

            {/* Subtle bottom accent line */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-violet-400/30 to-purple-400/30 mx-auto mt-8"></div>
          </div>

          {/* Interactive Flow Section */}
          <div className="relative my-4 w-full max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--accent))]/20 via-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/20 rounded-xl blur-3xl" />
            <div className="relative overflow-hidden rounded-xl backdrop-blur border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--accent))]/10 to-[hsl(var(--primary))]/10" />
              <div className="relative rounded-lg p-1">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[hsl(var(--accent))]/20 rounded-full filter blur-3xl" />
                <div className="absolute -bottom-14 -right-14 w-60 h-60 bg-[hsl(var(--primary))]/20 rounded-full filter blur-3xl" />

                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <Badge className="bg-gray-900/80 text-white backdrop-blur-md border-[color:var(--hero-primary)]/40 shadow-sm px-3 py-1.5">
                    <Zap className="mr-1.5 h-3.5 w-3.5 text-[color:var(--hero-primary)]" />
                    AI Workflow Example
                  </Badge>
                  <Badge className="bg-gray-900/80 text-white backdrop-blur-md border-[color:var(--hero-tertiary)]/40 shadow-sm px-3 py-1.5">
                    <ArrowRight className="mr-1.5 h-3.5 w-3.5 text-[color:var(--hero-tertiary)]" />
                    Try clicking on nodes!
                  </Badge>
                </div>

                <InteractiveFlow />

                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Badge
                    variant="outline"
                    className="bg-gray-900/80 text-white backdrop-blur-md border-[color:var(--hero-primary)]/40 shadow-sm px-4 py-1.5"
                  >
                    Zoom, pan, and interact with the workflow editor
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature boxes in horizontal layout for desktop */}
          <div className="w-full max-w-5xl mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature box 1 */}
              <div className="flex flex-col items-center p-7 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
                <div className="p-4 rounded-full bg-[color:var(--hero-primary)]/15 mb-4">
                  <Clock className="h-7 w-7 text-[color:var(--hero-primary)]" />
                </div>
                <h2 className="text-2xl font-semibold text-gradient-primary leading-tight mb-2">
                  80% Less Time
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed text-center">
                  {FEATURE_DESCRIPTIONS.time}
                </p>
              </div>

              {/* Feature box 2 */}
              <div className="flex flex-col items-center p-7 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
                <div className="p-4 rounded-full bg-[color:var(--hero-primary)]/15 mb-4">
                  <Code className="h-7 w-7 text-[color:var(--hero-primary)]" />
                </div>
                <h2 className="text-2xl font-semibold text-gradient-primary leading-tight mb-2">
                  Zero Boilerplate
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed text-center">
                  {FEATURE_DESCRIPTIONS.boilerplate}
                </p>
              </div>

              {/* Feature box 3 */}
              <div className="flex flex-col items-center p-7 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
                <div className="p-4 rounded-full bg-[color:var(--hero-primary)]/15 mb-4">
                  <Zap className="h-7 w-7 text-[color:var(--hero-primary)]" />
                </div>
                <h2 className="text-2xl font-semibold text-gradient-primary leading-tight mb-2">
                  3x Faster Results
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed text-center">
                  {FEATURE_DESCRIPTIONS.results}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}