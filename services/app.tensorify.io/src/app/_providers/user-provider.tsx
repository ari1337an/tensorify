"use client";

import { useEffect } from "react";
import useStore from "@/app/_store/store";

/**
 * UserProvider - Client component that syncs Clerk user data with global state
 * This provider makes user data available across the application including onboarding flows
 */
export function UserProvider({
  children,
  sessionClaims,
}: {
  children: React.ReactNode;
  sessionClaims: string;
}) {
  const setSessionClaims = useStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (sessionClaims) {
      setSessionClaims(JSON.parse(sessionClaims));
    }
  }, [sessionClaims, setSessionClaims]);

  // Simply render children - this is just for side effects
  return <>{children}</>;
}
