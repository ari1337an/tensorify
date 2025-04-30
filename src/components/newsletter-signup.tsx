"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  ZapIcon,
  XIcon,
  ArrowRight,
  StarIcon,
  RocketIcon,
  SparklesIcon,
  AlertCircle,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    const validationResult = validateNewsletterForm(
      form.email,
      form.role,
      form.otherRole,
      form.consentGiven
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
          consentGiven: form.consentGiven,
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
      <DialogContent className="ring-2 ring-primary sm:max-w-[500px] rounded-xl border-primary/10 bg-background/95 backdrop-blur-lg p-8">
        <DialogHeader className="relative">
          <div className="relative mx-auto mb-1">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-primary/20 blur-xl rounded-full" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-primary">
              <RocketIcon className="h-8 w-8 text-background" />
            </div>
          </div>

          {/* <Badge className="mx-auto mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <StarIcon className="mr-1 h-3 w-3" /> Limited Early Access
          </Badge> */}

          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-violet-500 to-primary bg-clip-text text-transparent">
            Join the Tensorify Waitlist
          </DialogTitle>

          <DialogDescription className="text-center text-muted-foreground">
            Be among the first to experience the next generation of AI
            development. Get exclusive early access benefits and shape the
            future of Tensorify.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
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
              className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
            >
              <item.icon className="h-5 w-5 mb-2 text-primary" />
              <h4 className="text-sm font-medium">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateEmail(e.target.value)}
              placeholder="you@example.com"
              className={`h-10 bg-muted/50 border-primary/10 focus:border-primary/30 transition-colors ${
                validationErrors.email ? "border-red-500" : ""
              }`}
            />
            {validationErrors.email && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />{" "}
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Role</Label>
            <RadioGroup
              value={form.role}
              onValueChange={(value) => updateRole(value as Role)}
              className="grid grid-cols-2 gap-2 mt-2"
            >
              {[
                { value: "student", label: "Student" },
                { value: "researcher", label: "AI Researcher" },
                { value: "developer", label: "Developer" },
                { value: "other", label: "Other" },
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`role-${value}`} />
                  <Label
                    htmlFor={`role-${value}`}
                    className="text-sm cursor-pointer"
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
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="otherRole" className="text-sm font-medium">
                  Please specify your role
                </Label>
                <Input
                  id="otherRole"
                  value={form.otherRole}
                  onChange={(e) => updateOtherRole(e.target.value)}
                  placeholder="Your specific role"
                  className={`h-10 bg-muted/50 border-primary/10 focus:border-primary/30 transition-colors ${
                    validationErrors.otherRole ? "border-red-500" : ""
                  }`}
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

          {/* Privacy Consent */}
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="consent"
              checked={form.consentGiven}
              onCheckedChange={(checked) => updateConsent(checked as boolean)}
              className={validationErrors.consent ? "border-red-500" : ""}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="text-xs text-muted-foreground font-normal cursor-pointer"
              >
                I agree to receive marketing communications from Tensorify about
                products, services, and events.
              </Label>
              {validationErrors.consent && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />{" "}
                  {validationErrors.consent}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-primary hover:opacity-90 transition-opacity h-11 mt-1"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-r-transparent" />
            ) : status === "success" ? (
              <span className="flex items-center">✓ Successfully Joined!</span>
            ) : (
              <>
                Join Waitlist{" "}
                <ArrowRight className="ml-2 h-4 w-4 animate-pulse" />
              </>
            )}
          </Button>

          {/* Error Message */}
          <AnimatePresence>
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs text-center"
              >
                {errorMessage || "Failed to sign up. Please try again."}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-muted-foreground mt-1">
            By joining, you&apos;ll receive exclusive updates about
            Tensorify&apos;s launch and early access opportunities. You can
            unsubscribe at any time. View our{" "}
            <a
              href="/privacy"
              className="underline hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
