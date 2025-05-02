"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  ZapIcon,
  ArrowRight,
  StarIcon,
  RocketIcon,
  SparklesIcon,
  AlertCircle,
  X as XIcon,
} from "lucide-react";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { validateNewsletterForm } from "@/lib/validation";
import { motion, AnimatePresence } from "framer-motion";

// Import Role type from the hook file
import type { Role } from "@/types/newsletter";

export function NewsletterSignup() {
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

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Modified validation to make consent optional
    const validationResult = validateNewsletterForm(
      form.email,
      form.role,
      form.otherRole,
      // Pass true here to skip consent validation - we're making it optional
      true
    );

    if (!validationResult.isValid) {
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
          consentGiven: form.consentGiven, // This is now optional
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      // Set success state
      setStatus("success");

      // Reset and close after delay
      setTimeout(() => {
        closeNewsletterSignup();
        resetForm();
      }, 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeNewsletterSignup()}
    >
      {/* Fixed positioning to center the dialog on all devices */}
      <DialogContent className="ring-2 ring-primary sm:max-w-[550px] rounded-xl border-primary/10 bg-background/95 backdrop-blur-lg p-4 sm:p-6 md:p-8 
        fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[85vh] overflow-y-auto 
        w-[calc(100%-2rem)] sm:w-auto sm:min-w-[450px]">

        {/* Add explicit close button for mobile */}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader className="relative mb-4 mt-2">
          <div className="relative mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-primary/20 blur-xl rounded-full" />
            <div className="relative flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-primary">
              <RocketIcon className="h-6 sm:h-8 w-6 sm:w-8 text-background" />
            </div>
          </div>

          <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-500 to-primary bg-clip-text text-transparent">
            Join the Tensorify Waitlist
          </DialogTitle>

          <DialogDescription className="text-center text-sm text-muted-foreground mt-2">
            Be among the first to experience the next generation of AI
            development. Get exclusive early access benefits.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits Grid - Improved for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6">
          {[
            { icon: StarIcon, title: "Priority Access", desc: "First in line" },
            {
              icon: SparklesIcon,
              title: "Special Pricing",
              desc: "Early bird rates",
            },
            { icon: ZapIcon, title: "Direct Support", desc: "VIP assistance" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex sm:flex-col items-center sm:items-center text-left sm:text-center p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
            >
              <div className="flex-shrink-0 mr-3 sm:mr-0 sm:mb-2">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateEmail(e.target.value)}
              placeholder="you@example.com"
              className={`h-11 bg-muted/50 border-primary/10 focus:border-primary/30 transition-colors ${validationErrors.email ? "border-red-500" : ""
                }`}
              required
            />
            {validationErrors.email && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />{" "}
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Role Selection - Improved for mobile */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Your Role <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={form.role}
              onValueChange={(value) => updateRole(value as Role)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
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
                  className="flex items-center space-x-2 rounded-md px-3 py-2 hover:bg-muted/70 transition-colors"
                >
                  <RadioGroupItem value={value} id={`role-${value}`} />
                  <Label
                    htmlFor={`role-${value}`}
                    className="text-sm cursor-pointer w-full"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {validationErrors.role && (
              <p className="text-xs text-red-500 flex items-center mt-1">
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
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="otherRole" className="text-sm font-medium">
                  Please specify your role <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="otherRole"
                  value={form.otherRole}
                  onChange={(e) => updateOtherRole(e.target.value)}
                  placeholder="Your specific role"
                  className={`h-11 bg-muted/50 border-primary/10 focus:border-primary/30 transition-colors ${validationErrors.otherRole ? "border-red-500" : ""
                    }`}
                  required={form.role === "other"}
                />
                {validationErrors.otherRole && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />{" "}
                    {validationErrors.otherRole}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Consent - Now Optional */}
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="consent"
              checked={form.consentGiven}
              onCheckedChange={(checked) => updateConsent(checked as boolean)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="text-xs text-muted-foreground font-normal cursor-pointer"
              >
                I agree to receive marketing communications from Tensorify about
                products, services, and events. <span className="italic">(Optional)</span>
              </Label>
              {/* Removed validation error display for consent since it's optional now */}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-primary hover:opacity-90 transition-opacity h-12 mt-4"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-r-transparent" />
            ) : status === "success" ? (
              <span className="flex items-center justify-center">✓ Successfully Joined!</span>
            ) : (
              <span className="flex items-center justify-center">
                Join Waitlist{" "}
                <ArrowRight className="ml-2 h-4 w-4 animate-pulse" />
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
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs text-center"
              >
                {errorMessage || "Failed to sign up. Please try again."}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-muted-foreground mt-4 pb-2">
            By joining, you&apos;ll receive important waitlist updates about
            Tensorify&apos;s launch. You can unsubscribe at any time. View our{" "}
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