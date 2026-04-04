import { posthog } from "./posthog";

/**
 * Track key conversion events.
 * Call these from onClick handlers and form submissions.
 *
 * Funnel structure:
 *   Pageview → pricing_viewed → [B2C] plan_signup_clicked
 *                              → [B2B] cal_modal_opened
 */
export const analytics = {
  // ── Funnel step ──────────────────────────────────────────
  /** User clicked "View Pricing" — key mid-funnel engagement signal */
  pricingViewed(source: string) {
    posthog.capture("pricing_viewed", { source });
  },

  // ── B2C conversion ───────────────────────────────────────
  /** User clicked a non-enterprise plan signup (Basic/Creator/Pro) */
  planSignupClicked(plan: string) {
    posthog.capture("plan_signup_clicked", {
      plan,
      source: "enterprise_page",
    });
  },

  // ── B2B conversion ───────────────────────────────────────
  /** User clicked "Book a Demo" — opens Cal.com booking */
  calModalOpened(source: string) {
    posthog.capture("cal_modal_opened", { source });
  },

  // ── Legacy / secondary ───────────────────────────────────
  /** User selected a path on the old splash page (currently unused — page redirects to /enterprise) */
  funnelRouted(category: "small-team" | "enterprise", destination: "small-teams" | "enterprise") {
    posthog.capture("funnel_routed", { team_category: category, destination });
  },

  /** User clicked "Start Free" or submitted the email capture form (unused on /enterprise) */
  trialStarted(email?: string) {
    posthog.capture("trial_started", { ...(email && { email }) });
  },

  /** User submitted the inline demo form (unused on /enterprise — uses CalButton instead) */
  demoRequested(data?: Record<string, string>) {
    posthog.capture("demo_requested", data);
  },
};
