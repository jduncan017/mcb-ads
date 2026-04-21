"use client";

import { type ReactNode } from "react";
import { Button } from "~/components/Button";
import { usePersistedQueryString } from "~/components/QueryParamProvider";
import { analytics } from "~/lib/analytics";
import { env } from "~/env";
import {
  type ButtonVariant,
  type ButtonSize,
} from "~/components/button-styles";

interface CalButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  buttonId?: string;
}

export function CalButton({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className = "shadow-theme",
  buttonId,
}: CalButtonProps) {
  const qs = usePersistedQueryString();
  const baseUrl = env.NEXT_PUBLIC_BOOKING_URL ?? "#";
  const href = qs && baseUrl !== "#" ? `${baseUrl}?${qs}` : baseUrl;

  return (
    <Button
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      size={size}
      arrow={arrow}
      className={className}
      onClick={() => analytics.calModalOpened(window.location.pathname)}
      {...(buttonId && { "data-ph-capture-attribute-button-id": buttonId })}
    >
      {children}
    </Button>
  );
}
