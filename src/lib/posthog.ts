import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (posthog.__loaded) return;

  // Skip tracking in development to keep PostHog data clean
  if (process.env.NODE_ENV === "development") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // PostHog disabled — no key configured

  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false, // we handle this manually in the provider
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    // We don't use PostHog Surveys, so don't download the surveys.js bundle
    // (~34 KiB + main-thread cost) on every page.
    disable_surveys: true,
  });
}

export { posthog };
