"use client";

import Script from "next/script";
import { env } from "~/env";

export function GoogleAdsTag() {
  if (process.env.NODE_ENV === "development") return null;

  const adsId = env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId) return null;

  return (
    <>
      <Script
        id="gtag-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${adsId}');
          `,
        }}
      />
    </>
  );
}
