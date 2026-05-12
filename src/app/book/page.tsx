"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Footer } from "~/components/layout";
import { Eyebrow } from "~/components/Eyebrow";
import { FadeIn } from "~/components/FadeIn";
import { env } from "~/env";
import {
  readBookingPrefill,
  type BookingPrefill,
} from "~/lib/booking-prefill";
import { posthog } from "~/lib/posthog";

// ============================================================================
// Calendly widget global types
// ============================================================================

interface CalendlyAPI {
  initInlineWidget(opts: {
    url: string;
    parentElement: HTMLElement;
  }): void;
}

declare global {
  interface Window {
    Calendly?: CalendlyAPI;
    fbq?: (
      cmd: string,
      event: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string },
    ) => void;
  }
}

// ============================================================================
// Page
// ============================================================================

const CALENDLY_EMBED_BASE = "https://calendly.com/mobilecraftbars/discovery-call";
const CALENDLY_THEME_PARAMS = {
  hide_gdpr_banner: "1",
  // hide_event_type_details: skips Calendly's own description/info section.
  // We replicate that content above the widget on this page so the messaging
  // is fully under our control.
  hide_event_type_details: "1",
  background_color: "122134",
  text_color: "ffffff",
  primary_color: "6590c3",
};

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
// Height tuned per breakpoint so Calendly never needs internal scroll:
// - Desktop: 900px fits Calendar select (~650px) and Enter Details (~850px)
// - Mobile: form fields stack vertically, terms text wraps, prefilled QA rows
//   stack — total runs ~1250px. Use 1300 for buffer.
const WIDGET_HEIGHT_CLASS = "h-[1300px] sm:h-[900px]";

const siteName = "Mobile Craft Bars";

export default function BookPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [prefill, setPrefill] = useState<BookingPrefill | null | undefined>(
    undefined,
  );
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  useEffect(() => {
    setPrefill(readBookingPrefill());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector(`script[src="${CALENDLY_SCRIPT_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (prefill === undefined) return;
    if (initializedRef.current) return;

    let cancelled = false;

    function tryInit() {
      if (cancelled) return;
      if (initializedRef.current) return;
      if (!containerRef.current) return;

      if (typeof window === "undefined" || !window.Calendly) {
        window.setTimeout(tryInit, 100);
        return;
      }

      initializedRef.current = true;
      window.Calendly.initInlineWidget({
        url: buildCalendlyEmbedUrl(prefill ?? null),
        parentElement: containerRef.current,
      });
    }

    tryInit();

    return () => {
      cancelled = true;
    };
  }, [prefill]);

  useEffect(() => {
    if (prefill === undefined) return;

    function handleMessage(e: MessageEvent) {
      if (e.origin !== "https://calendly.com") return;
      if (typeof e.data !== "object" || !e.data) return;
      const data = e.data as { event?: string };

      if (
        data.event === "calendly.event_type_viewed" ||
        data.event === "calendly.profile_page_viewed"
      ) {
        setWidgetLoaded(true);
        return;
      }

      if (data.event !== "calendly.event_scheduled") return;

      const eventId = prefill?.eventId;
      const fbclid = prefill?.utm.fbclid;

      // Browser-side Meta Pixel — Schedule. Pass eventID for dedup against
      // the server-side fire below.
      window.fbq?.(
        "track",
        "Schedule",
        {
          content_category: prefill?.eventType,
          value: 0,
          currency: "USD",
          ...(fbclid && { fbclid }),
        },
        eventId ? { eventID: eventId } : undefined,
      );

      // Browser-side PostHog. distinct_id stays the same as on /general so
      // the funnel stitches together.
      posthog.capture("calendly_booked_clientside", {
        source: prefill?.source,
        eventType: prefill?.eventType,
        guestCount: prefill?.guestCount,
        when: prefill?.when,
        budget: prefill?.budget,
        eventId,
      });

      // Server-side fire via our own endpoint. Replicates what a Calendly
      // webhook would do (server-side PostHog calendly_booked + Meta CAPI
      // Schedule for Meta-attributed bookings) without requiring Calendly's
      // paid webhook feature. We use keepalive: true so the browser will
      // complete the request even if the user navigates away to /thank-you
      // before the response comes back.
      if (prefill) {
        try {
          fetch("/api/booking-confirmed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              eventId: prefill.eventId,
              email: prefill.email,
              name: prefill.name,
              eventType: prefill.eventType,
              guestCount: prefill.guestCount,
              when: prefill.when,
              budget: prefill.budget,
              source: prefill.source,
              utm: prefill.utm,
              pageUrl:
                typeof window !== "undefined" ? window.location.href : undefined,
            }),
          }).catch((err) => {
            console.error("[book] booking-confirmed POST failed:", err);
          });
        } catch (err) {
          console.error("[book] booking-confirmed POST threw:", err);
        }
      }

      window.location.href = "/thank-you";
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [prefill]);

  const firstName = prefill?.name?.split(" ")[0];
  const eventDescriptor = formatEventDescriptor(prefill);

  return (
    <main className="bg-neutral-400 flex min-h-screen flex-col text-neutral-100">
      {/* Hero + content. flex justify-center vertically centers the heading
          and widget within the available space when the viewport is taller
          than the content. */}
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
        {/* Glow orbs (pointer-events: none, blurred, low opacity) */}
        <div className="gradient-orb bg-primary-300 -top-32 -left-32 h-[500px] w-[500px]" />
        <div className="gradient-orb bg-secondary-300 top-[40%] -right-32 h-[400px] w-[400px]" />

        <div className="relative mx-auto w-full max-w-[1100px] py-10 md:py-14">
          {/* Centered intro */}
          <FadeIn>
            <div className="mx-auto mb-6 max-w-[720px] px-6 text-center md:mb-8">
              <Eyebrow>Final Step</Eyebrow>
              <h1 className="font-heading mt-3 mb-4 text-4xl tracking-wide md:text-5xl">
                {firstName ? `Almost there, ${firstName}.` : "Pick a Time That Works"}
              </h1>
              <p className="text-base text-neutral-200 md:text-lg">
                {eventDescriptor
                  ? `Pick a time for a 10-minute call with James to design the bar package for your ${eventDescriptor}.`
                  : "Pick a time for a 10-minute call with James to design the right bar package for your event."}
              </p>
            </div>
          </FadeIn>

          {/* Calendly widget */}
          <FadeIn delay={150}>
            <div
              className={`relative mx-auto ${WIDGET_HEIGHT_CLASS}`}
              style={{ minWidth: 320 }}
            >
              <div
                className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-500 ${
                  widgetLoaded ? "opacity-0" : "opacity-100"
                }`}
                aria-hidden={widgetLoaded}
              >
                <Loader2 className="text-primary-300 h-8 w-8 animate-spin" />
                <p className="text-sm tracking-wide text-neutral-300">
                  Loading your booking calendar...
                </p>
              </div>

              {/*
                Note: deliberately NOT using the `calendly-inline-widget` class.
                Calendly's widget.js auto-scan crashes when that class exists
                without a `data-url` attribute. We drive init via the JS API.
              */}
              <div
                ref={containerRef}
                className={WIDGET_HEIGHT_CLASS}
                style={{ minWidth: 320 }}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <hr className="border-white/10" />
      <Footer
        logo={<span className="text-lg font-bold text-white">{siteName}</span>}
        copyright={`© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
        bottomContent={
          env.NEXT_PUBLIC_PRIVACY_POLICY_URL ? (
            <a
              href={env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-300 text-sm text-gray-300 transition"
            >
              Privacy Policy
            </a>
          ) : undefined
        }
        className="text-neutral-200"
      />
    </main>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function buildCalendlyEmbedUrl(prefill: BookingPrefill | null): string {
  // Build query string with encodeURIComponent so spaces become %20 instead
  // of `+`. Calendly's prefill matcher uses decodeURIComponent on the value,
  // which leaves `+` literal — that broke "Joshua Duncan" and "30 to 75".
  const parts: string[] = [];

  function append(key: string, value: string | undefined) {
    if (value === undefined || value === "") return;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }

  for (const [k, v] of Object.entries(CALENDLY_THEME_PARAMS)) {
    append(k, v);
  }

  if (prefill) {
    append("name", prefill.name);
    append("email", prefill.email);
    append("a1", prefill.eventType);
    append("a2", prefill.guestCount);
    append("a3", prefill.when);
    append("a4", prefill.budget);
    append("utm_source", prefill.utm.source);
    append("utm_medium", prefill.utm.medium);
    append("utm_campaign", prefill.utm.campaign);
    append("utm_content", prefill.utm.content);
    // Co-opt salesforce_uuid for the event_id so the cal-webhook can dedupe
    // its server-side Schedule fire against the client-side fire above.
    append("salesforce_uuid", prefill.eventId);
  }

  return `${CALENDLY_EMBED_BASE}?${parts.join("&")}`;
}

function formatEventDescriptor(prefill: BookingPrefill | null | undefined): string | null {
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
    case "Private Party":
      return "private party";
    default:
      return "event";
  }
}

function formatGuestCount(value: string): string {
  if (value === "Under 30") return "under 30 guests";
  if (value === "150+") return "150+ guests";
  return `${value} guests`;
}
