"use client";

import { type ReactNode } from "react";
import { Button } from "~/components/Button";
import { usePersistedQueryString } from "~/components/QueryParamProvider";
import { analytics } from "~/lib/analytics";
import {
  type ButtonVariant,
  type ButtonSize,
} from "~/components/button-styles";

const CAL_BASE_URL = "https://cal.com/finalbit/demo-booking";

interface CalButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
}

export function CalButton({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className = "shadow-theme",
}: CalButtonProps) {
  const qs = usePersistedQueryString();
  const href = qs ? `${CAL_BASE_URL}?${qs}` : CAL_BASE_URL;

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
    >
      {children}
    </Button>
  );
}
