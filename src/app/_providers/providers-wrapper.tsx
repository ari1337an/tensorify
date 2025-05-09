"use client";

import { ThemeProvider } from "@/app/_providers/theme-provider";
import { FingerprintProvider } from "@/app/_providers/fingerprint-provider";
import { UserProvider } from "@/app/_providers/user-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

/**
 * ProvidersWrapper - Client component that wraps multiple providers
 * Used in layout.tsx to provide context and state to the entire app
 */
export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          profileSectionPrimaryButton__username: {
            display: "none",
          },
        },
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <FingerprintProvider>
          <UserProvider>{children}</UserProvider>
        </FingerprintProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
