import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side only. Used in webhook handlers, server components.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    // Meta Conversions API (server-side pixel)
    META_CONVERSIONS_API_TOKEN: z.string().min(1).optional(),
    // Resend (transactional email for lead notifications)
    RESEND_API_KEY: z.string().min(1).optional(),
    // Email address to receive discovery-call lead notifications
    LEAD_NOTIFY_EMAIL: z.string().email().optional(),
    // From-address used when Resend sends the lead notification email.
    // Format: "Display Name <address@verified-domain.com>"
    LEAD_FROM_EMAIL: z.string().min(1).optional(),
    // n8n webhook URL for post-booking automations. Fire-and-forget POST.
    N8N_BOOKING_WEBHOOK_URL: z.string().url().optional(),
    // Calendly Personal Access Token. Used server-side to fetch booked
    // event details (time, location/Meet link) after the postMessage fires.
    // Generate at: calendly.com/integrations/api_webhooks
    CALENDLY_API_TOKEN: z.string().min(1).optional(),
  },

  /**
   * Client-side (must be prefixed NEXT_PUBLIC_). All brand/integration IDs
   * live here so a clone-to-new-client is purely an env swap.
   */
  client: {
    // Booking provider URL (Calendly, Cal.com, etc.) — include full event path
    NEXT_PUBLIC_BOOKING_URL: z.string().url().optional(),
    // Analytics / tracking
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_META_PIXEL_ID: z.string().min(1).optional(),
    // Google Ads account ID for gtag.js (format: "AW-XXXXXXXXXX")
    NEXT_PUBLIC_GOOGLE_ADS_ID: z.string().min(1).optional(),
    // Google Ads conversion label for the booking conversion action
    NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL: z.string().min(1).optional(),
    // Meta domain verification token (Business Manager > Brand Safety > Domains)
    NEXT_PUBLIC_META_DOMAIN_VERIFICATION: z.string().min(1).optional(),
    // Privacy policy URL — required for Meta ad approval, may live on apex domain
    NEXT_PUBLIC_PRIVACY_POLICY_URL: z.string().url().optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    META_CONVERSIONS_API_TOKEN: process.env.META_CONVERSIONS_API_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    LEAD_NOTIFY_EMAIL: process.env.LEAD_NOTIFY_EMAIL,
    LEAD_FROM_EMAIL: process.env.LEAD_FROM_EMAIL,
    N8N_BOOKING_WEBHOOK_URL: process.env.N8N_BOOKING_WEBHOOK_URL,
    CALENDLY_API_TOKEN: process.env.CALENDLY_API_TOKEN,
    NEXT_PUBLIC_BOOKING_URL: process.env.NEXT_PUBLIC_BOOKING_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_GOOGLE_ADS_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
    NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL,
    NEXT_PUBLIC_META_DOMAIN_VERIFICATION:
      process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION,
    NEXT_PUBLIC_PRIVACY_POLICY_URL: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
