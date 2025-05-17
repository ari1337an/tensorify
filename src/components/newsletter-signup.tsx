"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  ArrowRight,
  RocketIcon,
  AlertCircle,
} from "lucide-react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { validateNewsletterForm } from "@/lib/validation";
import { motion, AnimatePresence } from "framer-motion";
import { usePostHog } from "posthog-js/react";
import { getFingerprint } from "@/lib/userIdentification";
import { trackNewsletterSignup, trackNewsletterError, trackNewsletterView } from "@/lib/tracking-utils";

import type { Role } from "@/types/newsletter";

// Add global type for window property
declare global {
  interface Window {
    modalViewTracked?: boolean;
  }
}

export function NewsletterSignup() {
  const posthog = usePostHog();
  const {
    isOpen,
    closeNewsletterSignup,
    form,
    updateEmail,
    updateRole,
    updateOtherRole,
    updateConsent,
    resetForm,
    status,
    setStatus,
    setErrorMessage,
    errorMessage,
  } = useNewsletterSignup();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Track only when the modal is opened (important for funnel analytics)
  useEffect(() => {
    if (isOpen) {
      // Track modal view - only once
      if (!window.modalViewTracked) {
        trackNewsletterView();
        window.modalViewTracked = true;
      }

      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, posthog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get fingerprint for tracking
    const fingerprint = getFingerprint();

    // Modified validation to make consent optional
    const validationResult = validateNewsletterForm(
      form.email,
      form.role,
      form.otherRole,
      true
    );

    if (!validationResult.isValid) {
      // Track validation errors (important to understand form issues)
      trackNewsletterError("validation", Object.keys(validationResult.errors));


      setValidationErrors(validationResult.errors);
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    // Set loading state
    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          role: form.role,
          otherRole: form.role === "other" ? form.otherRole : "",
          consentGiven: form.consentGiven,
          fingerprint: fingerprint
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      // Set success state
      setStatus("success");

      // Track successful signup (critical conversion metric)
      trackNewsletterSignup(form.email, {
        role: form.role,
        other_role: form.role === "other" ? form.otherRole : "",
        consent_given: form.consentGiven
      });

      // Reset and close after delay
      setTimeout(() => {
        closeNewsletterSignup();
        resetForm();
      }, 2000);
    } catch (error) {
      // Track submission error (important for debugging)
      // Only track serious errors to reduce noise
      if (!(error instanceof Error && error.message.includes("Failed to sign up"))) {
        trackNewsletterError("submission", [error instanceof Error ? error.message : "unknown_error"]);
      }

      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeNewsletterSignup();
        }
      }}
    >
      {/* Fixed positioning to center the dialog on all devices */}
      <DialogContent className="ring-2 ring-primary sm:max-w-[500px] rounded-xl border-primary/10 bg-background/95 backdrop-blur-lg p-3 sm:p-4 
        fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[90vh] overflow-y-auto 
        w-[calc(100%-1rem)] sm:w-auto sm:min-w-[400px]">


        <DialogHeader className="relative mb-3 mt-1">
          <div className="relative mx-auto mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-primary/20 blur-xl rounded-full" />
            <div className="relative flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-primary">
              <RocketIcon className="h-5 sm:h-6 w-5 sm:w-6 text-background" />
            </div>
          </div>

          <DialogTitle className="text-center text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-500 to-primary bg-clip-text text-transparent">
            Join the Tensorify Waitlist
          </DialogTitle>

          <DialogDescription className="text-center text-xs sm:text-sm text-muted-foreground mt-1">
            Be among the first to experience the next generation of AI
            development.
          </DialogDescription>
        </DialogHeader>


        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email Input */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateEmail(e.target.value)}
              placeholder="you@example.com"
              className={`h-9 bg-muted/50 border-primary/10 focus:border-primary/30 transition-colors ${validationErrors.email ? "border-red-500" : ""
                }`}
              required
            />
            {validationErrors.email && (
              <p className="text-xs text-red-500 flex items-center mt-0.5">
                <AlertCircle className="h-3 w-3 mr-1" />{" "}
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Role Selection - Improved for mobile */}
          <div className="space-y-1">
            <Label className="text-xs sm:text-sm font-medium">
              Your Role <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={form.role}
              onValueChange={(value) => updateRole(value as Role)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1"
              required
            >
              {[
                { value: "student", label: "Student" },
                { value: "researcher", label: "AI Researcher" },
                { value: "developer", label: "Developer" },
                { value: "other", label: "Other" },
              ].map(({ value, label }) => (
                <div
                  key={value}
                  className="flex items-center space-x-2 rounded-md px-2 py-1.5 hover:bg-muted/70 transition-colors"
                >
                  <RadioGroupItem value={value} id={`role-${value}`} />
                  <Label
                    htmlFor={`role-${value}`}
                    className="text-xs sm:text-sm cursor-pointer w-full"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {validationErrors.role && (
              <p className="text-xs text-red-500 flex items-center mt-0.5">
                <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.role}
              </p>
            )}
          </div>

          {/* Other Role Input (conditional) */}
          <AnimatePresence>
            {form.role === "other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 overflow-hidden"
              >
                <Label htmlFor="otherRole" className="text-xs sm:text-sm font-medium">
                  Please specify your role <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="otherRole"
                  value={form.otherRole}
                  onChange={(e) => updateOtherRole(e.target.value)}
                  placeholder="Your specific role"
                  className={`h-9 bg-muted/50 border-primary/10 focus:border-primary/30 transition-colors ${validationErrors.otherRole ? "border-red-500" : ""
                    }`}
                  required={form.role === "other"}
                />
                {validationErrors.otherRole && (
                  <p className="text-xs text-red-500 flex items-center mt-0.5">
                    <AlertCircle className="h-3 w-3 mr-1" />{" "}
                    {validationErrors.otherRole}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Consent - Now Optional */}
          <div className="flex items-start space-x-2 pt-1">
            <Checkbox
              id="consent"
              checked={form.consentGiven}
              onCheckedChange={(checked) => updateConsent(checked as boolean)}
              className="mt-0.5"
            />
            <div className="grid gap-1 leading-none">
              <Label
                htmlFor="consent"
                className="text-xs text-muted-foreground font-normal cursor-pointer"
              >
                I agree to receive marketing communications from Tensorify.
                <span className="italic ml-1">(Optional)</span>
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-primary hover:opacity-90 transition-opacity h-10 mt-2"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
            ) : status === "success" ? (
              <span className="flex items-center justify-center text-sm">✓ Successfully Joined!</span>
            ) : (
              <span className="flex items-center justify-center text-sm">
                Join Waitlist
                <ArrowRight className="ml-1.5 h-4 w-4 animate-pulse" />
              </span>
            )}
          </Button>

          {/* Error Message */}
          <AnimatePresence>
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs text-center"
              >
                {errorMessage || "Failed to sign up. Please try again."}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-muted-foreground mt-2 pb-1">
            By joining, you&apos;ll receive important waitlist updates.
            View our{" "}
            <a
              href="/privacy"
              className="underline hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}