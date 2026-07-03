"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  readBookingPrefill,
  clearBookingPrefill,
  type BookingPrefill,
} from "~/lib/booking-prefill";
import { readAttribution } from "~/lib/attribution";

/** Set once we've fired the conversion so a refresh doesn't double-count. */
const FIRED_FLAG = "mcb:thankyou-fired";

export default function ThankYouPage() {
  const [prefill, setPrefill] = useState<BookingPrefill | null>(null);

  useEffect(() => {
    const stash = readBookingPrefill();
    setPrefill(stash);

    // Only fire conversion tracking when the visitor actually arrived here from
    // the HoneyBook form submission (redirect set to /thank-you?booked=1).
    // Organic visits / bookmarks / refreshes must not count as conversions.
    //
    // Tolerant match: HoneyBook's redirect config is hand-typed, and a pasted
    // stray character once shipped as `booked=1%60` (trailing backtick), which
    // silently dropped real conversions. Accept any value that STARTS with "1"
    // so config typos degrade gracefully instead of zeroing out reporting.
    const bookedParam = new URLSearchParams(window.location.search).get(
      "booked",
    );
    const booked = bookedParam?.startsWith("1") ?? false;

    let alreadyFired = false;
    try {
      alreadyFired = sessionStorage.getItem(FIRED_FLAG) === "1";
    } catch {
      // sessionStorage unavailable — proceed (worst case a rare double-fire).
    }

    if (booked && !alreadyFired) {
      try {
        sessionStorage.setItem(FIRED_FLAG, "1");
      } catch {
        // non-fatal
      }

      // Fire Google Ads conversion. Skips silently if either env var is missing.
      const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
      const conversionLabel =
        process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
      if (adsId && conversionLabel) {
        const w = window as unknown as {
          gtag?: (
            cmd: string,
            event: string,
            params?: Record<string, unknown>,
          ) => void;
        };
        w.gtag?.("event", "conversion", {
          send_to: `${adsId}/${conversionLabel}`,
        });
      }

      // Notify owner + n8n with the stashed ad attribution. The lead's PII lives
      // in HoneyBook (which sends its own inquiry notification); this fire is the
      // attribution layer so the owner/n8n can tie the inquiry to its ad source.
      const attribution = readAttribution();
      void fetch("/api/honeybook-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution,
          pageUrl: window.location.href,
        }),
        keepalive: true,
      }).catch(() => {
        // fire-and-forget — don't block the confirmation UI on this
      });
    }

    // Clear booking prefill (legacy modal flow) after reading. Harmless when
    // absent; keeps a fresh tab from rendering someone else's stale data.
    clearBookingPrefill();
  }, []);

  const firstName = prefill?.firstName;
  const eventDescriptor = describeEvent(prefill);

  return (
    <main className="bg-neutral-400 flex min-h-screen items-center justify-center px-4 py-12 text-neutral-100">
      <div className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/10 bg-[#122134] p-8 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)] md:p-12">
        <div className="from-primary-300/20 absolute -top-32 -right-32 h-[300px] w-[300px] rounded-full bg-linear-to-br to-transparent blur-3xl" />

        <div className="relative">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-300/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="font-heading mb-3 text-3xl tracking-wide md:text-4xl">
            {firstName ? `You're booked, ${firstName}.` : "You're booked."}
          </h1>

          <p className="mb-6 text-base text-neutral-200 md:text-lg">
            {eventDescriptor
              ? `Your ${eventDescriptor} is on the calendar. Check your inbox for the confirmation.`
              : "Your discovery call is on the calendar. Check your inbox for the confirmation."}
          </p>

          <div className="border-primary-300/20 mb-8 rounded-xl border bg-white/[0.04] p-5 md:p-6">
            <p className="text-primary-100 mb-4 text-xs font-semibold tracking-[0.14em] uppercase">
              What to expect
            </p>
            <ol className="space-y-4 text-sm leading-relaxed text-neutral-100 md:text-base">
              <li className="flex gap-3">
                <span className="bg-primary-300/20 text-primary-100 ring-primary-300/40 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1">
                  1
                </span>
                <span>
                  A 10-minute call to talk through your event and design the
                  right bar package.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="bg-primary-300/20 text-primary-100 ring-primary-300/40 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1">
                  2
                </span>
                <span>
                  We&apos;ll cover menu concepts, ingredients, pricing, and
                  what&apos;s included.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="bg-primary-300/20 text-primary-100 ring-primary-300/40 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1">
                  3
                </span>
                <span>
                  After the call, you&apos;ll get a custom quote within 24
                  hours.
                </span>
              </li>
            </ol>
          </div>

          <p className="mb-6 text-sm text-neutral-300">
            Quick prep: if you have specific cocktails in mind, a venue address,
            or anything unusual about the setup (rooftop, outdoor, multiple
            stations), jot it down. We&apos;ll talk through it on the call.
          </p>

          <Link
            href="/general"
            className="text-primary-200 hover:text-primary-100 inline-flex items-center text-sm tracking-wide transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

/**
 * Build a short natural-language descriptor of the event for the headline copy.
 * Examples:
 *   "Wedding" + "75-150" => "wedding for 75 to 150 guests"
 *   "Corporate Event"     => "corporate event"
 *   undefined             => null (caller falls back to generic copy)
 */
function describeEvent(prefill: BookingPrefill | null): string | null {
  if (!prefill?.eventType) return null;
  const eventLabel = formatEventType(prefill.eventType);
  if (!prefill.guestCount) return eventLabel;
  return `${eventLabel} for ${formatGuestCount(prefill.guestCount)}`;
}

function formatEventType(value: string): string {
  switch (value) {
    case "Wedding":
      return "wedding";
    case "Corporate Event":
      return "corporate event";
    case "Private Event":
      return "private event";
    case "Festival":
      return "festival";
    default:
      return "event";
  }
}

function formatGuestCount(value: string): string {
  // Convert hyphenated ranges like "75-150" to "75 to 150 guests" so
  // we don't sneak en-dashes back into user-facing copy.
  if (value === "Under 30") return "under 30 guests";
  if (value === "150+") return "150+ guests";
  if (value.includes("-")) {
    const [low, high] = value.split("-");
    return `${low} to ${high} guests`;
  }
  return `${value} guests`;
}
