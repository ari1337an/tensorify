"use client";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Clock, Code, Zap } from "lucide-react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
import { InteractiveFlow } from "./interactive-flow";
// import { useRef, useEffect, useState } from "react";

export function Hero() {
  const { openNewsletterSignup } = useNewsletterSignup();
  // const gradientRef = useRef<HTMLDivElement>(null);
  // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // // Effect for dynamic gradient animation
  // useEffect(() => {
  //   if (!gradientRef.current) return;

  //   const handleMouseMove = (e: MouseEvent) => {
  //     if (!gradientRef.current) return;

  //     const { clientX, clientY } = e;
  //     const x = Math.round((clientX / window.innerWidth) * 100);
  //     const y = Math.round((clientY / window.innerHeight) * 100);

  //     gradientRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(30,30,50,0.15), rgba(24,24,45,0.1), rgba(20,20,40,0.05))`;

  //     // Update mouse position for parallax effect
  //     setMousePosition({
  //       x: (clientX / window.innerWidth) * 2 - 1,
  //       y: (clientY / window.innerHeight) * 2 - 1
  //     });
  //   };

  //   window.addEventListener('mousemove', handleMouseMove);
  //   return () => window.removeEventListener('mousemove', handleMouseMove);
  // }, []);

  // const relX = mousePosition.x;
  // const relY = mousePosition.y;

  return (
    <section className="relative pt-32 pb-48 md:pt-40 md:pb-60 overflow-hidden">
      {/* Dynamic background gradient overlay
      <div 
        ref={gradientRef}
        className="absolute inset-0 -z-10 bg-background"
      ></div>
      
      {/* Enhanced background elements */}
      {/* <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-background"
          style={{
            opacity: 0.4,
            transform: `translate(${relX * 20}px, ${relY * 20}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        />
        <div
          className="absolute inset-0 bg-background"
          style={{
            opacity: 0.35,
            transform: `translate(${-relX * 25}px, ${-relY * 25}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        /> */}
      {/* Orbital gradient - keep static */}
      {/* <div className="absolute w-full h-full overflow-hidden">
          <div className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] rounded-full bg-gradient-to-t from-[#1E1E30]/5 to-[#1E1E3D]/10 blur-3xl"></div>
        </div> */}
      {/* Static particles instead of floating */}
      {/* <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#2A1E3D]/30 blur-md"
              style={{
                width: `${Math.random() * 2 + 0.5}rem`,
                height: `${Math.random() * 2 + 0.5}rem`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
      </div> */}

      {/* Decorative elements
      <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
        <div className="absolute top-0 w-full h-[25rem] dark:[mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1E3D]/20 to-[#27274D]/20 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-[#2A1E3D]/20 dark:to-[#27274D]/20">
            <svg aria-hidden="true" className="absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/20 stroke-black/20 mix-blend-overlay dark:fill-white/[0.05] dark:stroke-white/[0.05]">
              <defs>
                <pattern id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527" width="72" height="56" patternUnits="userSpaceOnUse" x="-12" y="4"><path d="M.5 56V.5H72" fill="none"></path></pattern>
              </defs>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"></rect>
            </svg>
          </div>
        </div>
      </div> */}

      {/* Static aurora effects instead of animated */}
      {/* <div className="absolute top-20 left-[10%] w-[30rem] h-[30rem] rounded-full bg-[#2A1E3D]/8 mix-blend-multiply blur-[128px]"></div>
      <div className="absolute top-40 right-[10%] w-[35rem] h-[35rem] rounded-full bg-[#1E2A3D]/8 mix-blend-multiply blur-[128px]"></div>
      <div className="absolute bottom-20 left-[30%] w-[40rem] h-[40rem] rounded-full bg-[#1E1E30]/8 mix-blend-multiply blur-[128px]"></div> */}

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#A371D3] to-[#5E48BF]">
              Design Your Model Pipeline
            </span>
            <span className="block text-foreground mt-2">
              Not Your Code and Dependencies.
            </span>
          </h1>

          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-400">
            Tensorify is a node-based AI code generation platform that lets you
            create, connect, and reuse AI components visually. Build once, use
            anywhere—whether it&apos;s a novel attention mechanism or a
            specialized data preprocessing pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 min-[400px]:gap-6">
            <Button
              size="lg"
              onClick={openNewsletterSignup}
              variant="default"
              className="group min-w-[200px] bg-gradient-to-r from-[#A371D3] to-[#5E48BF] text-white hover:opacity-90 shadow-lg"
            >
              Get Early Access
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="relative mt-16 w-full max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#5E48BF]/20 via-[#A371D3]/10 to-[#8257AC]/20 rounded-xl blur-3xl"></div>
            <div className="relative overflow-hidden rounded-xl backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#5E48BF]/5 to-[#A371D3]/5"></div>
              <div className="relative rounded-lg p-1">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#5E48BF]/10 rounded-full filter blur-3xl"></div>
                <div className="absolute -bottom-14 -right-14 w-60 h-60 bg-[#A371D3]/10 rounded-full filter blur-3xl"></div>

                <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                  <Badge className="bg-gray-900/70 text-white backdrop-blur-md border-[#A371D3]/30 shadow px-3 py-1">
                    <Zap className="mr-1 h-3 w-3 text-[#A371D3]" /> AI Workflow
                    Example
                  </Badge>
                  <Badge className="bg-gray-900/70 text-white backdrop-blur-md border-[#5E48BF]/30 shadow px-3 py-1">
                    <ArrowRight className="mr-1 h-3 w-3 text-[#5E48BF]" /> Try
                    clicking on nodes!
                  </Badge>
                </div>

                <InteractiveFlow />

                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <Badge
                    variant="outline"
                    className="bg-gray-900/70 text-white backdrop-blur-md border-[#A371D3]/30 shadow px-4 py-1.5"
                  >
                    Zoom, pan, and interact with the workflow editor
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-[#A371D3]/10 hover:border-[#A371D3]/30 transition-all duration-300 hover:shadow-md hover:shadow-[#A371D3]/5">
              <div className="p-3 rounded-full bg-[#A371D3]/10">
                <Clock className="h-6 w-6 text-[#A371D3]" />
              </div>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#A371D3] to-[#5E48BF]">
                80% Less Time
              </p>
              <p className="text-sm text-muted-foreground">
                From concept to deployment in minutes, not weeks
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-[#8257AC]/10 hover:border-[#8257AC]/30 transition-all duration-300 hover:shadow-md hover:shadow-[#8257AC]/5">
              <div className="p-3 rounded-full bg-[#8257AC]/10">
                <Code className="h-6 w-6 text-[#8257AC]" />
              </div>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8257AC] to-[#5E48BF]">
                Zero Boilerplate
              </p>
              <p className="text-sm text-muted-foreground">
                Focus on architecture, not implementation
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-[#5E48BF]/10 hover:border-[#5E48BF]/30 transition-all duration-300 hover:shadow-md hover:shadow-[#5E48BF]/5">
              <div className="p-3 rounded-full bg-[#5E48BF]/10">
                <Zap className="h-6 w-6 text-[#5E48BF]" />
              </div>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5E48BF] to-[#8F9EBE]">
                3x Faster Results
              </p>
              <p className="text-sm text-muted-foreground">
                Rapid experimentation and iteration
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
