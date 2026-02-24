"use client";

import { Users, Sparkles, RefreshCcw, X, Check } from "lucide-react";
import { Button } from "~/components/Button";
import { IconBubble } from "~/components/IconBubble";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { CalModalTrigger } from "~/components/CalModalTrigger";
import { Navbar, Footer } from "~/components/layout";
import { OfferTicker } from "~/components/OfferTicker";
import {
  Hero,
  FeatureGrid,
  ProductShowcase,
  ComparisonTable,
  OfferCard,
  SocialProof,
} from "~/components/sections";

const before = [
  "4+ disconnected tools",
  "Days of manual breakdown",
  "Script changes = manual updates everywhere",
  "Separate AI subscriptions per tool",
];

const after = [
  "One connected platform",
  "Minutes with AI automation",
  "Changes propagate automatically",
  "Multi-model AI access included",
];

const features = [
  {
    icon: (
      <IconBubble size="sm">
        <Users />
      </IconBubble>
    ),
    title: "Up to 12 Seats",
    description:
      "Your entire production team collaborates across all tools — breakdown, schedule, budget, storyboard — in one shared workspace.",
  },
  {
    icon: (
      <IconBubble size="sm">
        <Sparkles />
      </IconBubble>
    ),
    title: "Multi-Model AI",
    description:
      "Sora, VO, and other AI models included — no separate licenses. Generate video, storyboards, and script analysis from one subscription.",
  },
  {
    icon: (
      <IconBubble size="sm">
        <RefreshCcw />
      </IconBubble>
    ),
    title: "Everything Connected",
    description:
      "Change the screenplay and breakdowns, schedules, and budgets update automatically. No more exporting and importing between tools.",
  },
];

export default function TeamsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Navbar */}
      <Navbar
        sticky
        cta={
          <CalModalTrigger>
            {(openModal) => (
              <Button onClick={openModal} arrow>
                Book a Demo
              </Button>
            )}
          </CalModalTrigger>
        }
        className="bg-black/80 text-neutral-100 backdrop-blur-lg"
      />

      {/* Offer Ticker */}
      <OfferTicker />

      {/* Hero */}
      <Hero
        tagline="For Film & TV Studios"
        heading={
          <>
            One Subscription Replaces{" "}
            <span className="text-primary-300">4+ Tools</span>
          </>
        }
        description="Stop juggling separate apps for scripts, breakdowns, schedules, budgets, and AI. FinalBit turns days of manual pre-production into hours — with everything connected in one workspace."
        screenshotDescription="Team workspace showing collaborative breakdown, shared schedule, and real-time budget tracking"
        cta={
          <>
            <CalModalTrigger>
              {(openModal) => (
                <Button
                  onClick={openModal}
                  size="lg"
                  arrow
                  className="glow-cta shadow-theme"
                >
                  See It in Action
                </Button>
              )}
            </CalModalTrigger>
          </>
        }
        image="/product/script-upload.png"
      />

      {/* Pain Points — Before / After */}
      <hr />
      <section className="section-pad relative overflow-hidden bg-black/20">
        <div className="relative mx-auto max-w-[1200px]">
          <FadeIn>
            <Eyebrow className="mb-3 text-center">
              Too Many Tools, Not Enough Time
            </Eyebrow>
            <h2 className="mb-10 text-center">
              Stop Juggling Disconnected Tools
            </h2>
          </FadeIn>
          <div className="mx-auto grid max-w-[1080px] gap-6 md:grid-cols-2">
            {/* Before card */}
            <FadeIn>
              <div className="h-full rounded-xl border border-gray-400/30 bg-linear-to-br from-gray-200/20 to-gray-600/20 p-10">
                <h3 className="mb-6 text-neutral-200/90">Common Workflow</h3>
                <ul className="space-y-4">
                  {before.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-lg">
                      <X
                        className="mt-0.5 h-6 w-6 shrink-0 text-red-400"
                        strokeWidth={2.5}
                      />
                      <span className="text-neutral-200/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* After card */}
            <FadeIn delay={100}>
              <div className="h-full rounded-xl border border-gray-400/30 bg-linear-to-br from-gray-200/20 to-gray-600/20 p-10">
                <h3 className="mb-6 text-white">With FinalBit</h3>
                <ul className="space-y-4">
                  {after.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-lg">
                      <Check
                        className="text-secondary-300 mt-0.5 h-6 w-6 shrink-0"
                        strokeWidth={2.5}
                      />
                      <span className="text-neutral-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Full Product View */}
      <ProductShowcase image="/product/pitch-deck.png" />

      {/* Social Proof */}
      <div className="SocialProofWrapper mb-16 md:mb-40">
        <SocialProof />
      </div>

      {/* Features */}
      <hr />
      <div id="features">
        <FeatureGrid
          heading="Built for Production Teams"
          subheading="Everything your crew needs, connected in one workspace."
          features={features}
          cta={
            <CalModalTrigger>
              {(openModal) => (
                <Button
                  onClick={openModal}
                  size="lg"
                  arrow
                  className="glow-cta shadow-theme w-full md:w-auto"
                >
                  Schedule a Walkthrough
                </Button>
              )}
            </CalModalTrigger>
          }
        />
      </div>

      {/* Comparison Table */}
      <hr />
      <div id="compare">
        <ComparisonTable />
      </div>

      {/* Offer */}
      <hr />
      <OfferCard
        cta={
          <>
            <CalModalTrigger>
              {(openModal) => (
                <Button
                  onClick={openModal}
                  size="lg"
                  arrow
                  className="glow-cta shadow-theme w-full md:w-auto"
                >
                  Claim This Offer
                </Button>
              )}
            </CalModalTrigger>
          </>
        }
      />

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
