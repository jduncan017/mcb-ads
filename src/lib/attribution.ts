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

/**
 * Capture attribution from the current URL. First-touch: once stored, repeat
 * calls (e.g. client navigation to another page) are no-ops so we keep the
 * params from the ad-click landing rather than overwriting with a bare path.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const get = (k: string) => params.get(k) ?? undefined;

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
