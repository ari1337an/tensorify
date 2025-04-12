'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, BarChart, Layers, Zap, Star } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Badge } from "./ui/badge";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";

export function CTA() {
  const { openNewsletterSignup } = useNewsletterSignup();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-violet-500/5 to-primary/5" />
        <div className="absolute inset-y-0 w-full bg-white/80 shadow-xl shadow-primary/10 ring-1 ring-primary/10 dark:bg-black/80 dark:ring-white/5" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            <Badge variant="outline" className="animate-fade-up">
              <Star className="mr-1 h-3 w-3 fill-primary" /> Limited Early Access
            </Badge>
            
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
              Be Among the First to Experience Tensorify
            </h2>
            
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-400">
              Join our exclusive waitlist to get early access to the most innovative AI development framework. Limited spots available.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <Button 
              size="lg"
              onClick={openNewsletterSignup}
              className="w-full bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 text-white shadow-lg group"
            >
              Join the Waitlist Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Early access members will receive exclusive benefits and priority support
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8 w-full max-w-4xl">
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background/50 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">Priority Access</p>
              <p className="text-sm text-muted-foreground text-center">Be the first to try new features</p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background/50 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">Special Pricing</p>
              <p className="text-sm text-muted-foreground text-center">Exclusive early adopter rates</p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background/50 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">Direct Support</p>
              <p className="text-sm text-muted-foreground text-center">Direct line to our dev team</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 