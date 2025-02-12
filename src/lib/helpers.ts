/**
 * Extracts the root domain from the environment variable `NEXT_PUBLIC_APP_URL`.
 *
 * This function takes the hostname from the given URL and returns only the root domain
 * (e.g., "example.com" from "app1.auth.example.com").
 *
 * @returns {string} The root domain (e.g., "example.com").
 * @throws {Error} If `NEXT_PUBLIC_APP_URL` is not defined or is an invalid URL.
 */
export function getRootDomain() {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("Environment variable NEXT_PUBLIC_APP_URL is not defined.");
  }

  const hostname = new URL(process.env.NEXT_PUBLIC_APP_URL as string).hostname;
  const parts = hostname.split(".");

  // If the hostname has only one part (e.g., "localhost" or "internal"), return it as is
  if (parts.length < 2) {
    return "https://" + hostname;
  }

  return "https://" + parts.slice(-2).join(".");
}
