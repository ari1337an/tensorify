"use client"

import { useState, useEffect } from "react"
import posthog from "posthog-js"

export function PrivacyBanner() {
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if user has already accepted
        const hasAccepted = localStorage.getItem("privacy_accepted")

        if (!hasAccepted) {
            setShowBanner(true)
        }
    }, [])

    const handleAccept = () => {
        // Save acceptance to localStorage
        localStorage.setItem("privacy_accepted", "true")
        setShowBanner(false)

        // Track acceptance
        posthog.capture("privacy_accepted")
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center z-50">
            <p className="text-sm max-w-3xl">
                We use analytics to understand how visitors interact with our site.
                This helps us improve your experience. See our{" "}
                <a href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                </a>{" "}
                for details.
            </p>
            <button
                onClick={handleAccept}
                className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
                Accept
            </button>
        </div>
    )
}