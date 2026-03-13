"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

const QueryParamContext = createContext<string>("");

/**
 * Returns the stored query string (without leading "?") captured on first load.
 * Append this to internal navigation to carry UTM / tracking params across pages.
 */
export function usePersistedQueryString() {
  return useContext(QueryParamContext);
}

/**
 * Given an internal path (e.g. "/enterprise") and the persisted query string,
 * returns the path with query params appended.
 */
export function appendQueryString(path: string, qs: string) {
  if (!qs) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${qs}`;
}

export function QueryParamProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [persisted, setPersisted] = useState("");

  // Capture query params once on initial mount
  useEffect(() => {
    const qs = searchParams.toString();
    if (qs) {
      setPersisted((prev) => prev || qs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryParamContext.Provider value={persisted}>
      {children}
    </QueryParamContext.Provider>
  );
}
