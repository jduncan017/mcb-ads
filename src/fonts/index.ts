import { Inter, Big_Shoulders, Courier_Prime } from "next/font/google";

/*
 * ===========================================
 * FONTS — Mobile Craft Bars brand
 * ===========================================
 * Big Shoulders Display: tall, condensed display headings
 * Inter: clean sans-serif body
 * Courier Prime: mono accent
 */

// Body font — Inter (300/400/500)
export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
  weight: ["300", "400", "500"],
});

// Heading font — Big Shoulders, tall condensed display
export const headingFont = Big_Shoulders({
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
