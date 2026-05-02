"use client";

import { type ReactNode, useState, useMemo } from "react";
import { Button } from "~/components/Button";
import { DiscoveryModal } from "~/components/DiscoveryModal";
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
  /**
   * Optional override for the analytics source label. Defaults to the
   * rendered text of `children` when it's a string. Set this when children
   * is JSX (icons, spans) and you still want a clean label in PostHog.
   */
  label?: string;
}

/**
 * CTA button that opens the discovery-call qualification modal.
 *
 * The modal collects 5 questions (event type, guests, when, budget, contact)
 * and then routes the visitor to Calendly with their answers prefilled. Replaces
 * the old "open Calendly in a new tab" behavior with a higher-conversion
 * progressive flow that filters under-budget leads before they hit the calendar.
 *
 * Analytics: each click fires `cal_modal_opened` with `source` set to the
 * button's visible text (or `label` override). Every CTA on the page must have
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
  const [open, setOpen] = useState(false);

  const trackingLabel = useMemo(() => {
    if (label) return label;
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    return "unlabeled-cal-button";
  }, [label, children]);

  return (
    <>
      <Button
        as="button"
        type="button"
        variant={variant}
        size={size}
        arrow={arrow}
        className={className}
        onClick={() => setOpen(true)}
        data-ph-capture-attribute-button-text={trackingLabel}
      >
        {children}
      </Button>
      <DiscoveryModal
        open={open}
        onClose={() => setOpen(false)}
        buttonId={trackingLabel}
      />
    </>
  );
}
