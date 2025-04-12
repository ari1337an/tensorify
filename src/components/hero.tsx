'use client';

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Clock, Code, Zap } from "lucide-react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
import { InteractiveFlow } from "./interactive-flow";

export function Hero() {
  const { openNewsletterSignup } = useNewsletterSignup();

  return (
    <section className="relative pt-32 md:pt-40 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
        <div className="absolute top-0 w-full h-[25rem] dark:[mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-violet-500/30 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-primary/30 dark:to-violet-500/30">
            <svg aria-hidden="true" className="absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/40 stroke-black/50 mix-blend-overlay dark:fill-white/2.5 dark:stroke-white/5">
              <defs>
                <pattern id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527" width="72" height="56" patternUnits="userSpaceOnUse" x="-12" y="4"><path d="M.5 56V.5H72" fill="none"></path></pattern>
              </defs>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"></rect>
            </svg>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline" className="animate-fade-up">
            For AI Professionals Who've Had Enough
          </Badge>
          
          <h1 className="animate-fade-up text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
              Debug Your Model Architecture
            </span>
            <span className="block text-foreground mt-2">
              Not Your Code and Dependencies.
            </span>
          </h1>
          
          <p className="animate-fade-up mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-400">
            Tensorify is a node-based AI code generation platform that lets you create, connect, and reuse AI components visually. Build once, use anywhere—whether it's a novel attention mechanism or a specialized data preprocessing pipeline.
          </p>

          <div className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 min-[400px]:gap-6">
            <Button 
              size="lg"
              onClick={openNewsletterSignup}
              className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 text-white shadow-lg group min-w-[200px]"
            >
              Get Early Access
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="animate-fade-up mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">80% Less Time</p>
              <p className="text-sm text-muted-foreground">From concept to deployment in minutes, not weeks</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10">
              <div className="p-3 rounded-full bg-primary/10">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">Zero Boilerplate</p>
              <p className="text-sm text-muted-foreground">Focus on architecture, not implementation</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10">
              <div className="p-3 rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">3x Faster Results</p>
              <p className="text-sm text-muted-foreground">Rapid experimentation and iteration</p>
            </div>
          </div>

          <div className="animate-fade-up relative mt-16 w-full max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/10 to-violet-500/20 rounded-xl blur-3xl"></div>
            <div className="relative overflow-hidden rounded-xl backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-primary/5"></div>
              <div className="relative rounded-lg p-1">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-500/10 rounded-full filter blur-3xl"></div>
                <div className="absolute -bottom-14 -right-14 w-60 h-60 bg-primary/10 rounded-full filter blur-3xl"></div>
                
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                  <Badge className="bg-gray-900/70 text-white backdrop-blur-md border-violet-600/30 shadow px-3 py-1">
                    <Zap className="mr-1 h-3 w-3 text-violet-400" /> AI Workflow Example
                  </Badge>
                  <Badge className="bg-gray-900/70 text-white backdrop-blur-md border-violet-600/30 shadow px-3 py-1 animate-pulse">
                    <ArrowRight className="mr-1 h-3 w-3 text-violet-400" /> Try clicking on nodes!
                  </Badge>
                </div>
                
                <InteractiveFlow />
                
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <Badge variant="outline" className="bg-gray-900/70 text-white backdrop-blur-md border-violet-600/30 shadow px-4 py-1.5">
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