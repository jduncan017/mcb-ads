"use client";

import { useEffect, useRef, useState } from "react";
import { analytics } from "~/lib/analytics";

/**
 * HoneyBook website-placement contact form, embedded inline.
 *
 * Replaces the old DiscoveryModal → Calendly flow. The visitor fills this form
 * directly on the page; HoneyBook creates the inquiry in the CRM and sends its
 * own notification + handles lead-facing follow-up natively.
 *
 * Conversion tracking note: this is a cross-origin iframe with no documented
 * submit callback, so we can't fire gtag from a submit event here. Instead,
 * configure the form in HoneyBook to redirect to `/thank-you?booked=1` after
 * submission — that page fires the Google Ads conversion + notifies n8n/owner
 * with the stashed attribution. See src/lib/attribution.ts.
 *
 * PERFORMANCE: the HoneyBook placement-controller script is heavy (it drove
 * mobile Total Blocking Time to ~2.4s and tanked the Lighthouse/landing-page-
 * experience score). We therefore DO NOT load it on page load. Instead we wait
 * until the placement scrolls near the viewport (IntersectionObserver, 600px
 * rootMargin) and inject the loader then. On this page the form sits below the
 * fold, so a mobile visitor gets a fast first paint and the widget streams in
 * just before they reach it. We also reserve height on the container so the
 * injected iframe doesn't cause layout shift (CLS).
 */

/**
 * HoneyBook account id. One PID covers the whole account; individual forms are
 * distinguished by the PLACEMENT INDEX in the container class
 * (`hb-p-<pid>-<placement>`), not by a separate pid. So a second form is the
 * same pid with a different index — see the `placement` prop.
 *
 * Placement 1 is the shared contact form, which is also embedded on
 * www.mobilecraftbars.com. Its post-submit redirect is configured on the FORM,
 * not per-embed, which is why main-site submissions also land on our
 * /thank-you page.
 */
const DEFAULT_HB_PID = "697d2a1284c5890030c7012e";
const DEFAULT_PLACEMENT = 1;
const HB_SRC =
  "https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js";

// Reserve roughly the rendered form height so injecting the iframe doesn't
// shove the page (kills the CLS contribution from the embed).
const RESERVED_MIN_HEIGHT = 640;

function injectHoneyBook(pid: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { _HB_?: { pid: string } };
  // Guard against double-injection (React strict mode, remounts).
  if (document.getElementById("honeybook-placement-loader")) return;
  w._HB_ = w._HB_ ?? { pid };
  w._HB_.pid = pid;
  const s = document.createElement("script");
  s.id = "honeybook-placement-loader";
  s.type = "text/javascript";
  s.async = true;
  s.src = HB_SRC;
  const first = document.getElementsByTagName("script")[0];
  if (first?.parentNode) {
    first.parentNode.insertBefore(s, first);
  } else {
    document.head.appendChild(s);
  }
}

interface HoneyBookEmbedProps {
  /** HoneyBook account id. Same for every form on the account. */
  pid?: string;
  /**
   * Which form on the account to render. Taken from the trailing number in
   * HoneyBook's embed snippet: `<div class="hb-p-<pid>-4">` is placement 4.
   * Defaults to 1, the shared contact form.
   */
  placement?: number;
}

export function HoneyBookEmbed({
  pid = DEFAULT_HB_PID,
  placement = DEFAULT_PLACEMENT,
}: HoneyBookEmbedProps) {
  const placementRef = useRef<HTMLDivElement>(null);
  const [loadTriggered, setLoadTriggered] = useState(false);

  // Load-trigger: inject the widget only when the form is within 600px of the
  // viewport. This is the main performance win.
  useEffect(() => {
    const el = placementRef.current;
    if (!el) return;
    if (loadTriggered) return;

    const loader = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoadTriggered(true);
          injectHoneyBook(pid);
          loader.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    loader.observe(el);
    return () => loader.disconnect();
  }, [loadTriggered, pid]);

  // Instrumentation around the cross-origin iframe blind spot:
  // - honeybook_embed_loaded: the controller injected the form (iframe appeared).
  // - honeybook_form_viewed: visitor actually scrolled the form into view.
  useEffect(() => {
    const el = placementRef.current;
    if (!el) return;

    let loadedFired = false;
    const mutationObserver = new MutationObserver(() => {
      const iframe = el.querySelector("iframe");
      if (!loadedFired && iframe) {
        loadedFired = true;
        // HoneyBook's injected iframe ships with no title, which fails an
        // accessibility check. Label it so screen readers announce it.
        if (!iframe.getAttribute("title")) {
          iframe.setAttribute("title", "Event booking form");
        }
        analytics.honeybookEmbedLoaded();
        mutationObserver.disconnect();
      }
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    let viewedFired = false;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (!viewedFired && entries.some((e) => e.isIntersecting)) {
          viewedFired = true;
          analytics.honeybookFormViewed();
          intersectionObserver.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    intersectionObserver.observe(el);

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={placementRef}
        className={`hb-p-${pid}-${placement}`}
        style={{ minHeight: RESERVED_MIN_HEIGHT }}
      />
      {/* HoneyBook placement-analytics pixel. Deferred with the widget so it
          doesn't fire a request on initial page load. Must stay a raw 1x1 img. */}
      {loadTriggered && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.honeybook.com/p.png?pid=${pid}`}
          alt=""
        />
      )}
    </>
  );
}
