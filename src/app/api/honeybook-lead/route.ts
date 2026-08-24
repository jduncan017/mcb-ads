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
  // Apex (no www) — the privacy/terms pages link here, and a visitor arriving
  // on the apex would otherwise 403 with no owner email and no n8n ping.
  "https://mobilecraftbars.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);

/** Vercel preview deployments: https://<project>-<hash>-<scope>.vercel.app */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" && hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

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
  if (!isAllowedOrigin(origin)) {
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

  // ── n8n webhook ──────────────────────────────────────────────────────────
  // Payload is FLAT and every field is a non-empty string. Downstream Slack
  // nodes map fields directly, and an unknown value renders as "Not provided"
  // rather than a blank line — an alert full of empty fields reads like broken
  // tooling. Note we still cannot send name/email/phone: those are typed into
  // HoneyBook's cross-origin iframe and are unreadable from this site. The
  // alert's job is "a lead just landed, here's where it came from, go look."
  const n8nUrl = env.N8N_BOOKING_WEBHOOK_URL;
  if (n8nUrl) {
    const body = buildLeadNotification(attribution, payload.pageUrl);
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

const NOT_PROVIDED = "Not provided";

/** Coerce any possibly-undefined attribution value into a displayable string. */
function display(value: string | undefined): string {
  const trimmed = value?.trim();
  // Explicit falsy check (not `??`): an empty string must also fall back.
  if (!trimmed) return NOT_PROVIDED;
  return trimmed;
}

/**
 * Build the flat, always-populated lead notification payload for n8n/Slack.
 *
 * Design rules:
 * - No nested objects. n8n Slack nodes map top-level fields most easily.
 * - No undefined/empty values. Anything unknown becomes "Not provided".
 * - Includes a ready-to-post `summary` line so a Slack node can be wired to a
 *   single field and still produce a useful message.
 */
function buildLeadNotification(
  attribution: Attribution | undefined,
  pageUrl: string | undefined,
) {
  const now = new Date();

  const gclid = attribution?.gclid ?? attribution?.gbraid ?? attribution?.wbraid;
  const isGoogleAds = Boolean(gclid);
  const isMeta = Boolean(attribution?.fbclid);

  // Did this visitor come through OUR ad funnel at all? The HoneyBook form is
  // also embedded on the main website (www.mobilecraftbars.com/contact) and its
  // post-submit redirect points here regardless of where it was filled in, so a
  // lead with no ad click and no funnel landing page came from somewhere else.
  const cameThroughFunnel = Boolean(attribution?.landingUrl);

  // Human-readable channel. utm_source is the fallback when there's no click id.
  let leadSource: string;
  if (isGoogleAds) leadSource = "Google Ads";
  else if (isMeta) leadSource = "Meta Ads";
  else if (attribution?.source) leadSource = attribution.source;
  else if (cameThroughFunnel) leadSource = "Direct / organic (ad funnel page)";
  else leadSource = "Main website or direct HoneyBook link";

  const keyword = display(attribution?.term);
  const campaign = display(attribution?.campaign);

  // One-line message a Slack node can post as-is. Says plainly which channel
  // produced the lead so an off-funnel lead reads as information, not a failure.
  let summary: string;
  if (isGoogleAds) {
    const kw = keyword !== NOT_PROVIDED ? ` (keyword: ${keyword})` : "";
    summary = `New lead from Google Ads${kw}. Full details in HoneyBook.`;
  } else if (isMeta) {
    summary = `New lead from Meta Ads. Full details in HoneyBook.`;
  } else if (cameThroughFunnel) {
    summary = `New lead from the ad landing page, but with no ad click recorded (direct or organic visit). Full details in HoneyBook.`;
  } else {
    summary = `New lead, not from the ad funnel. Most likely the main website contact form or a direct HoneyBook link. Full details in HoneyBook.`;
  }

  return {
    event: "honeybook_lead",
    summary,
    leadSource,
    isGoogleAds,
    cameThroughFunnel,
    // True only for a billable ad click. Drives whether the Google Ads
    // conversion fired on /thank-you, so Slack and Google agree.
    attributed: isGoogleAds || isMeta,
    campaign,
    keyword,
    adContent: display(attribution?.content),
    medium: display(attribution?.medium),
    gclid: display(gclid),
    landingPage: display(attribution?.landingUrl),
    referrer: display(attribution?.referrer),
    submittedAt: now.toISOString(),
    submittedAtDenver: now.toLocaleString("en-US", {
      timeZone: "America/Denver",
      dateStyle: "medium",
      timeStyle: "short",
    }),
    pageUrl: display(pageUrl),
    nextStep: "Open HoneyBook to see the lead's name, email, and event details.",
  };
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
