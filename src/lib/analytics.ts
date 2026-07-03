import { posthog } from "./posthog";

/**
 * PostHog event capture for the discovery funnel.
 *
 * Funnel structure:
 *   Pageview -> CalButton click -> cal_modal_opened -> modal questions
 *               -> modal_friction_shown / modal_decline_shown (some users)
 *               -> lead_submitted -> Calendly redirect -> calendly_booked
 *
 * Each CTA button on the page has unique text. cal_modal_opened fires with
 * `source` = the visible button text, so PostHog funnels and breakdowns can
 * distinguish hero vs nav vs final-cta performance directly by what users see.
 *
 * `calendly_booked` is fired server-side from /api/cal-webhook in lib/posthog-server.ts
 * because by then the visitor has left the site.
 */
export const analytics = {
  /**
   * Fires when a CalButton click opens the DiscoveryModal.
   * `source` is the rendered button text (e.g. "Plan My Event").
   */
  calModalOpened(source: string) {
    posthog.capture("cal_modal_opened", { source });
  },

  /**
   * Fires when the friction screen is shown (budget = $1k-$1.5k or "Need a recommendation").
   * Lets us measure how many mid-budget visitors continue vs bail.
   */
  modalFrictionShown(source: string) {
    posthog.capture("modal_friction_shown", { source });
  },

  /**
   * Fires when the auto-decline screen is shown (budget = "Under $1,000")
   * OR when a user hits "Above my budget" on the friction screen.
   */
  modalDeclineShown(source: string, reason: "auto" | "friction_no") {
    posthog.capture("modal_decline_shown", { source, reason });
  },

  /**
   * Fires when /api/discovery-lead has been hit successfully.
   * `qualified` separates real leads (going to Calendly) from soft-decline notes.
   */
  leadSubmitted(props: {
    source: string;
    qualified: boolean;
    eventType?: string;
    guestCount?: string;
    when?: string;
    budget?: string;
  }) {
    posthog.capture("lead_submitted", props);
  },

  // --- HoneyBook inline-form era (June 2026+) ---
  // The HoneyBook embed is a cross-origin iframe, so we can't see field-level
  // interaction. These events bracket the blind spot: CTA click -> form loaded
  // -> form seen -> (HoneyBook redirect to /thank-you?booked=1 = submit).

  /**
   * Fires when any CalButton CTA is clicked (now scrolls to #book).
   * `source` is the rendered button text so funnels can break down by CTA.
   */
  ctaClicked(source: string) {
    posthog.capture("cta_clicked", { source });
  },

  /** Fires once when the HoneyBook placement iframe renders into the page. */
  honeybookEmbedLoaded() {
    posthog.capture("honeybook_embed_loaded");
  },

  /** Fires once when the HoneyBook form scrolls meaningfully into view. */
  honeybookFormViewed() {
    posthog.capture("honeybook_form_viewed");
  },

  /** Fires once per depth milestone (25/50/75/100) per pageview. */
  scrollDepthReached(depth: number) {
    posthog.capture("scroll_depth_reached", { depth });
  },
};
