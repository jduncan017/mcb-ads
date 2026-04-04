import "~/styles/globals.css";

import { Suspense } from "react";
import { type Metadata } from "next";
import { bodyFont, headingFont, monoFont } from "~/fonts";
import { PostHogProvider } from "~/components/PostHogProvider";
import { MetaPixel } from "~/components/MetaPixel";
import { GoogleTag } from "~/components/GoogleTag";
import { SailfishRecorder } from "~/components/SailfishRecorder";
import { QueryParamProvider } from "~/components/QueryParamProvider";

export const metadata: Metadata = {
  title: "FinalBit — AI-Powered Pre-Production",
  description:
    "Breakdowns, scheduling, budgets, storyboards, and video — one AI platform, fully connected to your screenplay.",
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
        <MetaPixel />
        <GoogleTag />
      </head>
      <body className="font-body min-h-screen bg-neutral-400 leading-normal text-neutral-100">
        <SailfishRecorder />
        <Suspense>
          <PostHogProvider>
            <QueryParamProvider>
              <div className="from-primary-400/20 to-primary-400/20 bg-linear-to-r via-transparent">
                {children}
              </div>
            </QueryParamProvider>
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
