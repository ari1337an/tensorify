"use client";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight } from "lucide-react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
import { InteractiveFlow } from "./interactive-flow";

export function Hero() {
  const { openNewsletterSignup } = useNewsletterSignup();

  return (
    <section className="relative pt-32 pb-32 md:pt-40 md:pb-46 overflow-hidden bg-gradient-to-b from-background to-background/95 hero-gradient-bg">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--accent))]/5 via-[hsl(var(--primary))]/3 to-[hsl(var(--primary))]/5 z-0" />

      <div className="container max-w-7xl mx-auto relative z-10 px-4 md:px-6">
        {/* Main content with improved layout */}
        <div className="flex flex-col items-center gap-10">
          {/* Hero heading with full width */}
          <div className="w-full">
            <h1 className="text-center font-extrabold tracking-tight w-full">
              <div className="flex flex-wrap justify-center items-baseline text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3">
                <span className="text-gradient-primary">Accelerate Your AI Experiments</span>

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
          <div className="w-full max-w-4xl mx-auto relative my-4">
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
          <div className="relative my-4 w-full max-w-6xl mt-8 xl:px-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--accent))]/20 via-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/20 rounded-xl blur-3xl" />
            <div className="relative overflow-hidden rounded-xl backdrop-blur border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--accent))]/10 to-[hsl(var(--primary))]/10" />
              <div className="relative rounded-lg p-1">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[hsl(var(--accent))]/20 rounded-full filter blur-3xl" />
                <div className="absolute -bottom-14 -right-14 w-60 h-60 bg-[hsl(var(--primary))]/20 rounded-full filter blur-3xl" />

                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <Badge className="bg-gray-900/80 text-white backdrop-blur-md border-[color:var(--hero-primary)]/40 shadow-sm px-3 py-1.5">
                    <ArrowRight className="mr-1.5 h-3.5 w-3.5 text-[color:var(--hero-tertiary)]" />
                    Demo Workflow
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


        </div>
      </div>
    </section>
  );
}