import { posthog } from "./posthog";

/**
 * Track key conversion events.
 * Call these from onClick handlers and form submissions.
 */
export const analytics = {
  /** User selected a path on the landing page */
  funnelRouted(category: "small-team" | "enterprise", destination: "small-teams" | "enterprise") {
    posthog.capture("funnel_routed", { team_category: category, destination });
  },

  /** User clicked "Start Free" or submitted the email capture form */
  trialStarted(email?: string) {
    posthog.capture("trial_started", { ...(email && { email }) });
  },

  /** User submitted the demo booking form */
  demoRequested(data?: Record<string, string>) {
    posthog.capture("demo_requested", data);
  },

  /** User clicked a button that opens the Cal.com booking embed */
  calModalOpened(source: string) {
    posthog.capture("cal_modal_opened", { source });
  },

  /** User clicked a CTA button (general tracking) */
  ctaClicked(label: string, page: string) {
    posthog.capture("cta_clicked", { label, page });
  },

  /** User clicked a non-enterprise plan signup from the enterprise page */
  planSignupClicked(plan: string) {
    posthog.capture("plan_signup_clicked", {
      plan,
      source: "enterprise_page",
    });
  },
};
