import db from "@/server/database/db";
import { auth } from "@clerk/nextjs/server";
import AppWrapper from "@enterprise/_components/layout/AppWrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentSlugFromHost } from "@/server/utils/getCurrentSlugFromHost";

// Helper function to generate redirect URL based on environment
async function generateRedirectUrl(slug: string): Promise<string> {
  if (process.env.NODE_ENV === "production") {
    return `https://${slug}.app.tensorify.io`;
  } else {
    const port = process.env.PORT || "3000";
    return `http://${slug}.localhost:${port}`;
  }
}

/**
 * Checks if a user is onboarded and handles redirection.
 * A user is onboarded if:
 * 1. They have created an organization.
 * 2. They are a member of an organization.
 * 3. They have a pending invitation.
 * 
 * Redirects to:
 * - Login if not authenticated.
 * - Onboarding if not onboarded and no pending invitation.
 * - Accept invitation if there's a pending invitation.
 * - The correct organization subdomain if onboarded.
 * - 404 if subdomain access is invalid.
 */
async function checkUserOnboarded(): Promise<{ redirect?: string } | null> {
  const { sessionClaims } = await auth();
  const email = sessionClaims?.email;

  if (!email) {
    return null; // User not authenticated
  }

  try {
    // Fetch user with created organizations and memberships
    const user = await db.user.findFirst({
      where: { email: email as string },
      select: {
        createdOrgs: true,
        memberships: { include: { organization: true } },
      },
    });

    const host = (await headers()).get("host") || "";
    const currentSlug = await getCurrentSlugFromHost(host);

    // Check if user is onboarded
    const createdOrgs = user?.createdOrgs || [];
    const memberships = user?.memberships.map((m) => m.organization) || [];
    const allOrgs = [...createdOrgs, ...memberships];

    if (allOrgs.length > 0) {
      // User is onboarded
      const defaultOrg = allOrgs[0]; // Use first org as default

      if (currentSlug) {
        // Validate current subdomain
        const org = allOrgs.find((o) => o.slug === currentSlug);
        if (!org) {
          if (process.env.NODE_ENV === "production") {
            return { redirect: "https://app.tensorify.io" };
          } else {
            const port = process.env.PORT || "3000";
            return { redirect: `http://localhost:${port}` };
          }
        }
        // Correct subdomain, proceed without redirect
        return null;
      } else {
        // No subdomain, redirect to default org
        return { redirect: await generateRedirectUrl(defaultOrg.slug) };
      }
    } else {
      // User not onboarded, check for pending invitations
      const pendingInvitation = await db.invitation.findFirst({
        where: {
          email: email as string,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      });

      if (pendingInvitation) {
        return { redirect: "/onboarding/accept-invitation" };
      }
      return { redirect: "/onboarding" };
    }
  } catch (error) {
    console.error("Error in checkUserOnboarded:", error);
    return { redirect: "/onboarding" }; // Fallback
  }
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await checkUserOnboarded();
  
  if(result && result.redirect){
    redirect(result.redirect);
  }

  return <AppWrapper>{children}</AppWrapper>;
}