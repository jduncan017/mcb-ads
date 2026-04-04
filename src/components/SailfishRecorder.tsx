"use client";

import { useEffect } from "react";

export function SailfishRecorder() {
  useEffect(() => {
    const initSailfishRecorder = async () => {
      if (typeof window !== "undefined") {
        try {
          const { initRecorder } = await import("@sailfish-ai/recorder");
          await initRecorder({
            apiKey: "b457b570-52c6-4cbc-9885-ebd132e95e6e",
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
