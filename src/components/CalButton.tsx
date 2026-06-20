"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import { Button } from "~/components/Button";
import {
  type ButtonVariant,
  type ButtonSize,
} from "~/components/button-styles";

/** The id of the inline HoneyBook booking section on the funnel page. */
const BOOKING_ANCHOR_ID = "book";

interface CalButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  /**
   * Optional override for the analytics source label. Defaults to the
   * rendered text of `children` when it's a string. Set this when children
   * is JSX (icons, spans) and you still want a clean label in PostHog.
   */
  label?: string;
}

/**
 * Primary CTA button. Scrolls the visitor to the inline HoneyBook booking form
 * (`#book`) on the funnel page.
 *
 * NOTE: The DiscoveryModal qualification flow is PAUSED (we removed the
 * friction while Meta is off and traffic is shifting). The modal code lives in
 * DiscoveryModal.tsx, untouched — to re-enable it, restore the previous version
 * of this file (open a modal on click instead of scrolling to `#book`).
 *
 * Analytics: PostHog autocapture records the click via
 * `data-ph-capture-attribute-button-text`. Every CTA on the page must have
 * unique text so the events distinguish in PostHog.
 */
export function CalButton({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className = "shadow-theme",
  label,
}: CalButtonProps) {
  const trackingLabel = useMemo(() => {
    if (label) return label;
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    return "unlabeled-cal-button";
  }, [label, children]);

  const scrollToForm = useCallback(() => {
    const el = document.getElementById(BOOKING_ANCHOR_ID);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <Button
      as="button"
      type="button"
      variant={variant}
      size={size}
      arrow={arrow}
      className={className}
      onClick={scrollToForm}
      data-ph-capture-attribute-button-text={trackingLabel}
    >
      {children}
    </Button>
  );
}
