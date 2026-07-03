"use client";

import { useEffect } from "react";
import { analytics } from "~/lib/analytics";

const MILESTONES = [25, 50, 75, 100] as const;

/**
 * Fires a `scroll_depth_reached` PostHog event once per milestone (25/50/75/100)
 * per pageview. Mount once anywhere on a page. Cheap: one passive scroll
 * listener, rAF-throttled, removes itself after 100% is reached.
 */
export function ScrollDepthTracker() {
  useEffect(() => {
    const fired = new Set<number>();
    let ticking = false;

    const measure = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // Very short pages: everything is visible, count as 100.
      const depth =
        scrollable <= 0
          ? 100
          : Math.min(100, ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100);

      for (const m of MILESTONES) {
        if (depth >= m && !fired.has(m)) {
          fired.add(m);
          analytics.scrollDepthReached(m);
        }
      }
      if (fired.size === MILESTONES.length) {
        window.removeEventListener("scroll", onScroll);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    };

    // Initial measure catches short viewports / anchored loads.
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
