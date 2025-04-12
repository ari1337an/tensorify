'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Image from "next/image";

export function Header() {
  const { openNewsletterSignup } = useNewsletterSignup();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/tensorify-logo-only.svg" 
                alt="Tensorify Logo" 
                width={32} 
                height={32} 
                className="h-8 w-auto"
              />
              <span className="font-bold text-lg">Tensorify</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/#for-whom" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                For Whom
              </Link>
              <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={openNewsletterSignup}
              className="hidden md:flex bg-gradient-to-r from-[#A371D3] to-[#5E48BF] text-white hover:opacity-90 shadow-lg"
              variant="default"
              size="sm"
            >
              Get Early Access
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden py-4 px-6 bg-background/90 backdrop-blur-md border-b">
          <div className="container mx-auto max-w-7xl">
            <nav className="flex flex-col gap-4">
              <Link
                href="/#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#for-whom"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Whom
              </Link>
              <Link
                href="/#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Button
                onClick={() => {
                  openNewsletterSignup();
                  setIsMobileMenuOpen(false);
                }}
                variant="default"
                size="sm"
                className="mt-2 w-full bg-gradient-to-r from-[#A371D3] to-[#5E48BF] text-white hover:opacity-90 shadow-lg"
              >
                Get Early Access
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 