"use client";

import { ThemeProvider } from "@/app/_providers/theme-provider";
import { FingerprintProvider } from "@/app/_providers/fingerprint-provider";
import { UserProvider } from "@/app/_providers/user-provider";
import { OrganizationProvider } from "@/app/_providers/organization-provider";
import { TeamProvider } from "@/app/_providers/team-provider";
import { ProjectProvider } from "@/app/_providers/project-provider";
import { WorkflowProvider } from "@/app/_providers/workflow-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

/**
 * ProvidersWrapper - Client component that wraps multiple providers
 * Used in layout.tsx to provide context and state to the entire app
 */
export function ProvidersWrapper({
  children,
  sessionClaims,
  organization,
  teams,
  currentTeam,
}: {
  children: React.ReactNode;
  sessionClaims: string;
  organization: string;
  teams: string;
  currentTeam?: string;
}) {
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
          <UserProvider sessionClaims={sessionClaims}>
            <OrganizationProvider organization={organization}>
              <TeamProvider teams={teams} currentTeam={currentTeam}>
                <ProjectProvider>
                  <WorkflowProvider>{children}</WorkflowProvider>
                </ProjectProvider>
              </TeamProvider>
            </OrganizationProvider>
          </UserProvider>
        </FingerprintProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
