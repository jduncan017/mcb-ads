/**
 * First-touch attribution capture.
 *
 * The HoneyBook booking form is a cross-origin iframe. When a visitor submits
 * it and HoneyBook redirects to /thank-you, that redirect carries NONE of our
 * original URL params (utm_*, gclid, etc.) — and we can never read the PII the
 * visitor typed into HoneyBook's iframe.
 *
 * What we CAN do is stash the ad attribution the moment the visitor lands, then
 * read it back on /thank-you to fire the Google Ads conversion + notify the
 * owner / n8n with the source. sessionStorage survives the in-tab redirect.
 *
 * This is attribution-only by design. The lead's name/email/event details live
 * in HoneyBook (which sends its own inquiry notification + handles follow-up).
 */

const KEY = "mcb:attribution";

export interface Attribution {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  landingUrl?: string;
  referrer?: string;
  capturedAt: number;
}

/** Ad-click / campaign params. If any is present the visit is attributable. */
const AD_PARAM_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

/**
 * Capture attribution from the current URL. First-touch by default, with two
 * guards learned the hard way:
 *
 * 1. Never capture on /thank-you. That page is the POST-submission destination
 *    reached via HoneyBook's redirect, which strips all params. Capturing there
 *    stores an empty attribution and — under the old first-touch-only rule —
 *    permanently locked it in, so a later real ad click could never overwrite
 *    it. That produced owner/Slack notifications with blank source fields.
 *
 * 2. Allow an "upgrade". If a stash already exists but has NO ad params, and the
 *    current URL DOES, overwrite it. A real ad click should always beat a
 *    previously recorded direct/organic visit in the same tab session.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    // Guard 1: /thank-you can never be a legitimate attribution landing page.
    if (window.location.pathname.startsWith("/thank-you")) return;

    const params = new URLSearchParams(window.location.search);
    const get = (k: string) => params.get(k) ?? undefined;

    const currentHasAdParams = AD_PARAM_KEYS.some((k) => params.get(k));

    // Guard 2: keep the existing stash unless this visit is a genuine upgrade.
    const existingRaw = sessionStorage.getItem(KEY);
    if (existingRaw) {
      let existingHasAdParams = false;
      try {
        const existing = JSON.parse(existingRaw) as Attribution;
        existingHasAdParams = Boolean(
          existing.gclid ??
            existing.gbraid ??
            existing.wbraid ??
            existing.fbclid ??
            existing.source ??
            existing.medium ??
            existing.campaign,
        );
      } catch {
        // Corrupt stash — treat as empty so it gets replaced.
      }
      // Already attributed, or nothing better on offer: leave it alone.
      if (existingHasAdParams || !currentHasAdParams) return;
    }

    const attribution: Attribution = {
      source: get("utm_source"),
      medium: get("utm_medium"),
      campaign: get("utm_campaign"),
      content: get("utm_content"),
      term: get("utm_term"),
      gclid: get("gclid"),
      gbraid: get("gbraid"),
      wbraid: get("wbraid"),
      fbclid: get("fbclid"),
      landingUrl: window.location.href,
      referrer: document.referrer || undefined,
      capturedAt: Date.now(),
    };

    // Only persist if there's something worth attributing. A bare organic/direct
    // visit with no params still records landingUrl/referrer, which is useful.
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage can throw in private mode / when disabled — non-fatal.
  }
}

export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

/**
 * True when this visitor arrived from a paid ad click we can attribute.
 *
 * Why this matters: the HoneyBook form's post-submit redirect is configured on
 * the FORM, not per-embed. The same form is also embedded on the main website
 * (www.mobilecraftbars.com/contact), so those submissions ALSO land on our
 * /thank-you page. Without this check we fire a Google Ads conversion for leads
 * that never touched an ad — Google discards them (no gclid) but it pollutes
 * reporting and makes the funnel look like it produced leads it didn't.
 *
 * Only a real click identifier counts. utm_source alone is not enough: it can
 * be hand-set on any link and does not represent a billable ad click.
 */
export function isAdAttributed(
  attribution: Attribution | null | undefined,
): boolean {
  if (!attribution) return false;
  return Boolean(
    attribution.gclid ?? attribution.gbraid ?? attribution.wbraid,
  );
}
