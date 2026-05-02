import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Discovery-call lead capture endpoint.
 *
 * Fires when a visitor completes the modal (either qualified or declined).
 * Two side effects:
 *
 * 1. Email the owner (LEAD_NOTIFY_EMAIL) with the answers via Resend
 * 2. If qualified, fire a Meta Conversions API "Lead" event server-side
 *    (catches iOS / Safari users that the browser pixel misses)
 *
 * Setup:
 * - RESEND_API_KEY in env (https://resend.com/api-keys)
 * - LEAD_NOTIFY_EMAIL in env (owner's inbox)
 * - LEAD_FROM_EMAIL in env (verified Resend sender, format: "Name <addr@domain>")
 * - NEXT_PUBLIC_META_PIXEL_ID + META_CONVERSIONS_API_TOKEN in env
 */

interface LeadPayload {
  eventType: string;
  guestCount: string;
  when: string;
  budget: string;
  name?: string;
  email: string;
  declined?: boolean;
  notes?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    fbclid?: string;
  };
  pageUrl?: string;
}

export async function POST(request: NextRequest) {
  let payload: LeadPayload;
  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!payload.email || !isValidEmail(payload.email)) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );
  }

  const tasks: Promise<unknown>[] = [];

  // 1. Email the owner. All three env vars must be set; we don't silently
  //    fall back to a generic from-address because that risks Resend
  //    rejecting the send (unverified domain) and dropping the lead.
  if (
    process.env.RESEND_API_KEY &&
    process.env.LEAD_NOTIFY_EMAIL &&
    process.env.LEAD_FROM_EMAIL
  ) {
    tasks.push(sendOwnerEmail(payload));
  } else {
    console.error(
      "[discovery-lead] Skipping owner email — missing one of RESEND_API_KEY, LEAD_NOTIFY_EMAIL, LEAD_FROM_EMAIL",
    );
  }

  // 2. Fire Meta Conversions API event (only for qualified, ad-attributed leads)
  const fbclid = payload.utm?.fbclid;
  const utmSource = payload.utm?.source?.toLowerCase();
  const isFromMeta =
    !!fbclid ||
    (utmSource &&
      ["facebook", "fb", "ig", "instagram", "meta"].includes(utmSource));

  if (
    !payload.declined &&
    isFromMeta &&
    process.env.NEXT_PUBLIC_META_PIXEL_ID &&
    process.env.META_CONVERSIONS_API_TOKEN
  ) {
    tasks.push(fireMetaLeadEvent(payload, fbclid));
  }

  // Don't block the response on email/CAPI failures — log and move on
  await Promise.allSettled(tasks).then((results) => {
    results.forEach((r) => {
      if (r.status === "rejected") {
        console.error("Lead handler task failed:", r.reason);
      }
    });
  });

  return NextResponse.json({ ok: true });
}

async function sendOwnerEmail(payload: LeadPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL;
  if (!apiKey || !to || !from) return;

  const subject = payload.declined
    ? `[MCB Lead] Soft decline from ${payload.email}`
    : `[MCB Lead] ${payload.eventType} for ${payload.guestCount} guests`;

  const lines = [
    `<h2 style="margin:0 0 8px 0;font-family:system-ui,sans-serif;">New discovery-call lead</h2>`,
    payload.declined
      ? `<p style="color:#b91c1c;font-family:system-ui,sans-serif;"><strong>Soft decline</strong> (budget below threshold). They opted to send a note anyway.</p>`
      : `<p style="font-family:system-ui,sans-serif;">They've been redirected to Calendly to book a time.</p>`,
    `<table style="font-family:system-ui,sans-serif;border-collapse:collapse;margin:16px 0;">`,
    row("Event type", payload.eventType),
    row("Guest count", payload.guestCount),
    row("When", payload.when),
    row("Budget", payload.budget),
    row("Name", payload.name ?? "(not provided)"),
    row("Email", payload.email),
    payload.notes ? row("Notes", payload.notes) : "",
    `</table>`,
    payload.utm?.fbclid || payload.utm?.source
      ? `<p style="color:#6b7280;font-family:system-ui,sans-serif;font-size:13px;">Source: ${payload.utm?.source ?? "direct"}${payload.utm?.campaign ? ` · ${payload.utm.campaign}` : ""}${payload.utm?.fbclid ? " · Meta click" : ""}</p>`
      : "",
    payload.pageUrl
      ? `<p style="color:#6b7280;font-family:system-ui,sans-serif;font-size:13px;">Page: ${payload.pageUrl}</p>`
      : "",
  ].join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject,
      html: lines,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend failed: ${res.status} ${errText}`);
  }
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#6b7280;font-size:14px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:500;">${escapeHtml(value)}</td>
  </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fireMetaLeadEvent(
  payload: LeadPayload,
  fbclid: string | undefined,
): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !accessToken) return;

  const eventTime = Math.floor(Date.now() / 1000);
  const emailHash = await hashSHA256(payload.email.toLowerCase().trim());

  const eventData = {
    data: [
      {
        event_name: "Lead",
        event_time: eventTime,
        action_source: "website",
        event_source_url: payload.pageUrl,
        custom_data: {
          event_type: payload.eventType,
          guest_count: payload.guestCount,
          budget: payload.budget,
        },
        user_data: {
          em: [emailHash],
          ...(fbclid && { fbc: `fb.1.${eventTime}.${fbclid}` }),
        },
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Meta CAPI failed: ${res.status} ${errText}`);
  }
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
