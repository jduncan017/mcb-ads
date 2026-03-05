"use client";

import { useRouter } from "next/navigation";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { Navbar, Footer } from "~/components/layout";
import { analytics } from "~/lib/analytics";

export default function LandingPage() {
  const router = useRouter();

  function handlePath(category: "small-team" | "enterprise") {
    const destination =
      category === "enterprise" ? "enterprise" : "small-teams";
    analytics.funnelRouted(category, destination);
    router.push(`/${destination}`);
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Navbar */}
      <Navbar
        sticky
        className="bg-black/80 text-neutral-100 backdrop-blur-lg"
      />

      {/* Hero — single focused CTA */}
      <section className="section-pad flex flex-1 items-center">
        <div className="mx-auto max-w-[1200px] text-center">
          <FadeIn>
            <Eyebrow className="mb-4">AI-Powered Pre-Production</Eyebrow>
            <h1>
              Script to Screen.
              <br />
              <span className="text-primary-300">Hours, Not Weeks.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-neutral-200">
              Breakdowns, scheduling, budgets, storyboards, and video — one
              platform, fully connected to your screenplay.
            </p>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="mx-auto mt-10 max-w-4xl md:mt-16">
              <p className="mb-6 text-xl font-medium text-white md:mb-10 md:text-2xl">
                What&apos;s your team size?
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Small Teams */}
                <div className="flex flex-col items-center rounded-xl border border-gray-300/30 bg-linear-to-br from-gray-200/10 to-gray-600/10 px-6 pt-6 pb-16 text-center">
                  {/* Spacer to match enterprise eyebrow height */}
                  <div className="mb-6 h-5" />
                  <h3 className="text-2xl font-semibold text-white">
                    Filmmaker / Small Team
                  </h3>
                  <p className="mt-2 text-neutral-200/70">
                    1–5 people. Start free and upgrade as you grow.
                  </p>
                  <button
                    onClick={() => handlePath("small-team")}
                    className="bg-primary-200/30 text-primary-100 hover:bg-primary-200 mt-10 inline-block cursor-pointer rounded-full px-6 py-4 text-lg font-semibold transition"
                  >
                    Explore Filmmaker Pricing &rarr;
                  </button>
                </div>

                {/* Enterprise */}
                <div className="border-primary-300/30 flex flex-col items-center rounded-xl border bg-linear-to-br from-gray-200/10 to-gray-600/10 px-6 pt-6 pb-16 text-left">
                  <div className="bg-secondary-300/10 border-secondary-300/20 rounded-full border px-4 py-0.5">
                    <span className="text-secondary-300 mb-3 text-xs font-semibold">
                      90% Off First Month
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">
                    Studio / Enterprise
                  </h3>
                  <p className="mt-2 text-neutral-200/70">
                    6+ seats with dedicated onboarding.
                  </p>
                  <button
                    onClick={() => handlePath("enterprise")}
                    className="bg-primary-300 text-primary-100 hover:bg-primary-200 mt-10 inline-block cursor-pointer rounded-full px-6 py-4 text-lg font-semibold transition md:mt-auto"
                  >
                    Explore Studio Pricing &rarr;
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <hr className="mt-auto" />
      <Footer
        logo={<span className="text-lg font-bold text-white">FinalBit</span>}
        copyright="&copy; 2026 FinalBit. All rights reserved."
        className="text-neutral-200"
      />
    </main>
  );
}
