import "~/styles/globals.css";

import { Suspense } from "react";
import { type Metadata } from "next";
import { bodyFont, headingFont, monoFont } from "~/fonts";
import { env } from "~/env";
import { PostHogProvider } from "~/components/PostHogProvider";
import { MetaPixel } from "~/components/MetaPixel";
import { GoogleTag } from "~/components/GoogleTag";
import { QueryParamProvider } from "~/components/QueryParamProvider";

const siteName = env.NEXT_PUBLIC_SITE_NAME ?? "Mobile Craft Bars";
const metaVerification = env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION;

export const metadata: Metadata = {
  title: `${siteName} | Denver Mobile Bar & Craft Cocktails`,
  description:
    "Professional bartenders, custom cocktail menus, and full-service setup for weddings, corporate events, and private parties across Denver and the Colorado mountains.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable}`}
    >
      <head>
        {metaVerification && (
          <meta
            name="facebook-domain-verification"
            content={metaVerification}
          />
        )}
        <MetaPixel />
        <GoogleTag />
      </head>
      <body className="font-body min-h-screen bg-neutral-400 leading-normal text-neutral-100">
        <Suspense>
          <PostHogProvider>
            <QueryParamProvider>{children}</QueryParamProvider>
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
