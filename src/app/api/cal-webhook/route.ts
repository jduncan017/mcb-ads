import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Cal.com webhook handler for booking confirmations.
 *
 * When a booking is confirmed, checks for Meta ad attribution (fbclid) in the
 * booking metadata. If present, fires a server-side Meta Conversions API event
 * so that only ad-attributed bookings are tracked as conversions.
 *
 * Setup:
 * 1. In Cal.com → Settings → Developer → Webhooks, add this URL and select "Booking Created"
 * 2. Set a webhook signing secret and add it as CAL_WEBHOOK_SECRET in your env
 * 3. Add META_PIXEL_ID and META_CONVERSIONS_API_TOKEN to your env
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

  // Cal.com passes query params from the booking link as metadata/responses
  // The fbclid param indicates the user came from a Meta ad
  const queryParams = extractQueryParams(payload);
  const fbclid = queryParams.get("fbclid");

  if (!fbclid) {
    // No Meta attribution — skip pixel firing
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
  const email = payload.payload?.attendees?.[0]?.email;

  const eventData = {
    data: [
      {
        event_name: "Schedule",
        event_time: eventTime,
        action_source: "website",
        user_data: {
          fbc: `fb.1.${eventTime}.${fbclid}`,
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

/**
 * Extract query params that were passed through the Cal.com booking link.
 * Cal.com stores these in the booking metadata under different fields
 * depending on the integration version.
 */
function extractQueryParams(payload: CalWebhookPayload): URLSearchParams {
  const metadata = payload.payload?.metadata;
  if (!metadata) return new URLSearchParams();

  // Cal.com stores the original query string in metadata
  if (typeof metadata === "object") {
    return new URLSearchParams(metadata as Record<string, string>);
  }

  return new URLSearchParams();
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
  payload?: {
    metadata?: unknown;
    attendees?: { email?: string }[];
  };
}
