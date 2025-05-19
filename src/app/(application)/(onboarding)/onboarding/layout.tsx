"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import db from "@/server/database/db";

/**
 * Gets the redirect URL for a user based on organization slug
 * Returns the URL if a redirect is needed, null otherwise
 */
async function getRedirectUrl(userId: string): Promise<string | null> {
  try {
    // Check if user already has an organization
    const user = await db.user.findUnique({
      where: { userId },
      include: {
        organization: true,
      },
    });

    // If user has an organization, redirect to their org subdomain
    if (user?.organization) {
      const organizationSlug = user.organization.slug;
      const host = (await headers()).get("host") || "";

      if (process.env.NODE_ENV === "production") {
        return `https://${organizationSlug}.app.tensorify.io`;
      } else {
        const port = host.includes(":") ? `:${host.split(":")[1]}` : ":3000";
        return `http://${organizationSlug}.localhost${port}`;
      }
    }
  } catch (error) {
    console.error("Error checking user organization:", error);
  }

  return null;
}

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get authenticated user
  const { userId } = await auth();

  if (userId) {
    // Check if the user should be redirected
    const redirectUrl = await getRedirectUrl(userId);

    if (redirectUrl) {
      // In development we need to handle redirects differently
      if (process.env.NODE_ENV === "development") {
        // This will be used by client-side navigation
        return (
          <html>
            <head>
              {/* Meta refresh as a fallback */}
              <meta httpEquiv="refresh" content={`0;url=${redirectUrl}`} />
              {/* Script for immediate redirect */}
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.location.href = "${redirectUrl}";`,
                }}
              />
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .animate-spin {
                  animation: spin 1.5s linear infinite;
                }
                .text-primary {
                  color: hsl(240 5.9% 10%);
                }
                .text-foreground {
                  color: hsl(240 10% 3.9%);
                }
                .bg-background {
                  background-color: hsl(0 0% 100%);
                }
                @media (prefers-color-scheme: dark) {
                  .text-primary {
                    color: hsl(240 5% 84.9%);
                  }
                  .text-foreground {
                    color: hsl(0 0% 98%);
                  }
                  .bg-background {
                    background-color: hsl(240 10% 3.9%);
                  }
                }
              `,
                }}
              />
            </head>
            <body className="bg-background flex flex-col items-center justify-center h-screen">
              <div className="flex flex-col items-center gap-4">
                {/* Loader SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin text-primary"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <p className="text-2xl text-foreground font-medium">
                  Redirecting to your workspace...
                </p>
              </div>
            </body>
          </html>
        );
      }

      // In production, use the Next.js redirect
      redirect(redirectUrl);
    }
  }

  // If no user or no organization, continue with onboarding
  return <>{children}</>;
}
