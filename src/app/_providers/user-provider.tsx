"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import useStore from "@/app/_store/store";
import { User } from "@clerk/nextjs/server";

/**
 * UserProvider - Client component that syncs Clerk user data with global state
 * This provider makes user data available across the application including onboarding flows
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    if (isSignedIn && user && isLoaded) {
      useStore.setState({ currentUser: user as unknown as User });
    } else {
      useStore.setState({ currentUser: null });
    }
  }, [isSignedIn, user, isLoaded]);

  // Simply render children - this is just for side effects
  return <>{children}</>;
}
