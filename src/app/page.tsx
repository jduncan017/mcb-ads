import { redirect } from "next/navigation";

/**
 * Root redirects to the Google Ads landing page.
 *
 * Was /general (the Meta funnel). Meta is paused, and /general's inline form
 * still pointed at HoneyBook placement 1 — which is now the MAIN SITE's form,
 * split off so main-site submissions stop redirecting through our /thank-you
 * page. A submission on /general would therefore fire no conversion and no
 * Slack alert, silently. Sending traffic to /google instead means every path
 * into this site lands on a page whose form is wired to a placement we own.
 *
 * To bring Meta back: give /general its own placement (see HoneyBookEmbed's
 * `placement` prop), then point this redirect back at it.
 */
export default function LandingPage() {
  redirect("/google");
}
