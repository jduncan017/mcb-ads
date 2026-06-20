"use client";

import Script from "next/script";

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
  return (
    <>
      <div className={`hb-p-${HB_PID}-1`} />
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
