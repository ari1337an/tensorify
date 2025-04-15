"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/app/_components/ui/theme-toggle";
import { Skeleton } from "@/app/_components/ui/skeleton";

export function NavbarRight() {
  const { isLoaded } = useUser();

  return (
    <div className="flex items-center gap-2 px-3 shrink-0">
      <ThemeToggle />

      <div className="h-8 w-8 flex items-center justify-center">
        {isLoaded ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-8 w-8 hover:ring-primary/30 transition-colors duration-200",
              },
            }}
          />
        ) : (
          <Skeleton className="h-8 w-8 rounded-full bg-secondary" />
        )}
      </div>
    </div>
  );
}
