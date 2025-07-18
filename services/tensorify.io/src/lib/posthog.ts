import { PostHog } from "posthog-node"

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })

  return posthogClient
}

/**
 * Use this function to track server-side events
 * Call it from server components or API routes 
 * and pass the fingerprint from client-side
 */
export async function trackServerEvent(
  event: string,
  properties: Record<string, string | number | boolean> = {},
  distinctId?: string
) {
  const client = PostHogClient();

  if (distinctId) {
    await client.capture({
      distinctId,
      event,
      properties
    });
  }

  client.shutdown();
}