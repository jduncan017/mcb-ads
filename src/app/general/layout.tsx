import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile Craft Bars | Book a Free Discovery Call",
  description:
    "Full-service mobile bartending for weddings, corporate events, and private parties. Premium bartenders, custom menus, all equipment. You provide the venue and booze. Book a free discovery call.",
};

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
