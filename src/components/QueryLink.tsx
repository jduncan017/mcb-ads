"use client";

import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";
import {
  usePersistedQueryString,
  appendQueryString,
} from "~/components/QueryParamProvider";

type QueryLinkProps = Omit<LinkProps, "href"> & {
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * Drop-in replacement for Next.js `Link` that automatically appends
 * persisted query parameters (UTMs, tracking, etc.) to internal hrefs.
 */
export function QueryLink({ href, children, ...rest }: QueryLinkProps) {
  const qs = usePersistedQueryString();

  return (
    <Link href={appendQueryString(href, qs)} {...rest}>
      {children}
    </Link>
  );
}
