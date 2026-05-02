import { PostHog } from "posthog-node";

/**
 * Server-side PostHog client for capturing events from API routes.
 *
 * Used when the visitor has already left the site (e.g. Calendly booking
 * confirmation webhook) so we can't capture the event via the browser SDK.
 *
 * Reuses the public project key (NEXT_PUBLIC_POSTHOG_KEY). PostHog's project
 * key is safe to use on both client and server. The host is also reused.
 */

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (client) return client;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  if (!key) return null;

  client = new PostHog(key, {
    host,
    // We're firing single events from short-lived serverless invocations.
    // Flush quickly so the lambda doesn't exit before the request lands.
    flushAt: 1,
    flushInterval: 0,
  });

  return client;
}

/**
 * Capture a server-side event. Awaits the flush so the event lands before
 * the serverless function returns. Use a stable distinct_id (typically the
 * visitor's email hash) so the event ties to their browser-side identity.
 */
export async function captureServerEvent(args: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const ph = getClient();
  if (!ph) {
    console.warn(
      "[posthog-server] NEXT_PUBLIC_POSTHOG_KEY not set — skipping capture",
    );
    return;
  }

  ph.capture({
    distinctId: args.distinctId,
    event: args.event,
    properties: args.properties,
  });

  // Ensure events flush before the serverless invocation exits.
  await ph.shutdown();
  client = null;
}
