# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` starts dev server (Next.js + Turbopack)
- `npm run build` runs production build
- `npm run check` runs lint + typecheck in one command
- `npm run lint` / `npm run lint:fix` runs ESLint
- `npm run typecheck` runs TypeScript (`tsc --noEmit`)
- `npm run format:check` / `npm run format:write` runs Prettier

## Architecture

This is a **reusable website/marketing funnel template** built on the T3 stack (Next.js 15, Tailwind CSS v4, TypeScript). The intent is to clone this repo per-project and customize the theme to rebrand.

### Rebrand checklist (per-client clone)

1. **Env vars.** `.env.example` is the source of truth. Copy to `.env` and fill in per-client values:
   - `NEXT_PUBLIC_BOOKING_URL` (Calendly/Cal.com event URL)
   - `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` (new PostHog project per client)
   - `NEXT_PUBLIC_META_PIXEL_ID` (Meta ad-account pixel)
   - `NEXT_PUBLIC_META_DOMAIN_VERIFICATION` (Business Manager domain verification token; outputs the meta tag in `layout.tsx`)
   - `NEXT_PUBLIC_PRIVACY_POLICY_URL` (required for Meta ad approval; can point at an existing apex-domain page)
   - Server-only: `META_CONVERSIONS_API_TOKEN`, `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL` (where lead notifications get sent), `LEAD_FROM_EMAIL` (verified Resend sender, format `Name <addr@verified-domain>`)
   - Brand name (`"Mobile Craft Bars"` strings in `src/app/layout.tsx`, `src/app/general/layout.tsx`, `src/app/general/page.tsx`, `src/app/book/page.tsx`) is hardcoded — swap during the per-client copy pass.
2. **Colors.** `src/styles/globals.css` `@theme` block. Swap Primary / Secondary / Tertiary palettes. Scale is `-100` (lightest) to `-400` (darkest).
3. **Fonts.** `src/fonts/index.ts`. Swap Google Font imports (or local woff2).
4. **Logo and favicon.** Replace `public/logo.png` and `public/favicon.ico`.
5. **Copy.** Per-client funnel script. Main entry: `src/app/general/page.tsx` (root `src/app/page.tsx` redirects here). Section components live in `src/components/sections/`.
6. **Testimonial images.** `public/*.webp`.

### Funnel data flow

Visitor clicks any `CalButton` → `DiscoveryModal` opens with 5-question progressive flow → on submit, POST to `/api/discovery-lead` which (a) sends owner email via Resend and (b) fires Meta Conversions API `Lead` event server-side if traffic is Meta-attributed via `fbclid` / `utm_source` → modal redirects to `/book` with answers stashed in sessionStorage → Calendly inline widget renders with name/email/answers prefilled → on confirm, the widget posts `calendly.event_scheduled` which the page listener catches to fire (1) browser pixel `Schedule` with `eventID` and (2) POST to `/api/booking-confirmed` for the server CAPI `Schedule` (deduped via `event_id`) → redirect to `/thank-you`. Calendly's HoneyBook integration creates the inquiry independently. No Calendly webhook is required (free plan); the postMessage path replaces it.

Base layer rules in `globals.css` auto-apply `font-body` to `body` and `font-heading` to `h1` through `h6`.

### Components

- **`src/components/Wrapper.tsx`** is the core layout primitive. Handles responsive padding (`xs`/`sm`/`lg`), border-radius (`xs` through `xl`), semantic HTML via `as` prop, and background/border/gradient via `className` passthrough. Children own all content styling.

### Path alias

`~/` maps to `./src/` (configured in `tsconfig.json`).

### Environment variables

Validated at build time via `@t3-oss/env-nextjs` in `src/env.js`. Add new env vars there with Zod schemas. Use `SKIP_ENV_VALIDATION=1` to bypass during Docker builds.

### Code style

- Use `type` imports (`import { type Foo }`); enforced by ESLint
- Unused vars prefixed with `_` are allowed
- Prettier with `prettier-plugin-tailwindcss` for class sorting
