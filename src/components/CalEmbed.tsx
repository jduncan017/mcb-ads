"use client";

import { useEffect } from "react";
import Script from "next/script";
import { analytics } from "~/lib/analytics";

export function CalEmbed() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest("[data-cal-link]");
      if (el) analytics.calModalOpened(window.location.pathname);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <Script
      id="cal-embed"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
          Cal("init", "30min", {origin:"https://app.cal.com"});
          Cal.ns["30min"]("ui", {"theme":"dark","cssVarsPerTheme":{"light":{"cal-brand":"#1d6ee3"},"dark":{"cal-brand":"#1d6ee3"}},"hideEventTypeDetails":false,"layout":"month_view"});
        `,
      }}
    />
  );
}
