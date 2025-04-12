'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { NewsletterSignup } from "./newsletter-signup";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [showWaitlist, setShowWaitlist] = useState(false);

  const { openNewsletterSignup } = useNewsletterSignup();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-lg shadow-sm" : ""}`}>
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-xl font-bold text-transparent hover:opacity-90 transition-opacity">
              Tensorify
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Button 
              onClick={openNewsletterSignup}
              className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90"
            >
              Join Waitlist
            </Button>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container px-4 py-4 space-y-4">
              <Link href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#benefits" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Benefits
              </Link>
              <Link href="#testimonials" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
              <Link href="#faq" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Button 
                onClick={openNewsletterSignup}
                className="w-full bg-gradient-to-r from-primary to-violet-500 hover:opacity-90"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        )}
      </header>
      <NewsletterSignup />
    </>
  );
} 