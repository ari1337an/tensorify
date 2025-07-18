"use client"

import posthog from "posthog-js"
import { getFingerprint } from "./userIdentification"

// Safely get fingerprint with fallback
const safeGetFingerprint = () => {
    const fingerprint = getFingerprint();
    return fingerprint || `anon-${Date.now().toString(36)}`;
}

export function trackNewsletterSignup(email: string, additionalProperties: Record<string, string | number | boolean> = {}) {
    const fingerprint = safeGetFingerprint();

    // Capture the signup event with the fingerprint
    posthog.capture("newsletter_signup", {
        email,
        fingerprint,
        location: typeof window !== 'undefined' ? window.location.pathname : '',
        ...additionalProperties
    })

    // Identify user with their email
    posthog.identify(fingerprint, {
        email,
        $email: email // Standard PostHog property
    })

    return fingerprint
}

export function trackPrivacyPolicyClick(source: string) {
    const fingerprint = safeGetFingerprint();
    posthog.capture("privacy_policy_click", {
        source,
        fingerprint
    })
}

export function trackSubmitButtonClick(source: string) {
    const fingerprint = safeGetFingerprint();
    posthog.capture("submit_button_click", {
        source,
        fingerprint
    })
}

export function trackNewsletterError(type: string, fields: string[]) {
    const fingerprint = safeGetFingerprint();
    posthog.capture("newsletter_error", {
        type,
        fields,
        fingerprint
    })
}

export function trackNewsletterView() {
    const fingerprint = safeGetFingerprint();
    posthog.capture("newsletter_view", {
        fingerprint
    })
}