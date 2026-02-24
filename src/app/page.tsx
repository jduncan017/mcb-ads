"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { Navbar, Footer } from "~/components/layout";
import { analytics } from "~/lib/analytics";

const teamSizes = [
  { value: "", label: "Select team size…" },
  { value: "1", label: "Just me" },
  { value: "2-3", label: "2–3 people" },
  { value: "4-5", label: "4–5 people" },
  { value: "6-10", label: "6–10 people" },
  { value: "11-20", label: "11–20 people" },
  { value: "20+", label: "20+ people" },
];

const TEAM_THRESHOLD = 4; // index in teamSizes where it tips to /enterprise

export default function LandingPage() {
  const router = useRouter();

  function handleSelect(value: string) {
    if (!value) return;
    const idx = teamSizes.findIndex((t) => t.value === value);
    const destination = idx >= TEAM_THRESHOLD ? "enterprise" : "small-teams";
    analytics.funnelRouted(value, destination);
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
              <span className="text-primary-300">
                Hours, Not Weeks.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-neutral-200">
              Breakdowns, scheduling, budgets, storyboards, and video — one
              platform, fully connected to your screenplay.
            </p>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="border-primary-200/50 product-image-glow mx-auto mt-10 max-w-lg rounded-2xl border bg-blue-950/20 p-6 md:mt-16 md:p-10">
              <label
                htmlFor="team-size"
                className="mb-6 block text-xl font-medium text-white md:mb-10 md:text-2xl"
              >
                How many people are on your production team?
              </label>
              <div className="relative">
                <select
                  id="team-size"
                  onChange={(e) => handleSelect(e.target.value)}
                  defaultValue=""
                  className="shadow-theme border-primary-300 focus:ring-primary-200 w-full cursor-pointer appearance-none rounded-xl border-2 bg-white px-6 py-5 pr-14 text-xl text-neutral-400 transition focus:ring-2 focus:outline-none"
                >
                  {teamSizes.map((t) => (
                    <option
                      key={t.value}
                      value={t.value}
                      disabled={!t.value}
                      className="bg-white text-neutral-400"
                    >
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="text-primary-300 pointer-events-none absolute top-1/2 right-5 h-6 w-6 -translate-y-1/2"
                  strokeWidth={2.5}
                />
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
