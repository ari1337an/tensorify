"use client";

import { useEffect } from "react";
import useStore from "@/app/_store/store";

/**
 * FingerprintProvider - Client component that initializes the browser fingerprint
 * and stores it in the global state
 */
export function FingerprintProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clientFingerprint, setClientFingerprint } = useStore();

  useEffect(() => {
    // Skip if we already have a fingerprint or not in browser
    if (clientFingerprint || typeof window === "undefined") {
      return;
    }

    // Function to generate and set fingerprint
    const generateFingerprint = async () => {
      try {
        // Dynamic import with proper error handling
        const ClientJS = await import("clientjs").catch(() => null);

        if (!ClientJS) {
          console.error("Failed to load ClientJS");
          return;
        }

        // Create client instance and get fingerprint
        const client = new ClientJS.ClientJS();
        const fingerprint = client.getFingerprint().toString();

        // Store the fingerprint in global state
        setClientFingerprint(fingerprint);
      } catch (error) {
        console.error("Error generating fingerprint:", error);
      }
    };

    // Generate fingerprint on mount
    generateFingerprint();
  }, [clientFingerprint, setClientFingerprint]);

  // Simply render children - this is just for side effects
  return <>{children}</>;
}
