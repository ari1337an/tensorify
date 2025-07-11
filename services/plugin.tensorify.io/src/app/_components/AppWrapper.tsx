"use client";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "@/app/_components/ui/link";
import { Menu, Search, X, Command, BookOpen, Gauge, Github, Code } from "lucide-react";
import { useState, useEffect } from "react";
import { Toaster } from "@/app/_components/ui/sonner";
import { SearchDialog } from "@/app/_components/SearchDialog";
import { usePathname } from "next/navigation";
import { NavigationLoader } from "@/app/_components/NavigationLoader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { dark } from "@clerk/themes";

const queryClient = new QueryClient();

// Header auth component with loading state
const HeaderAuth = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden sm:block h-5 w-16 bg-muted/30 animate-pulse rounded"></div>
        <div className="hidden sm:block h-9 w-24 bg-primary/20 animate-pulse rounded-lg"></div>
        <div className="h-8 w-8 rounded-full bg-muted/40 animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="hidden sm:flex items-center gap-4">
          <SignInButton>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              className="bg-primary/90 hover:bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium 
                       transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Get Started
            </button>
          </SignUpButton>
        </div>
      </SignedOut>

      <SignedIn>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <div className="h-4 w-px bg-border/40" />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-2 ring-border hover:ring-primary/30 transition-colors duration-200",
              profileSectionPrimaryButton__username: {
                display: "none",
              },
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Action
              label="Your plugins"
              labelIcon={<Gauge className="h-4 w-4" />}
              onClick={() => (window.location.href = "/dashboard")}
            />
          </UserButton.MenuItems>
          <UserButton.MenuItems>
            <UserButton.Action
              label="GitHub Permissions"
              labelIcon={<Github className="h-4 w-4" />}
              onClick={() => (window.location.href = "/plugins/permissions")}
            />
          </UserButton.MenuItems>
        </UserButton>
        
      </SignedIn>
    </>
  );
};

// Mobile menu with loading state
function MobileMenu({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-card border-l border-border p-6 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <Link
            href="/search"
            onClick={onClose}
            className="flex items-center gap-3 p-3 text-sm font-medium rounded-lg hover:bg-muted/60 transition-colors"
          >
            <Command className="h-5 w-5" />
            Browse Plugins
          </Link>
          <Link
            href="/docs"
            onClick={onClose}
            className="flex items-center gap-3 p-3 text-sm font-medium rounded-lg hover:bg-muted/60 transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            Documentation
          </Link>
          <Link
            href="/api-docs"
            onClick={onClose}
            className="flex items-center gap-3 p-3 text-sm font-medium rounded-lg hover:bg-muted/60 transition-colors"
          >
            <Code className="h-5 w-5" />
            API Documentation
          </Link>

          {isLoading ? (
            <div className="pt-4 border-t">
              <div className="flex flex-col gap-3">
                <div className="h-10 bg-muted/30 animate-pulse rounded-lg"></div>
                <div className="h-10 bg-primary/20 animate-pulse rounded-lg"></div>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t">
              <SignedOut>
                <div className="flex flex-col gap-3">
                  <SignInButton>
                    <button className="flex items-center justify-center p-3 text-sm font-medium rounded-lg border hover:bg-muted/60 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="flex items-center justify-center p-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 text-sm font-medium rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <Gauge className="h-5 w-5" />
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <>
          <NavigationLoader />
          {/* Premium Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              {/* Logo Area */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg blur-[2px]" />
                    <div className="relative h-full w-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="font-bold text-lg text-white">T</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-white">
                      Plugins
                    </span>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-white/70 mr-1">
                        by
                      </span>
                      <span className="text-sm font-medium bg-gradient-to-r from-white to-blue-500 bg-clip-text text-transparent">
                        Tensorify
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Center Search Bar */}
              {!pathname.startsWith("/search") && (
                <div className="hidden lg:flex flex-1 items-center justify-center px-8 max-w-3xl">
                  <div
                    onClick={() => setOpen(true)}
                    className="relative w-full max-w-2xl group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-muted/40 rounded-xl blur-[6px] group-hover:bg-muted/60 transition-colors duration-200" />
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                      <div className="w-full bg-muted/40 hover:bg-muted/60 px-10 py-2 rounded-xl text-sm border border-border/50">
                        <span className="text-muted-foreground/70">
                          Search plugins...
                        </span>
                      </div>
                      <kbd className="absolute right-3 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation & Auth */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link
                    href="/search"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground 
                                hover:bg-muted/60 rounded-lg transition-all duration-200"
                  >
                    <Command className="h-4 w-4" />
                    Browse Plugins
                  </Link>
                  <Link
                    href="/docs"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground 
                                hover:bg-muted/60 rounded-lg transition-all duration-200"
                  >
                    <BookOpen className="h-4 w-4" />
                    Docs
                  </Link>
                  <Link
                    href="/api-docs"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground 
                                hover:bg-muted/60 rounded-lg transition-all duration-200"
                  >
                    <Code className="h-4 w-4" />
                    API Docs
                  </Link>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                  <HeaderAuth />

                  {/* Mobile Search Button */}
                  {!pathname.startsWith("/search") && (
                    <button
                      onClick={() => setOpen(true)}
                      className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground 
                          hover:bg-muted/60 hover:text-foreground transition-colors"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  )}

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground 
                                 hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <MobileMenu onClose={() => setMobileMenuOpen(false)} />
          )}

          {/* Add the SearchDialog component */}
          {!pathname.startsWith("/search") && (
            <SearchDialog open={open} onOpenChange={setOpen} />
          )}

          {children}
          <Toaster />
        </>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
