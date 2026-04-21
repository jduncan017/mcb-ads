# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (Next.js + Turbopack)
- `npm run build` — Production build
- `npm run check` — Lint + typecheck in one command
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run typecheck` — TypeScript (`tsc --noEmit`)
- `npm run format:check` / `npm run format:write` — Prettier

## Architecture

This is a **reusable website/marketing funnel template** built on the T3 stack (Next.js 15, Tailwind CSS v4, TypeScript). The intent is to clone this repo per-project and customize the theme to rebrand.

### Rebrand checklist (per-client clone)

1. **Env vars** — `.env.example` is the source of truth. Copy to `.env` and fill in per-client values. All brand/integration IDs are env-driven (no hardcoded values in components):
   - `NEXT_PUBLIC_SITE_NAME` — brand name (metadata, footer)
   - `NEXT_PUBLIC_BOOKING_URL` — Calendly/Cal.com event URL
   - `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST` — new PostHog project per client
   - `NEXT_PUBLIC_META_PIXEL_ID` — new Meta ad account pixel
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` — GA4 property
   - `NEXT_PUBLIC_SAILFISH_API_KEY` — session recorder (optional)
   - `CAL_WEBHOOK_SECRET` / `META_CONVERSIONS_API_TOKEN` — server-only
2. **Colors** — `src/styles/globals.css` `@theme` block. Swap Primary / Secondary / Tertiary palettes. Scale is `-100` (lightest) → `-400` (darkest).
3. **Fonts** — `src/fonts/index.ts`. Swap Google Font imports (or local woff2).
4. **Logo & favicon** — replace `public/logo.png` and `public/favicon.ico`.
5. **Copy** — per-client funnel script. Main entry: `src/app/enterprise/page.tsx` (root redirects here). Section components in `src/components/sections/`.
6. **Testimonial images** — `public/*.webp`.

Base layer rules in `globals.css` auto-apply `font-body` to `body` and `font-heading` to `h1`–`h6`.

### Components

- **`src/components/Wrapper.tsx`** — Core layout primitive. Handles responsive padding (`xs`/`sm`/`lg`), border-radius (`xs` through `xl`), semantic HTML via `as` prop, and background/border/gradient via `className` passthrough. Children own all content styling.

### Path alias

`~/` maps to `./src/` (configured in `tsconfig.json`).

### Environment variables

Validated at build time via `@t3-oss/env-nextjs` in `src/env.js`. Add new env vars there with Zod schemas. Use `SKIP_ENV_VALIDATION=1` to bypass during Docker builds.

### Code style

- Use `type` imports (`import { type Foo }`) — enforced by ESLint
- Unused vars prefixed with `_` are allowed
- Prettier with `prettier-plugin-tailwindcss` for class sorting
