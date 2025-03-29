"use client";
import { useEffect, useState } from "react";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Gauge } from "lucide-react";
import { Skeleton } from "@/app/_components/ui/skeleton";

const queryClient = new QueryClient();

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
      <>
        <Skeleton className="h-8 w-8 rounded-full" />
      </>
    );
  }

  return (
    <>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox:
                "h-8 w-8 hover:ring-primary/30 transition-colors duration-200",
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
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <>
          <HeaderAuth />

          {children}
        </>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
