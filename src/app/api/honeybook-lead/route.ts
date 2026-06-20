import { type NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { env } from "~/env";

/**
 * HoneyBook inline-form lead signal.
 *
 * Fired from /thank-you after the visitor submits the embedded HoneyBook form
 * and HoneyBook redirects to /thank-you?booked=1.
 *
 * IMPORTANT — what this endpoint does and does NOT know:
 * The lead's name/email/phone/event details are typed into HoneyBook's
 * cross-origin iframe and are unreadable by our site. HoneyBook itself owns
 * that PII: it creates the inquiry, notifies the owner, and runs the lead-facing
 * follow-up. This endpoint is the ATTRIBUTION layer — it forwards the ad source
 * we stashed on landing (utm_*, gclid, referrer) to:
 *
 *   1. The owner via Resend — "a Google-attributed lead just submitted", so the
 *      owner can match it to HoneyBook's inquiry notification by timestamp.
 *   2. n8n — same attribution payload for any downstream automation/logging.
 *
 * If n8n needs the lead's actual email (e.g. to send a follow-up sequence),
 * that must be driven from HoneyBook (native automations, or a HoneyBook → n8n
 * bridge), not from here — we don't have it.
 */

const ALLOWED_ORIGINS = new Set([
  "https://book.mobilecraftbars.com",
  "https://www.mobilecraftbars.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);

interface Attribution {
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
  capturedAt?: number;
}

interface HoneyBookLeadPayload {
  attribution?: Attribution | null;
  pageUrl?: string;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: HoneyBookLeadPayload;
  try {
    payload = (await request.json()) as HoneyBookLeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const attribution = payload.attribution ?? undefined;

  // ── Owner notification email (attribution only) ──────────────────────────
  if (
    process.env.RESEND_API_KEY &&
    process.env.LEAD_NOTIFY_EMAIL &&
    process.env.LEAD_FROM_EMAIL
  ) {
    after(async () => {
      try {
        await sendOwnerEmail(attribution, payload.pageUrl);
      } catch (err) {
        console.error("[honeybook-lead] owner email failed:", err);
      }
    });
  } else {
    console.error(
      "[honeybook-lead] Skipping owner email — missing RESEND_API_KEY, LEAD_NOTIFY_EMAIL, or LEAD_FROM_EMAIL",
    );
  }

  // ── n8n webhook (attribution only) ───────────────────────────────────────
  const n8nUrl = env.N8N_BOOKING_WEBHOOK_URL;
  if (n8nUrl) {
    const body = {
      event: "honeybook_lead",
      attribution,
      pageUrl: payload.pageUrl,
    };
    after(async () => {
      try {
        const res = await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          console.error("[honeybook-lead] n8n webhook non-2xx:", res.status);
        }
      } catch (err) {
        console.error("[honeybook-lead] n8n webhook failed:", err);
      }
    });
  }

  return NextResponse.json({ ok: true });
}

async function sendOwnerEmail(
  attribution: Attribution | undefined,
  pageUrl: string | undefined,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL;
  if (!apiKey || !to || !from) return;

  const source = attribution?.source ?? "direct / organic";
  const isGoogle = !!(
    attribution?.gclid ??
    attribution?.gbraid ??
    attribution?.wbraid
  );

  const html = [
    `<h2 style="margin:0 0 8px 0;font-family:system-ui,sans-serif;">New HoneyBook form submission</h2>`,
    `<p style="font-family:system-ui,sans-serif;">A visitor just submitted the booking form. The lead's full details are in <strong>HoneyBook</strong> — this email is the ad-attribution match (by timestamp).</p>`,
    `<table style="font-family:system-ui,sans-serif;border-collapse:collapse;margin:16px 0;">`,
    row("Source", source),
    attribution?.medium ? row("Medium", attribution.medium) : "",
    attribution?.campaign ? row("Campaign", attribution.campaign) : "",
    attribution?.content ? row("Ad / content", attribution.content) : "",
    attribution?.term ? row("Keyword / term", attribution.term) : "",
    row("Google click", isGoogle ? "yes" : "no"),
    attribution?.referrer ? row("Referrer", attribution.referrer) : "",
    attribution?.landingUrl ? row("Landing page", attribution.landingUrl) : "",
    `</table>`,
    pageUrl
      ? `<p style="color:#6b7280;font-family:system-ui,sans-serif;font-size:13px;">Submitted from: ${escapeHtml(pageUrl)}</p>`
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
      subject: `[MCB Lead] New HoneyBook submission${isGoogle ? " (Google ad)" : ` (${source})`}`,
      html,
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
