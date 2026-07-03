"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
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
 */

const HB_PID = "697d2a1284c5890030c7012e";

export function HoneyBookEmbed() {
  const placementRef = useRef<HTMLDivElement>(null);

  // Instrumentation around the cross-origin iframe blind spot:
  // - honeybook_embed_loaded: HoneyBook's placement controller injected the
  //   form (iframe appeared inside the placement div).
  // - honeybook_form_viewed: visitor actually scrolled the form into view.
  useEffect(() => {
    const el = placementRef.current;
    if (!el) return;

    let loadedFired = false;
    const mutationObserver = new MutationObserver(() => {
      if (!loadedFired && el.querySelector("iframe")) {
        loadedFired = true;
        analytics.honeybookEmbedLoaded();
        mutationObserver.disconnect();
      }
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    let viewedFired = false;
    // 0.25 threshold: the rendered form can be taller than the viewport, so
    // requiring 50%+ visibility would never fire on mobile. A quarter visible
    // reliably means the visitor scrolled to the form.
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
      <div ref={placementRef} className={`hb-p-${HB_PID}-1`} />
      {/* HoneyBook tracking pixel — must stay a raw 1x1 img, not next/image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.honeybook.com/p.png?pid=${HB_PID}`}
        alt=""
      />
      <Script id="honeybook-placement" strategy="afterInteractive">
        {`(function(h,b,s,n,i,p,e,t) {
          h._HB_ = h._HB_ || {};h._HB_.pid = i;;;;
          t=b.createElement(s);t.type="text/javascript";t.async=!0;t.src=n;
          e=b.getElementsByTagName(s)[0];e.parentNode.insertBefore(t,e);
        })(window,document,"script","https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js","${HB_PID}");`}
      </Script>
    </>
  );
}
