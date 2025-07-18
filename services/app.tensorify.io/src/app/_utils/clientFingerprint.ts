"use client";

import { useEffect, useState } from "react";
import useStore from "@/app/_store/store";

/**
 * React hook to get the client browser fingerprint using the global store
 * This implementation safely handles ClientJS in Next.js
 * with consideration for the bug mentioned in https://github.com/jackspirou/clientjs/issues/140
 */
export function useClientFingerprint() {
  const { clientFingerprint } = useStore();
  const [isLoading, setIsLoading] = useState(!clientFingerprint);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Set loading state based on whether we have a fingerprint
    if (clientFingerprint) {
      setIsLoading(false);
    }
  }, [clientFingerprint]);

  return {
    fingerprint: clientFingerprint,
    isLoading,
    error,
  };
}

/**
 * Non-hook function to get fingerprint from the store
 * @deprecated Use useClientFingerprint hook instead
 */
export async function getClientFingerprint(): Promise<string> {
  // If in a browser context, access the store
  if (typeof window !== "undefined") {
    // Access store state directly - not recommended but kept for backward compatibility
    return useStore.getState().clientFingerprint;
  }

  return "";
}
