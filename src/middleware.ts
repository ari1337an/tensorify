import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import adminEmails from "./admin-emails.json";
import { getUserEmailFromUserId } from "./server/actions/user";

const isPublicRoute = createRouteMatcher(["/api/public(.*)", "/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const userId = (await auth()).userId;
  if (userId) {
    const email = await getUserEmailFromUserId(userId);

    if (!email) {
      await auth.protect(() => {
        return false;
      });
    } else {
      // Check if user is admin using the pre-generated JSON file
      const isAdmin = adminEmails.includes(email);

      if (!isAdmin) {
        await auth.protect(() => {
          return false;
        });
      }
    }
  } else {
    await auth.protect(() => {
      return false;
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
