import { type Metadata } from "next";
import { env } from "~/env";

const siteName = env.NEXT_PUBLIC_SITE_NAME ?? "Mobile Craft Bars";

export const metadata: Metadata = {
  title: `${siteName} — Book a Free Discovery Call`,
  description:
    "Full-service mobile bartending for weddings, corporate events, and private parties. Premium bartenders, custom menus, all equipment — you provide the venue and booze. Book a free discovery call.",
};

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
