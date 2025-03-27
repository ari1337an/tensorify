"use client";
import { useEffect, useState } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { BookOpen, Command, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Gauge } from "lucide-react";

const queryClient = new QueryClient();

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
          {isLoading ? (
            // Loading state for auth buttons
            <>
              <div className="h-10 w-full bg-muted/30 animate-pulse rounded-md"></div>
              <div className="h-10 w-full bg-primary/20 animate-pulse rounded-md"></div>
            </>
          ) : (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full text-left py-2 text-foreground hover:text-muted-foreground transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-2 py-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                  />
                  <span className="text-muted-foreground">Account</span>
                </div>
              </SignedIn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
              avatarBox:
                "h-8 w-8 ring-2 ring-border hover:ring-primary/30 transition-colors duration-200",
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Action
              label="Dashboard"
              labelIcon={<Gauge className="h-4 w-4" />}
              onClick={() => (window.location.href = "/dashboard")}
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </>
  );
};

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <>
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
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-500 bg-clip-text text-transparent">
                      Tensorify
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium ">Studio</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Navigation & Auth */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link
                    href="/projects"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground 
                                hover:bg-muted/60 rounded-lg transition-all duration-200"
                  >
                    <Command className="h-4 w-4" />
                    Projects
                  </Link>
                  <Link
                    href="/learn"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground 
                                hover:bg-muted/60 rounded-lg transition-all duration-200"
                  >
                    <BookOpen className="h-4 w-4" />
                    Learn
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

          {children}
        </>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
