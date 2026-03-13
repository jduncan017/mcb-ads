
"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  usePersistedQueryString,
  appendQueryString,
} from "~/components/QueryParamProvider";

interface NavbarProps {
  children?: ReactNode;
  cta?: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function Navbar({
  children,
  cta,
  sticky = false,
  className = "",
}: NavbarProps) {
  const qs = usePersistedQueryString();

  return (
    <nav
      className={`shadow-theme relative ${sticky ? "sticky top-0 z-50" : ""} ${className}`}
    >
      {/* Top bar */}
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2 md:px-8 md:py-4">
        {/* Logo */}
        <Link href={appendQueryString("/", qs)} className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            className="h-12 w-auto md:h-20"
            width={120}
            height={32}
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <div className="mr-8 hidden flex-1 items-end justify-end gap-6 md:flex">
          {children}
        </div>

        {/* CTA — always visible */}
        {cta && <div className="flex items-center">{cta}</div>}
      </div>
    </nav>
  );
}
