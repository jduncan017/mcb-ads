"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, posthog } from "~/lib/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize during browser idle time so posthog-js doesn't compete with
    // hydration on load (helps mobile Total Blocking Time / landing page exp).
    // Falls back to a short timeout where requestIdleCallback isn't available.
    const start = () => {
      initPostHog();
      setReady(true);
    };
    const w = window as unknown as {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(start, { timeout: 2000 });
    } else {
      const id = setTimeout(start, 1200);
      return () => clearTimeout(id);
    }
  }, []);

  // Capture pageviews once PostHog is ready, and on every route change after.
  // Gating on `ready` (not just posthog.__loaded) guarantees the initial
  // pageview still fires even though init is deferred to idle.
  useEffect(() => {
    if (!ready || !posthog.__loaded) return;
    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [ready, pathname, searchParams]);

  return <>{children}</>;
}
