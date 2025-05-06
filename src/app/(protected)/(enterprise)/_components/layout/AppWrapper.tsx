"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "../sidebar";
import { SettingsProvider } from "../settings";
import { AppLayout } from "./AppLayout";

const queryClient = new QueryClient();

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
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
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <SettingsProvider>
            <AppLayout>{children}</AppLayout>
          </SettingsProvider>
        </SidebarProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
