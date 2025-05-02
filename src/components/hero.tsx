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
  results: "Rapid experimentation and iteration cycles"
};

export function Hero() {
  const { openNewsletterSignup } = useNewsletterSignup();
  
  return (
    <section className="relative pt-32 pb-40 md:pt-40 md:pb-56 overflow-hidden bg-gradient-to-b from-background to-background/95 hero-gradient-bg">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--accent))]/5 via-[hsl(var(--primary))]/3 to-[hsl(var(--primary))]/5 z-0"></div>
      
      <div className="container max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none max-w-5xl">
            <span className="block text-gradient-primary font-extrabold">
              Design Your Model Pipeline
            </span>
            <span className="block text-foreground mt-4 font-bold">
              Not Your Code and Dependencies.
            </span>
          </h1>

          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-300 leading-7 tracking-wide">
            Tensorify is a node-based AI code generation platform that lets you
            create, connect, and reuse AI components visually. Build once, use
            anywhere—whether it&apos;s a novel attention mechanism or a
            specialized data preprocessing pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 min-[400px]:gap-6 mt-4">
            <Button
              size="lg"
              onClick={openNewsletterSignup}
              variant="default"
              className="group min-w-[200px] hero-button-gradient text-white hover:opacity-90 relative overflow-hidden border border-[color:var(--hero-primary)]/20"
              style={{
                boxShadow: "0 4px 14px 0 rgba(var(--hero-primary), 0.39), 0 2px 4px 0 rgba(var(--hero-primary), 0.15)",
              }}
            >
              Get Early Access
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              {/* Enhanced depth effect with inset shadow */}
              <span className="absolute inset-0 rounded-md bg-black/5"></span>
            </Button>
          </div>

          <div className="relative mt-24 w-full max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--accent))]/20 via-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/20 rounded-xl blur-3xl"></div>
            <div className="relative overflow-hidden rounded-xl backdrop-blur border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--accent))]/10 to-[hsl(var(--primary))]/10"></div>
              <div className="relative rounded-lg p-1">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[hsl(var(--accent))]/20 rounded-full filter blur-3xl"></div>
                <div className="absolute -bottom-14 -right-14 w-60 h-60 bg-[hsl(var(--primary))]/20 rounded-full filter blur-3xl"></div>

                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <Badge className="bg-gray-900/80 text-white backdrop-blur-md border-[color:var(--hero-primary)]/40 shadow-sm px-3 py-1.5">
                    <Zap className="mr-1.5 h-3.5 w-3.5 text-[color:var(--hero-primary)]" /> AI Workflow
                    Example
                  </Badge>
                  <Badge className="bg-gray-900/80 text-white backdrop-blur-md border-[color:var(--hero-tertiary)]/40 shadow-sm px-3 py-1.5">
                    <ArrowRight className="mr-1.5 h-3.5 w-3.5 text-[color:var(--hero-tertiary)]" /> Try
                    clicking on nodes!
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

          {/* Separator line for visual division with standardized spacing */}
          <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[color:var(--hero-primary)]/20 to-transparent my-12"></div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 w-full max-w-4xl">
            {/* Feature box 1 */}
            <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
              <div className="p-3.5 rounded-full bg-[color:var(--hero-primary)]/15 mb-1">
                <Clock className="h-6 w-6 text-[color:var(--hero-primary)]" />
              </div>
              <p className="text-2xl font-semibold text-gradient-primary leading-tight">
                80% Less Time
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {FEATURE_DESCRIPTIONS.time}
              </p>
            </div>
            
            {/* Feature box 2 */}
            <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
              <div className="p-3.5 rounded-full bg-[color:var(--hero-primary)]/15 mb-1">
                <Code className="h-6 w-6 text-[color:var(--hero-primary)]" />
              </div>
              <p className="text-2xl font-semibold text-gradient-primary leading-tight">
                Zero Boilerplate
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {FEATURE_DESCRIPTIONS.boilerplate}
              </p>
            </div>
            
            {/* Feature box 3 */}
            <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-[color:var(--hero-primary)]/15 hover:border-[color:var(--hero-primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[color:var(--hero-primary)]/10 h-full">
              <div className="p-3.5 rounded-full bg-[color:var(--hero-primary)]/15 mb-1">
                <Zap className="h-6 w-6 text-[color:var(--hero-primary)]" />
              </div>
              <p className="text-2xl font-semibold text-gradient-primary leading-tight">
                3x Faster Results
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {FEATURE_DESCRIPTIONS.results}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
