"use client";

import { Button } from "@/components/ui/button";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";

export default function TestNewsletterPage() {
  const { openNewsletterSignup } = useNewsletterSignup();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Test Newsletter Signup</h1>
      
      <Button 
        onClick={openNewsletterSignup}
        variant="default"
        size="lg"
        className="min-w-[200px] bg-gradient-to-r from-[#A371D3] to-[#5E48BF] text-white hover:opacity-90 shadow-lg"
      >
        Open Newsletter Modal
      </Button>
      
      <p className="mt-4 text-muted-foreground">
        Click the button above to test if the newsletter signup modal works correctly.
      </p>
      
      <NewsletterSignup />
    </div>
  );
} 