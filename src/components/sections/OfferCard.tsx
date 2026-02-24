import { type ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "~/components/Button";
import { Wrapper } from "~/components/Wrapper";
import { FadeIn } from "~/components/FadeIn";
import Link from "next/link";

interface OfferCardProps {
  cta?: ReactNode;
}

const perks = [
  "1-on-1 onboarding call — we set up your script for you",
  "12 seats — full team collaboration",
  "All Pro features, unlimited",
  "3 custom AI project setups per month",
  "Premium support",
];

export function OfferCard({ cta }: OfferCardProps) {
  return (
    <section className="section-pad relative overflow-hidden bg-black/20">
      <div className="gradient-orb bg-primary-300 top-1/2 -left-32 h-[400px] w-[400px] -translate-y-1/2" />

      <div className="relative mx-auto flex max-w-[1200px] flex-col-reverse items-center gap-10 md:flex-row md:items-center md:gap-16">
        {/* Left — Offer copy + CTA */}
        <FadeIn className="flex flex-col items-start gap-6 md:w-5/12 md:shrink-0">
          <p className="text-base font-medium tracking-widest uppercase">
            <span className="text-secondary-300">Save 90%</span>
            {" — "}
            <span className="text-primary-300">
              Limited Time Offer
            </span>
          </p>
          <h2>
            Get Started for{" "}
            <span className="text-primary-300">
              $100/mo
            </span>
          </h2>
          <p className="text-neutral-200">
            Lock in 90% off your first month. Full team access, all Pro
            features, and dedicated onboarding — cancel anytime.
          </p>

          <div className="mt-4 w-full max-w-[520px] md:w-auto">
            {cta ?? (
              <Button
                as="a"
                href="#demo"
                size="lg"
                arrow
                className="glow-cta shadow-theme w-full md:w-auto"
              >
                Book Your Demo
              </Button>
            )}
          </div>
        </FadeIn>

        {/* Right — Pricing card with perks */}
        <FadeIn delay={200} className="flex flex-1 flex-col gap-2">
          <Wrapper
            rounded="lg"
            padding="lg"
            className="border-primary-300/40 bg-primary-300/5 border"
          >
            <h3 className="mb-2">Enterprise Plan</h3>
            <p className="mb-6 text-lg text-neutral-300">
              Everything your team needs, nothing you don&apos;t.
            </p>
            <ul className="space-y-3">
              {perks.map((item) => (
                <li key={item} className="flex items-start gap-2 text-lg">
                  <Check
                    className="text-secondary-300 mt-0.5 h-4 w-4 shrink-0"
                    strokeWidth={2.5}
                  />
                  <span className="text-neutral-200">{item}</span>
                </li>
              ))}
            </ul>
          </Wrapper>
          <p className="mt-4 text-sm text-neutral-300">
            Looking for a smaller plan?{" "}
            <Link
              href="/small-teams"
              className="text-primary-200 underline underline-offset-2 transition hover:text-white"
            >
              See small teams pricing
            </Link>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
