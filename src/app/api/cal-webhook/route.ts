import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Cal.com webhook handler for booking confirmations.
 *
 * When a booking is confirmed, checks for Meta ad attribution (utm_source or
 * fbclid) in the Cal.com booking responses. If present, fires a server-side
 * Meta Conversions API event so that only ad-attributed bookings are tracked.
 *
 * Cal.com stores query params passed via the booking link as hidden fields in
 * `payload.responses` (e.g. utm_source, fbclid).
 *
 * Setup:
 * 1. In Cal.com → Settings → Developer → Webhooks, add this URL and select "Booking Created"
 * 2. Set a webhook signing secret and add it as CAL_WEBHOOK_SECRET in your env
 * 3. Add META_PIXEL_ID and META_CONVERSIONS_API_TOKEN to your env
 * 4. (Optional) Add "fbclid" as a hidden booking question in Cal.com for click-level attribution
 */

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify Cal.com webhook signature
  const signature = request.headers.get("x-cal-signature-256");
  const secret = process.env.CAL_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as CalWebhookPayload;

  // Only process confirmed bookings
  if (payload.triggerEvent !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true });
  }

  // Cal.com sends responses and attendees at the top level of the payload
  const responses = payload.responses ?? {};
  const utmSource = getResponseValue(responses.utm_source);
  const fbclid = getResponseValue(responses.fbclid);

  const isFromMeta =
    fbclid ??
    (utmSource &&
      ["facebook", "fb", "ig", "instagram", "meta"].includes(
        utmSource.toLowerCase(),
      ));

  if (!isFromMeta) {
    return NextResponse.json({ ok: true, meta: false });
  }

  // Fire Meta Conversions API event
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    console.error("Meta Conversions API credentials not configured");
    return NextResponse.json(
      { error: "Meta API not configured" },
      { status: 500 },
    );
  }

  const eventTime = Math.floor(Date.now() / 1000);
  const email = payload.attendees?.[0]?.email;

  const eventData = {
    data: [
      {
        event_name: "Lead",
        event_time: eventTime,
        action_source: "website",
        user_data: {
          // Include fbc (click ID) only if fbclid was captured
          ...(fbclid && { fbc: `fb.1.${eventTime}.${fbclid}` }),
          ...(email && {
            em: [await hashSHA256(email.toLowerCase().trim())],
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
    console.error("Meta Conversions API error:", err);
    return NextResponse.json(
      { error: "Meta API request failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, meta: true });
}

/** Extract the string value from a Cal.com response field */
function getResponseValue(
  field: { value?: string } | undefined,
): string | undefined {
  if (!field?.value) return undefined;
  if (typeof field.value === "string" && field.value.length > 0)
    return field.value;
  return undefined;
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface CalWebhookPayload {
  triggerEvent: string;
  responses?: Record<string, { value?: string }>;
  attendees?: { email?: string }[];
}
