"use client"

import posthog from 'posthog-js';

// Type for ClientJS instance (not constructor)
type ClientJSInstance = {
    getFingerprint(): string;
    getBrowser(): string;
    getBrowserVersion(): string;
    getOS(): string;
    getOSVersion(): string;
    getDeviceType(): string;
    getScreenPrint(): string;
    getTimeZone(): string;
    getLanguage(): string;
};

// Global cache for ClientJS instance
let clientJSInstance: ClientJSInstance | null = null;

/**
 * Creates and returns a ClientJS instance safely in Next.js
 * This function must ONLY be called in browser context
 */
function getClientJSInstance(): ClientJSInstance | null {
    // Return from cache if already initialized
    if (clientJSInstance) {
        return clientJSInstance;
    }

    // Skip on server side
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        // Use a dynamic import within a try/catch block
        // This is a special pattern needed for Next.js + ClientJS
        // Based on clientjs issue #140 (https://github.com/jackspirou/clientjs/issues/140)
        // TODO: Remove this once we have a better way to handle ClientJS
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ClientJSModule = require('clientjs');

        // Access the ClientJS constructor from the module
        const ClientJS = ClientJSModule.ClientJS;

        // Create and cache the instance
        clientJSInstance = new ClientJS();
        return clientJSInstance;
    } catch (error) {
        console.error('Failed to initialize ClientJS:', error);
        return null;
    }
}

/**
 * Generates a unique fingerprint and identifies the user in PostHog
 */
export const identifyUser = async () => {
    // Only run on client side
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        // Get ClientJS instance
        const client = getClientJSInstance();

        if (!client) {
            return generateFallbackId();
        }

        // Generate fingerprint
        const fingerprint = client.getFingerprint();

        // Collect browser components for a more robust ID
        const components = {
            browser: client.getBrowser(),
            browserVersion: client.getBrowserVersion(),
            OS: client.getOS(),
            OSVersion: client.getOSVersion(),
            deviceType: client.getDeviceType(),
            screenPrint: client.getScreenPrint(),
            timezone: client.getTimeZone(),
            language: client.getLanguage(),
        };

        // Create a robust ID by combining fingerprint with less-changing components
        const robustId = `${fingerprint}:${components.screenPrint}:${components.timezone}`;

        // Identify user in PostHog
        posthog.identify(robustId);

        // Set user properties for segmentation
        posthog.people.set({
            $fingerprint: fingerprint,
            $device_type: components.deviceType,
            $os: components.OS,
            $os_version: components.OSVersion,
            $browser: components.browser,
            $browser_version: components.browserVersion,
            $timezone: components.timezone,
            $initial_referring_domain: document.referrer ? new URL(document.referrer).hostname : "",
            $initial_referrer: document.referrer || "",
        });

        // Add fingerprint to all future events
        posthog.register({
            fingerprint: fingerprint,
            robust_id: robustId
        });

        return robustId;
    } catch (error) {
        console.error('Error in identifyUser:', error);
        return generateFallbackId();
    }
};

/**
 * Get the fingerprint for use in specific events
 */
export const getFingerprint = () => {
    // Skip on server side
    if (typeof window === 'undefined') {
        return generateFallbackId('server');
    }

    try {
        // Get ClientJS instance
        const client = getClientJSInstance();

        if (!client) {
            return generateFallbackId();
        }

        return client.getFingerprint();
    } catch (error) {
        console.error('Error in getFingerprint:', error);
        return generateFallbackId();
    }
};

/**
 * Generates a fallback ID when ClientJS is unavailable
 */
function generateFallbackId(prefix: string = 'fb') {
    // If localStorage is available, try to use a stored ID
    if (typeof window !== 'undefined' && window.localStorage) {
        let fallbackId = localStorage.getItem('fallback_fingerprint');

        if (!fallbackId) {
            // Generate a simple random ID
            fallbackId = `${prefix}-${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem('fallback_fingerprint', fallbackId);
        }

        return fallbackId;
    }

    // When running on server or localStorage is unavailable
    return `${prefix}-${Date.now().toString(36)}`;
}