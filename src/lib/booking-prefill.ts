/**
 * sessionStorage shuttle for booking data between the discovery modal,
 * the Calendly inline embed page (/book), and the confirmation page (/thank-you).
 *
 * sessionStorage is preferred over URL params because:
 *  - PII (name, email) doesn't end up in browser history or referer headers
 *  - Survives a route change without bloating the URL
 *  - Cleared when the tab closes (transient by design)
 *
 * Each modal submission generates a fresh `eventId` (used as Calendly's
 * `salesforce_uuid` so the cal-webhook can dedupe Meta's CAPI Schedule fire
 * against the client-side Schedule fire).
 */

const STORAGE_KEY = "mcb:booking-prefill";

export interface BookingPrefill {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  eventDetails?: string;
  eventType?: string;
  guestCount?: string;
  when?: string;
  budget?: string;
  /** Which CTA button text triggered the modal (analytics source). */
  source: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    fbclid?: string;
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
  };
  /** Unix ms for staleness checks. */
  storedAt: number;
}

type StashInput = Omit<BookingPrefill, "eventId" | "storedAt"> & {
  /** Reuse an existing event_id (e.g. the one already used for the Lead fire). */
  eventId?: string;
};

/**
 * Stash the prefill in sessionStorage. Generates a fresh event_id if the caller
 * doesn't provide one. Returns the stashed object so callers can use the
 * eventId immediately.
 */
export function stashBookingPrefill(input: StashInput): BookingPrefill {
  const eventId =
    input.eventId ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const stash: BookingPrefill = {
    ...input,
    eventId,
    storedAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stash));
    } catch {
      // Some users disable sessionStorage. Embed will still work, just
      // without prefill or eventId-based CAPI deduplication.
    }
  }

  return stash;
}

/**
 * Read the stashed prefill from sessionStorage. Returns null if absent
 * or stale (>2 hours old to handle abandoned tabs gracefully).
 */
export function readBookingPrefill(): BookingPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingPrefill;
    if (!parsed.eventId || !parsed.email || !parsed.firstName) return null;
    const ageMs = Date.now() - (parsed.storedAt ?? 0);
    if (ageMs > 2 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Clear the stashed prefill. Call after /thank-you renders so a fresh
 * tab visit doesn't re-render someone else's stale data.
 */
export function clearBookingPrefill(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // best effort
  }
}
