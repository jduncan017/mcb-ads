import { Inter } from "next/font/google";

/*
 * ===========================================
 * FONTS — Mobile Craft Bars brand
 * ===========================================
 * Inter: body + headings (readability-first for funnel)
 *
 * WEIGHTS ARE DELIBERATELY MINIMAL. Every weight is a separate font file on
 * the critical path, so only ship what the markup actually renders:
 *   400  body copy (font-normal)
 *   500  font-medium
 *   600  font-semibold + h3/h4
 *   700  font-bold + h1/h2
 * 300 and 800 were being downloaded and never used at those weights. Adding a
 * weight here is fine, but check it's referenced somewhere first.
 *
 * Courier Prime was removed. It was registered in layout.tsx and declared as
 * --font-mono in globals.css, but no component ever applied `font-mono`, so it
 * was a whole webfont family fetched for nothing. --font-mono still resolves,
 * falling back to the system monospace stack.
 */

// Body font — Inter
export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
  weight: ["400", "500"],
  display: "swap",
});

// Heading font — Inter (heavier weights for distinction)
export const headingFont = Inter({
  subsets: ["latin"],
  variable: "--font-heading-face",
  weight: ["600", "700"],
  display: "swap",
});
