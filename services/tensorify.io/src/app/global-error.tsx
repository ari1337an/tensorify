'use client';

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="space-y-6 max-w-md">
            <h1 className="text-5xl font-bold text-foreground">500</h1>
            <h2 className="text-2xl font-semibold text-foreground/90">Something Went Wrong</h2>
            <p className="text-muted-foreground">
              We&apos;re sorry, but there was an error processing your request.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <Link 
                href="/"
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 