"use client";

import { useEffect } from "react";
import { env } from "~/env";

export function SailfishRecorder() {
  useEffect(() => {
    const apiKey = env.NEXT_PUBLIC_SAILFISH_API_KEY;
    if (!apiKey) return;

    const initSailfishRecorder = async () => {
      if (typeof window !== "undefined") {
        try {
          const { initRecorder } = await import("@sailfish-ai/recorder");
          await initRecorder({
            apiKey,
            domainsToPropagateHeaderTo: [],
            domainsToNotPropagateHeaderTo: [],
            reportIssueShortcuts: {
              enabled: false,
            },
          });
        } catch (error) {
          console.error("Sailfish recorder init failed:", error);
        }
      }
    };
    void initSailfishRecorder();
  }, []);

  return null;
}
