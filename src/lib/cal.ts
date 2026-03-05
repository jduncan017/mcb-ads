import { analytics } from "./analytics";

/**
 * Shared Cal.com data attributes for element-click embed triggers.
 * Spread onto any element that should open the booking popup.
 */
export const calAttrs = {
  "data-cal-link": "finalbit/30min",
  "data-cal-namespace": "30min",
  "data-cal-config":
    '{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}',
  onClick: () => analytics.calModalOpened(window.location.pathname),
} as const;
