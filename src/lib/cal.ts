/**
 * Shared Cal.com data attributes for element-click embed triggers.
 * Spread onto any element that should open the booking popup.
 */
export const calAttrs = {
  "data-cal-link": "finalbit/demo-booking",
  "data-cal-namespace": "demo-booking",
  "data-cal-config":
    '{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}',
} as const;
