"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import db from "@/server/database/db";
import { InvitationStatus } from "@prisma/client";

/**
 * Checks if a user is onboarded (has an organization) and manages redirections:
 * - If not onboarded: redirects to the onboarding page
 * - If onboarded but accessing via wrong domain: redirects to organization-specific subdomain
 *
 * This function is designed to be called from protected routes to ensure proper routing.
 */
export async function checkUserOnboarded() {
  // Get authenticated user
  const { sessionClaims } = await auth();
  const email = sessionClaims?.email;

  if (!email) {
    // User is not authenticated, let the middleware handle auth redirects
    return;
  }

  try {
    // Find user with organization
    const user = await db.user.findUnique({
      where: { email: email as string },
      include: {
        organization: true,
      },
    });

    // User exists but doesn't have an organization - redirect to onboarding
    if (!user?.organization) {
      // User exists but doesn't have an organization.
      // Check for a pending invitation before redirecting to general onboarding.
      const pendingInvitation = await db.invitation.findFirst({
        where: {
          email: email as string,
          status: InvitationStatus.PENDING,
          expiresAt: { gt: new Date() },
        },
      });

      if (pendingInvitation) {
        // User has a pending invitation, redirect to accept invitation page.
        const acceptInvitePath = "/onboarding/accept-invitation";
        if (process.env.NODE_ENV === "development") {
          return { redirect: acceptInvitePath };
        }
        return redirect(acceptInvitePath);
      }

      // No organization and no pending invitation, redirect to standard onboarding.
      if (process.env.NODE_ENV === "development") {
        return { redirect: "/onboarding" };
      }
      return redirect("/onboarding");
    }

    // User has an organization - check if we need to redirect to the proper subdomain
    const organizationSlug = user.organization.slug;

    // Get current hostname from request headers
    const host = (await headers()).get("host") || "";
    let currentSlug: string | null = null;

    if (process.env.NODE_ENV === "production") {
      // Production: Pattern is {org-slug}.app.tensorify.io
      if (host === "app.tensorify.io") {
        // We're on the main domain but should be on the org subdomain
        return redirect(`https://${organizationSlug}.app.tensorify.io`);
      } else if (host.endsWith(".app.tensorify.io")) {
        currentSlug = host.split(".app.tensorify.io")[0];
      }
    } else {
      // Development: Pattern is {org-slug}.localhost:PORT
      if (host === "localhost" || !host.includes(".")) {
        // Handle case like localhost:3000
        // For development environment, return redirect information instead of redirect()
        const port = host.includes(":") ? `:${host.split(":")[1]}` : ":3000";
        return { redirect: `http://${organizationSlug}.localhost${port}` };
      } else if (host.includes(".localhost")) {
        // Get the subdomain from development URL
        const hostParts = host.split(".");
        currentSlug = hostParts[0];
      }
    }

    // If we're on a subdomain but it's not the user's organization subdomain
    if (currentSlug && currentSlug !== organizationSlug) {
      if (process.env.NODE_ENV === "production") {
        return redirect(`https://${organizationSlug}.app.tensorify.io`);
      } else {
        const port = host.includes(":") ? `:${host.split(":")[1]}` : ":3000";
        // For development environment, return redirect information instead of redirect()
        return { redirect: `http://${organizationSlug}.localhost${port}` };
      }
    }

    // Everything is good, user is onboarded and on the correct subdomain
    return;
  } catch (error) {
    console.error("Error in checkUserOnboarded:", error);

    // In development, provide more detailed error information
    if (process.env.NODE_ENV === "development") {
      console.error("Error details:", error);
      return { redirect: "/onboarding" };
    }

    // On error, redirect to onboarding as a fallback
    return redirect("/onboarding");
  }
}
