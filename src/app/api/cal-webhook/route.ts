import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { captureServerEvent } from "~/lib/posthog-server";

/**
 * Calendly webhook handler for booking confirmations.
 *
 * Two side effects when an `invitee.created` event arrives:
 *
 * 1. PostHog `calendly_booked` event for every confirmed booking. distinct_id
 *    is the SHA-256 hash of the attendee's email so it ties to the visitor's
 *    browser-side identity from the discovery modal.
 * 2. Meta Conversions API `Schedule` event for Meta-attributed bookings (via
 *    utm_source = facebook/ig/etc OR fbclid). Always sends hashed email so
 *    Meta can dedupe against the pixel.
 *
 * Calendly webhook v2 signature:
 * - Header: `Calendly-Webhook-Signature: t=<unix-ts>,v1=<hex-hmac>`
 * - HMAC-SHA256 of `${timestamp}.${rawBody}` using the signing key
 *
 * Calendly payload (relevant subset):
 * - event: "invitee.created"
 * - payload.email, payload.name
 * - payload.questions_and_answers: [{ question, answer }, ...]
 * - payload.tracking: { utm_source, utm_medium, utm_campaign, ... }
 *
 * Setup checklist:
 * 1. Calendly: Integrations > Webhooks > Add. URL = https://book.mobilecraftbars.com/api/cal-webhook
 * 2. Subscribe to `invitee.created`
 * 3. Generate the signing key, store it as CAL_WEBHOOK_SECRET in Vercel env
 * 4. (Optional) Add a hidden custom question in Calendly that captures fbclid
 *    from URL params for click-level attribution beyond the email match
 */

const SIGNATURE_MAX_AGE_SECONDS = 300; // 5 min replay window

export async function POST(request: NextRequest) {
  const body = await request.text();
  const secret = process.env.CAL_WEBHOOK_SECRET;
  const sigHeader = request.headers.get("calendly-webhook-signature");

  if (!secret) {
    console.error("[cal-webhook] CAL_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (!sigHeader) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const sig = parseCalendlySignature(sigHeader);
  if (!sig) {
    return NextResponse.json(
      { error: "Malformed signature header" },
      { status: 401 },
    );
  }

  // Replay protection: reject signatures older than 5 minutes.
  const ageSec = Math.floor(Date.now() / 1000) - Number(sig.timestamp);
  if (Number.isNaN(ageSec) || ageSec < 0 || ageSec > SIGNATURE_MAX_AGE_SECONDS) {
    return NextResponse.json({ error: "Stale signature" }, { status: 401 });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${sig.timestamp}.${body}`)
    .digest("hex");

  if (!safeCompare(expected, sig.signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: CalendlyWebhookPayload;
  try {
    payload = JSON.parse(body) as CalendlyWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // We only care about new bookings. Cancellations etc. pass through silently.
  if (payload.event !== "invitee.created") {
    return NextResponse.json({ ok: true, ignored: payload.event });
  }

  const inv = payload.payload ?? {};
  const attendeeEmail = inv.email;
  const tracking = inv.tracking ?? {};
  const utmSource = tracking.utm_source;
  const qa = inv.questions_and_answers ?? [];

  // event_id rides through Calendly via the salesforce_uuid tracking field
  // (set by the modal -> /book embed via the JS API's prefill.utm.salesforceUuid).
  // Used to dedupe this server-side Schedule fire against the client-side
  // Schedule fire from /book on calendly.event_scheduled.
  const eventId = tracking.salesforce_uuid;

  // Map the modal's 4 questions back from Calendly's question_and_answer
  // array. We match by question text content rather than position so the
  // route doesn't break if James reorders the questions in Calendly later.
  const eventType = findAnswer(qa, /event/i, /kind|planning/i);
  const guestCount = findAnswer(qa, /guest/i);
  const when = findAnswer(qa, /when/i);
  const budget = findAnswer(qa, /budget/i);

  // fbclid: only present if a hidden-field question is configured in Calendly
  // to capture it from URL params. Optional.
  const fbclid = findAnswer(qa, /fbclid/i);

  // ── PostHog: calendly_booked ──────────────────────────────────────────────
  if (attendeeEmail) {
    try {
      const distinctId = await hashSHA256(attendeeEmail.toLowerCase().trim());
      await captureServerEvent({
        distinctId,
        event: "calendly_booked",
        properties: {
          eventType,
          guestCount,
          when,
          budget,
          utm_source: utmSource,
          utm_medium: tracking.utm_medium,
          utm_campaign: tracking.utm_campaign,
          fbclid_present: !!fbclid,
        },
      });
    } catch (err) {
      console.error("[cal-webhook] PostHog capture failed:", err);
    }
  } else {
    console.warn(
      "[cal-webhook] No attendee email on invitee.created payload — PostHog event skipped",
    );
  }

  // ── Meta Conversions API: Schedule ────────────────────────────────────────
  const isFromMeta =
    !!fbclid ||
    (!!utmSource &&
      ["facebook", "fb", "ig", "instagram", "meta"].includes(
        utmSource.toLowerCase(),
      ));

  if (!isFromMeta) {
    return NextResponse.json({ ok: true, meta: false });
  }

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !accessToken) {
    console.error("[cal-webhook] Meta CAPI credentials not configured");
    return NextResponse.json(
      { error: "Meta API not configured" },
      { status: 500 },
    );
  }

  const eventTime = Math.floor(Date.now() / 1000);
  const eventData = {
    data: [
      {
        event_name: "Schedule",
        event_time: eventTime,
        action_source: "website",
        // event_id deduplicates this server-side fire against the client-side
        // Schedule fire from /book. Both must match for Meta to dedupe.
        ...(eventId && { event_id: eventId }),
        user_data: {
          ...(fbclid && { fbc: `fb.1.${eventTime}.${fbclid}` }),
          ...(attendeeEmail && {
            em: [await hashSHA256(attendeeEmail.toLowerCase().trim())],
          }),
        },
      },
    ],
  };

  const metaResponse = await fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    },
  );

  if (!metaResponse.ok) {
    const err = await metaResponse.text();
    console.error("[cal-webhook] Meta CAPI error:", err);
    return NextResponse.json(
      { error: "Meta API request failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, meta: true });
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Parse Calendly's signature header in the form `t=<unix>,v1=<hex>`.
 * Returns null if the header is malformed or missing required fields.
 */
function parseCalendlySignature(
  header: string,
): { timestamp: string; signature: string } | null {
  const fields: Record<string, string> = {};
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k && v) fields[k] = v;
  }
  if (!fields.t || !fields.v1) return null;
  return { timestamp: fields.t, signature: fields.v1 };
}

/**
 * Constant-time string compare using Node's timingSafeEqual.
 * Returns false (not throws) on length mismatch.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

/**
 * Find the first questions_and_answers entry whose `question` text matches
 * every supplied regex. Returns the trimmed answer or undefined.
 */
function findAnswer(
  qa: { question?: string; answer?: string }[],
  ...patterns: RegExp[]
): string | undefined {
  for (const item of qa) {
    if (!item.question || !item.answer) continue;
    if (patterns.every((p) => p.test(item.question!))) {
      const answer = item.answer.trim();
      if (answer.length > 0) return answer;
    }
  }
  return undefined;
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// Types
// ============================================================================

interface CalendlyTracking {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  salesforce_uuid?: string;
}

interface CalendlyQA {
  question?: string;
  answer?: string;
}

interface CalendlyInvitee {
  uri?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  questions_and_answers?: CalendlyQA[];
  tracking?: CalendlyTracking;
  scheduled_event?: {
    uri?: string;
    name?: string;
    start_time?: string;
    end_time?: string;
  };
}

interface CalendlyWebhookPayload {
  event: string; // e.g. "invitee.created"
  created_at?: string;
  payload?: CalendlyInvitee;
}
