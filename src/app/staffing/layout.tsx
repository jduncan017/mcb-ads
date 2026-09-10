import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Bartenders in Denver | $100/hr | Mobile Craft Bars",
  description:
    "Hire TIPS-certified, insured bartenders for your Denver event. $100/hour per bartender, 3 hour minimum. You supply the bar and alcohol, we bring the people. Quote within 24 hours.",
};

export default function StaffingLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
