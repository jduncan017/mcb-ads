import { Lexend_Deca, Playfair_Display, Courier_Prime } from "next/font/google";

/*
 * ===========================================
 * FONTS — Mobile Craft Bars brand
 * ===========================================
 * Playfair Display: elegant serif headings (craft cocktail vibe)
 * Lexend Deca: clean sans-serif body
 * Courier Prime: mono accent
 */

// Body font — Lexend Deca Light/Regular/Medium
export const bodyFont = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-body-face",
  weight: ["300", "400", "500"],
});

// Heading font — Playfair Display, refined serif
export const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading-face",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

// Mono/accent font — Courier Prime
export const monoFont = Courier_Prime({
  subsets: ["latin"],
  variable: "--font-mono-face",
  weight: "400",
});
