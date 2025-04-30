"use client";

import Logo from "@/components/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openNewsletterSignup } = useNewsletterSignup();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-background">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center space-x-8 text-muted-foreground">
            <Link
              href="/#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#for-whom"
              className="hover:text-primary transition-colors"
            >
              For Whom
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => openNewsletterSignup()}
              className="items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:bg-primary/90 h-9 rounded-md px-3 bg-gradient-to-r from-[#A371D3] to-[#5E48BF] text-white hover:opacity-90 shadow-lg"
            >
              Get Early Access
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-primary"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <nav className="flex flex-col space-y-4 p-6 text-muted-foreground">
            <Link
              href="/#features"
              className="hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#for-whom"
              className="hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For Whom
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-4 zm:mx-6 lg:mx-8 my-8" />
    </>
  );
}
