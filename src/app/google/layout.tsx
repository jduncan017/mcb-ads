import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Denver Event Bartenders for Hire | Mobile Craft Bars",
  description:
    "Full-service mobile bartending for weddings, corporate events, and private parties across Denver and the Front Range. Licensed, insured, packages from $800. Check availability for your date.",
};

export default function GoogleLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
