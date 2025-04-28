import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import adminEmails from "./admin-emails.json";

const isPublicRoute = createRouteMatcher(["/api/blogs(.*)", "/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();

    const { sessionClaims } = await auth();
    const email = sessionClaims?.email;

    if (email) {
      const isAdmin = adminEmails.includes(email as string);
      if (!isAdmin) {
        await auth.protect(() => {
          return false;
        });
      }
    } else {
      await auth.protect(() => {
        return false;
      });
    }
  }

  // if (sessionClaims?.email) {
  //   const email = sessionClaims?.email;
  //   const isAdmin = adminEmails.includes(email);
  //   if (!isAdmin) {
  //     await auth.protect(() => {
  //       return false;
  //     });
  //   }
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
