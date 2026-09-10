import { redirect } from "next/navigation";

/**
 * /general — the Meta funnel — now redirects to /google.
 *
 * WHY THIS IS A REDIRECT AND NOT A PAGE
 * The education-first Meta funnel used to live here. Its inline form rendered
 * HoneyBook placement 1, which is now the MAIN SITE's contact form: that form
 * was split onto its own placement so main-site submissions stop redirecting
 * through book.mobilecraftbars.com/thank-you and inflating funnel numbers.
 *
 * The consequence is that a submission on this page would no longer land on
 * our /thank-you page, so it would fire no Google Ads conversion and no Slack
 * alert, with nothing visibly broken on screen. Meta is paused, so the page
 * has no traffic to lose, and a silent tracking hole is a worse thing to leave
 * lying around than a redirect.
 *
 * TO BRING THE META FUNNEL BACK
 *   1. Restore the page:  git show 1cbb20a:src/app/general/page.tsx > src/app/general/page.tsx
 *   2. Create a dedicated HoneyBook placement for it, with its post-submit
 *      redirect set to /thank-you?booked=1
 *   3. Pass it in:  <HoneyBookEmbed placement={N} />
 *   4. Point src/app/page.tsx back at /general if you want it as the root.
 * Do not skip step 2. That is the whole reason this page is a redirect.
 */
export default function GeneralFunnelPage() {
  redirect("/google");
}
