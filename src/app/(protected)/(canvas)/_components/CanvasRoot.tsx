import { headers } from "next/headers";

export async function CanvasRoot() {
  // Get the host from headers
  const host = (await headers()).get("host") || "";

  // Extract organization slug from subdomain
  let orgSlug: string | null = null;

  if (process.env.NODE_ENV === "production") {
    // Production: https://{org-slug}.app.tensorify.io
    if (host.endsWith("app.tensorify.io") && host !== "app.tensorify.io") {
      orgSlug = host.split(".app.tensorify.io")[0];
    }
  } else {
    // Development: http://{org-slug}.localhost:PORT
    // Make the port agnostic by splitting on .localhost first
    if (host.includes(".localhost")) {
      const hostnameParts = host.split(".");
      if (hostnameParts.length >= 2 && hostnameParts[0] !== "localhost") {
        orgSlug = hostnameParts[0];
      }
    }
  }

  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-2.75rem)] bg-background">
      <div className="text-center max-w-md p-6 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium mb-2">
          {orgSlug ? `Organization: ${orgSlug}` : "Cannot found, onboard first"}
        </h3>
        <p className="text-muted-foreground text-sm">
          This is the app&apos;s workflow canvas, where you can create and edit
          workflows using drag and drop functionality. The implementation of the
          drag and drop feature will be added later.
        </p>
      </div>
    </div>
  );
}
