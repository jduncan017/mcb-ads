import { Inter, Courier_Prime } from "next/font/google";

/*
 * ===========================================
 * FONTS — Mobile Craft Bars brand
 * ===========================================
 * Inter: body + headings (readability-first for funnel)
 * Courier Prime: mono accent
 */

// Body font — Inter (300/400/500)
export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
  weight: ["300", "400", "500"],
});

// Heading font — Inter (heavier weights for distinction)
export const headingFont = Inter({
  subsets: ["latin"],
  variable: "--font-heading-face",
  weight: ["500", "600", "700", "800"],
});

// Mono/accent font — Courier Prime
export const monoFont = Courier_Prime({
  subsets: ["latin"],
  variable: "--font-mono-face",
  weight: "400",
});
