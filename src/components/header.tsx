"use client";

import Logo from "@/components/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openNewsletterSignup } = useNewsletterSignup();

  // Common background styling for both header and mobile menu
  const commonBackground = "bg-background/95 hero-gradient-bg backdrop-blur-xl";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full ${commonBackground} border-b border-border/40`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with correct baseline alignment */}
          <div className="flex items-center h-full">
            <Logo className="flex items-end h-full pb-[18px] md:pb-[22px]" />
          </div>

          {/* Desktop Navigation with baseline alignment */}
          <nav className="hidden md:flex items-end h-full pb-[22px] space-x-10">
            <Link href="/#for-whom" className="text-base font-medium text-foreground/90 hover:text-primary transition-colors">
              Use Cases
            </Link>
            <Link href="/#pricing" className="text-base font-medium text-foreground/90 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-base font-medium text-foreground/90 hover:text-primary transition-colors">
              Blog
            </Link>
          </nav>

          {/* Action Buttons with baseline alignment */}
          <div className="flex items-end h-full pb-[18px] md:pb-[22px] gap-2">
            <Button
              onClick={() => {
                openNewsletterSignup();
                setIsMobileMenuOpen(false);
              }}
              className="hero-button-gradient text-white font-medium 
                text-xs sm:text-sm md:text-sm 
                h-7 sm:h-7 md:h-8 
                px-3 sm:px-4 md:px-5 
                rounded-md"
            >
              Early Access
            </Button>

            {/* Mobile Menu Button with properly sized icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center 
                h-7 sm:h-7 md:h-8 
                w-7 sm:w-7 md:w-8
                rounded-md border border-border/60 hover:bg-background/20 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ?
                <X size={18} strokeWidth={2} /> :
                <Menu size={18} strokeWidth={2} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden ${commonBackground} border-t border-border/30 shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <nav className="flex flex-col py-2">
              <div className="flex flex-col">
                <Link
                  href="/#for-whom"
                  className="py-3 px-4 text-base hover:bg-primary/10 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Use Cases
                </Link>
                <div className="h-px bg-gradient-to-r from-border/10 via-border/50 to-border/10 mx-2"></div>

                <Link
                  href="/#pricing"
                  className="py-3 px-4 text-base hover:bg-primary/10 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <div className="h-px bg-gradient-to-r from-border/10 via-border/50 to-border/10 mx-2"></div>

                <Link
                  href="/blog"
                  className="py-3 px-4 text-base hover:bg-primary/10 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}