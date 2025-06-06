// Helper function to extract the current subdomain/slug based on environment
export async function getCurrentSlugFromHost(host: string): Promise<string | null> {
  if (process.env.NODE_ENV === "production") {
    if (host === "app.tensorify.io") return null; // Main domain, no subdomain
    const parts = host.split(".app.tensorify.io");
    return parts.length > 1 ? parts[0] : null;
  } else {
    if (!host.includes(".localhost")) return null; // No subdomain in dev
    const parts = host.split(".localhost");
    return parts.length > 1 ? parts[0] : null;
  }
}