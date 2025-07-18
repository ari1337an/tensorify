"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { Suspense, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { identifyUser } from "@/lib/userIdentification"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Initialize PostHog with minimal tracking
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      mask_all_text: true,
      disable_session_recording: true,
      debug: process.env.NODE_ENV === "development",
      loaded: () => {
        // Identify user with error handling built in
        identifyUser().catch(err => {
          if (process.env.NODE_ENV === "development") {
            console.error("Error identifying user:", err);
          }
        });
      }
    });

    // Add minimal scroll depth tracking
    // Only track two meaningful points: 75% and 100% (bottom of page)
    let scrolled75 = false;
    let scrolled100 = false;
    let ticking = false; // For scroll performance

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Calculate how far the user has scrolled
          const winHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

          // Track 75% scroll depth (only once)
          if (scrollPercent >= 75 && !scrolled75) {
            posthog.capture('scroll_depth', { depth: 75 });
            scrolled75 = true;
          }

          // Track 100% scroll depth (only once)
          if (scrollPercent >= 95 && !scrolled100) {
            posthog.capture('scroll_depth', { depth: 100 });
            scrolled100 = true;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthogClient = usePostHog()

  useEffect(() => {
    // Skip if not in browser or missing data
    if (!pathname || !posthogClient || typeof window === 'undefined') return;

    // Construct URL
    const url = window.origin + pathname +
      (searchParams.toString() ? `?${searchParams.toString()}` : '');

    // Build properties object
    const properties: Record<string, string | boolean> = {
      "$current_url": url,
      "page_path": pathname
    };

    // Add UTM parameters and other search params
    for (const [key, value] of searchParams.entries()) {
      properties[key] = value;
    }

    // Add referrer data if available
    if (document.referrer) {
      properties.$referrer = document.referrer;
      try {
        properties.$referring_domain = new URL(document.referrer).hostname;
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error parsing referrer:", e);
        }
        // Ignore invalid URLs
      }
    }

    // Capture the pageview
    posthogClient.capture("$pageview", properties);
  }, [pathname, searchParams, posthogClient]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}