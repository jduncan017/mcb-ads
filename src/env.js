import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side only. Used in webhook handlers, server components.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    // Booking webhook signature — rename per provider (Cal.com, Calendly, etc.)
    CAL_WEBHOOK_SECRET: z.string().min(1).optional(),
    // Meta Conversions API (server-side pixel)
    META_CONVERSIONS_API_TOKEN: z.string().min(1).optional(),
  },

  /**
   * Client-side (must be prefixed NEXT_PUBLIC_). All brand/integration IDs
   * live here so a clone-to-new-client is purely an env swap.
   */
  client: {
    // Brand
    NEXT_PUBLIC_SITE_NAME: z.string().min(1).optional(),
    // Booking provider URL (Calendly, Cal.com, etc.) — include full event path
    NEXT_PUBLIC_BOOKING_URL: z.string().url().optional(),
    // Analytics / tracking
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_META_PIXEL_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_SAILFISH_API_KEY: z.string().min(1).optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CAL_WEBHOOK_SECRET: process.env.CAL_WEBHOOK_SECRET,
    META_CONVERSIONS_API_TOKEN: process.env.META_CONVERSIONS_API_TOKEN,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_BOOKING_URL: process.env.NEXT_PUBLIC_BOOKING_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_SAILFISH_API_KEY: process.env.NEXT_PUBLIC_SAILFISH_API_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
