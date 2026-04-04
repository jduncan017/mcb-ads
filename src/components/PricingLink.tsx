"use client";

import { type ReactNode } from "react";
import { Button } from "~/components/Button";
import { analytics } from "~/lib/analytics";
import {
  type ButtonVariant,
  type ButtonSize,
} from "~/components/button-styles";

interface PricingLinkProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  source: string;
}

/**
 * "View Pricing" anchor button that fires a `pricing_viewed` event.
 * Use this instead of a plain Button for #pricing links so we get
 * reliable custom-event tracking in PostHog funnels.
 */
export function PricingLink({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  source,
}: PricingLinkProps) {
  return (
    <Button
      as="a"
      href="#pricing"
      variant={variant}
      size={size}
      arrow={arrow}
      className={className}
      onClick={() => analytics.pricingViewed(source)}
      data-ph-capture-attribute-button-id={`${source}-view-pricing`}
    >
      {children}
    </Button>
  );
}
