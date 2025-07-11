"use client";

import { useNavigationStore } from "@/app/_stores/navigation-store";

export function NavigationLoader() {
  const { isLoading, progress } = useNavigationStore();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <div className="h-1 w-full bg-primary/5">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{
            width: `${progress}%`,
            transition:
              progress === 100
                ? "width 200ms ease-in-out"
                : "width 2s ease-in-out",
          }}
        />
      </div>
    </div>
  );
}
