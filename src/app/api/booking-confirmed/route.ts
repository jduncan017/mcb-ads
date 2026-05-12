import { type NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import crypto from "crypto";
import { captureServerEvent } from "~/lib/posthog-server";
import { env } from "~/env";

/**
 * Client-app-triggered booking confirmation endpoint.
 *
 * Free-tier alternative to a real Calendly webhook. The /book page POSTs here
 * when Calendly's iframe fires `calendly.event_scheduled`. This endpoint
 * replicates what /api/cal-webhook would do if Calendly Standard ($10/mo) had
 * been enabled and a real webhook configured.
 *
 * Two side effects:
 * 1. PostHog server-side `calendly_booked` event (distinct_id = email hash so
 *    it ties to the same person as the modal-side and client-side fires)
 * 2. Meta Conversions API `Schedule` event for Meta-attributed bookings, with
 *    `event_id` matching the client-side browser pixel for deduplication
 *
 * Reliability tradeoff vs real webhook: this depends on the visitor's browser
 * staying open long enough to fire the POST. In practice that's ~99% of cases
 * because the request is small and fast. Real webhook would survive tab close.
 *
 * Auth: only checks Origin header against an allowlist. Not bulletproof, but
 * sufficient for transactional events whose worst-case abuse is fake event
 * volume in PostHog (no money flow, no PII exposure).
 */

const ALLOWED_ORIGINS = new Set([
  "https://book.mobilecraftbars.com",
  "https://www.mobilecraftbars.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);

interface BookingConfirmedPayload {
  eventId?: string;
  email?: string;
  name?: string;
  eventType?: string;
  guestCount?: string;
  when?: string;
  budget?: string;
  source?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    fbclid?: string;
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
  };
  pageUrl?: string;
}

export async function POST(request: NextRequest) {
  // Origin gate. We only accept POSTs from our own domain.
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: BookingConfirmedPayload;
  try {
    payload = (await request.json()) as BookingConfirmedPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { eventId, email, eventType, guestCount, when, budget, source, utm } =
    payload;

  // ── PostHog: calendly_booked (server-side) ────────────────────────────────
  if (email) {
    try {
      const distinctId = await hashSHA256(email.toLowerCase().trim());
      await captureServerEvent({
        distinctId,
        event: "calendly_booked",
        properties: {
          eventType,
          guestCount,
          when,
          budget,
          source,
          utm_source: utm?.source,
          utm_medium: utm?.medium,
          utm_campaign: utm?.campaign,
          utm_content: utm?.content,
          fbclid_present: !!utm?.fbclid,
          gclid_present: !!(utm?.gclid ?? utm?.gbraid ?? utm?.wbraid),
          eventId,
        },
      });
    } catch (err) {
      console.error("[booking-confirmed] PostHog capture failed:", err);
    }
  } else {
    console.warn(
      "[booking-confirmed] No email in payload — PostHog capture skipped",
    );
  }

  // ── n8n webhook: post-booking automations ────────────────────────────────
  // Run after the response is sent so SMS/email/Slack workflows don't block
  // the user's redirect to /thank-you. `after()` keeps the serverless
  // function alive past the response — a bare fire-and-forget fetch gets
  // killed when the function returns in Vercel.
  const n8nUrl = env.N8N_BOOKING_WEBHOOK_URL;
  if (n8nUrl) {
    after(async () => {
      try {
        const res = await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.error("[booking-confirmed] n8n webhook non-2xx:", res.status);
        }
      } catch (err) {
        console.error("[booking-confirmed] n8n webhook failed:", err);
      }
    });
  }

  // ── Meta Conversions API: Schedule ────────────────────────────────────────
  // Only fire for Meta-attributed bookings. Email match alone gives "okay"
  // attribution; with fbc (from fbclid) it gives "strong" attribution.
  const fbclid = utm?.fbclid;
  const utmSource = utm?.source?.toLowerCase();
  const isFromMeta =
    !!fbclid ||
    (!!utmSource &&
      ["facebook", "fb", "ig", "instagram", "meta"].includes(utmSource));

  if (!isFromMeta) {
    return NextResponse.json({ ok: true, meta: false });
  }

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn(
      "[booking-confirmed] Meta CAPI not configured — server-side Schedule skipped",
    );
    return NextResponse.json({ ok: true, meta: false, reason: "not_configured" });
  }

  const eventTime = Math.floor(Date.now() / 1000);
  const testEventCode = process.env.META_TEST_EVENT_CODE;
  const eventData = {
    data: [
      {
        event_name: "Schedule",
        event_time: eventTime,
        action_source: "website",
        event_source_url: payload.pageUrl,
        // event_id matches what /book passed to fbq("Schedule", ..., {eventID})
        // so Meta dedupes the browser pixel fire against this server fire.
        ...(eventId && { event_id: eventId }),
        custom_data: {
          content_category: eventType,
          guest_count: guestCount,
          budget,
        },
        user_data: {
          ...(fbclid && { fbc: `fb.1.${eventTime}.${fbclid}` }),
          ...(email && {
            em: [await hashSHA256(email.toLowerCase().trim())],
          }),
        },
      },
    ],
    ...(testEventCode && { test_event_code: testEventCode }),
  };

  try {
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
      console.error("[booking-confirmed] Meta CAPI error:", err);
      return NextResponse.json(
        { ok: true, meta: false, error: "meta_failed" },
        { status: 200 }, // Don't fail the whole request just because Meta did
      );
    }
  } catch (err) {
    console.error("[booking-confirmed] Meta CAPI fetch failed:", err);
    return NextResponse.json({ ok: true, meta: false, error: "meta_fetch_failed" });
  }

  return NextResponse.json({ ok: true, meta: true });
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
