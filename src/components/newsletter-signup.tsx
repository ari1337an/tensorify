"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ZapIcon, XIcon, ArrowRight, StarIcon, RocketIcon, SparklesIcon } from "lucide-react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";

export function NewsletterSignup() {
  const { isOpen, closeNewsletterSignup } = useNewsletterSignup();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    // TODO: Implement actual waitlist signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus("success");
    
    setTimeout(() => {
      closeNewsletterSignup();
      setStatus("idle");
      setEmail("");
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeNewsletterSignup}>
      <DialogContent className="sm:max-w-[500px] rounded-xl border-primary/10 bg-background/95 backdrop-blur-lg p-8">
        <DialogHeader className="relative">
          <button 
            onClick={() => closeNewsletterSignup()}
            className="absolute -right-2 -top-2 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <XIcon className="h-4 w-4" />
          </button>
          
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-primary/20 blur-xl rounded-full" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-primary">
              <RocketIcon className="h-8 w-8 text-background" />
            </div>
          </div>
          
          <Badge className="mx-auto mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <StarIcon className="mr-1 h-3 w-3" /> Limited Early Access
          </Badge>
          
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-violet-500 to-primary bg-clip-text text-transparent">
            Join the Tensorify Waitlist
          </DialogTitle>
          
          <DialogDescription className="text-center mt-3 text-muted-foreground">
            Be among the first to experience the next generation of AI development. Get exclusive early access benefits and shape the future of Tensorify.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 my-6">
          {[
            { icon: StarIcon, title: "Priority Access", desc: "First in line" },
            { icon: SparklesIcon, title: "Special Pricing", desc: "Early bird rates" },
            { icon: ZapIcon, title: "Direct Support", desc: "VIP assistance" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
              <item.icon className="h-5 w-5 mb-2 text-primary" />
              <h4 className="text-sm font-medium">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-muted/50 border-primary/10 focus:border-primary/30 transition-colors"
            />
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-violet-500 to-primary hover:opacity-90 transition-opacity min-w-[140px] h-11"
              disabled={status === "loading" || status === "success"}
            >
              {status === "loading" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-r-transparent" />
              ) : status === "success" ? (
                "✓ Welcome!"
              ) : (
                <>
                  Join Waitlist <ArrowRight className="ml-2 h-4 w-4 animate-pulse" />
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            By joining, you&apos;ll receive exclusive updates about Tensorify&apos;s launch and early access opportunities.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
} 