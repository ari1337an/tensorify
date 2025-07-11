"use client";

import NextLink from "next/link";
import { useNavigationStore } from "@/app/_stores/navigation-store";
import { ComponentProps, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Link({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const { startLoading, setProgress, completeLoading, stopLoading } =
    useNavigationStore();
  const pathname = usePathname();

  useEffect(() => {
    // When pathname changes, complete the loading animation
    const completeTimer = setTimeout(() => {
      completeLoading();

      // Then stop loading after a brief delay
      const stopTimer = setTimeout(() => {
        stopLoading();
      }, 200);

      return () => clearTimeout(stopTimer);
    }, 100);

    return () => clearTimeout(completeTimer);
  }, [pathname, completeLoading, stopLoading]);

  const handleClick = () => {
    startLoading();
    // Simulate progress to 77%
    setTimeout(() => setProgress(77), 100);
  };

  return <NextLink href={href} onClick={handleClick} {...props} />;
}
