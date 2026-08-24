"use client";

import Script from "next/script";
import { env } from "~/env";

/**
 * Google Ads gtag.
 *
 * TIMING (important — this cost us conversions):
 * The `dataLayer` + `gtag()` stub is emitted SYNCHRONOUSLY in <head> via a plain
 * inline <script>, not next/script. Both gtag <Script> tags previously used
 * `strategy="afterInteractive"`, which injects them AFTER hydration. React runs
 * child effects before parent effects, so the /thank-you conversion effect could
 * run while `window.gtag` was still undefined — the optional call `w.gtag?.()`
 * then silently no-opped and the conversion was lost.
 *
 * The stub is 3 lines and makes no network request, so putting it in <head>
 * costs nothing measurable. `dataLayer` is a queue by design: events pushed
 * before the heavy gtag/js loader arrives are replayed once it loads. The loader
 * itself stays `afterInteractive` so it doesn't block rendering.
 */
export function GoogleAdsTag() {
  if (process.env.NODE_ENV === "development") return null;

  const adsId = env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId) return null;

  return (
    <>
      {/* Synchronous stub: guarantees window.gtag exists before any effect. */}
      <script
        id="gtag-stub"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${adsId}');`,
        }}
      />
      {/* Heavy loader, deferred. Replays anything already queued in dataLayer. */}
      <Script
        id="gtag-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
      />
    </>
  );
}
