"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SectionWrapper } from "./section-wrapper";

export function Demo() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Start demo animation
      const interval = setInterval(() => {
        setIsPlaying(false);
        clearInterval(interval);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  };
  
  return (
    <SectionWrapper 
      id="demo" 
      className="bg-muted/20"
      containerClassName="flex flex-col items-center"
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
        <Badge 
          variant="outline" 
          className="px-6 py-2 rounded-full bg-primary/5 text-primary border-primary/20 text-sm font-medium hover:bg-primary/10 transition-colors duration-300"
        >
          See it in action
        </Badge>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          How Tensorify{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto] animate-gradient">
            Works
          </span>
        </h2>
        <p className="max-w-[800px] text-lg sm:text-xl text-muted-foreground">
          Turn your AI architecture ideas into production-ready code in minutes, not days
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto relative">
        <div className="aspect-video rounded-2xl overflow-hidden border border-primary/10 shadow-2xl bg-background/50 backdrop-blur-sm">
          {/* Add your video or interactive demo content here */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              className="h-20 w-20 rounded-full bg-primary/90 hover:bg-primary shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Ready to transform your AI workflow?</h3>
        <p className="text-muted-foreground mb-8">
          Stop wasting time on implementation details. Start building AI that matters.
        </p>
        <Button 
          size="lg" 
          className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
          asChild
        >
          <a href="/get-started">Get Started Free</a>
        </Button>
      </div>
    </SectionWrapper>
  );
} 