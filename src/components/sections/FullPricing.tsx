"use client";

import { Check } from "lucide-react";
import { Button } from "~/components/Button";
import { CalButton } from "~/components/CalButton";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { analytics } from "~/lib/analytics";

const signupUrl = "https://www.finalbitai.com/login?t=signup";

interface Tier {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  enterprise?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Basic",
    price: "$0",
    period: "",
    description:
      "Kickstart your writing adventure with basic tools to explore FinalBit.",
    features: [
      "Basic writing tools",
      "Limited story development features",
      "AI requests with 30-day usage period",
      "15 one-time AI video credits",
      "1 project",
    ],
    cta: "Start Free",
  },
  {
    name: "Creator",
    price: "$28",
    originalPrice: "$40",
    period: "/mo",
    description:
      "Unlimited access to essential writing and pre-production tools.",
    features: [
      "Unlimited scripts & core writing tools",
      "Script breakdown & scheduling",
      "Unlimited AI requests & images",
      "100 monthly AI video credits",
      "Up to 3 collaborative projects",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$70",
    originalPrice: "$100",
    period: "/mo",
    description: "Full automated pre-production suite with advanced AI.",
    features: [
      "Everything in Creator",
      "AI-powered budgets + export (PDF, Excel)",
      "Automated full-script breakdown in minutes",
      "210 monthly AI video credits",
      "Unlimited collaborative projects",
    ],
    cta: "Go Pro",
  },
  {
    name: "Enterprise",
    price: "$100",
    originalPrice: "$999",
    period: "/mo",
    description:
      "Your entire production team — one connected workspace with premium AI.",
    features: [
      "Everything in Pro",
      "Up to 12 team seats",
      "Multi-model AI (Sora, VO & more)",
      "3 custom AI project setups/month",
      "Premium support & live onboarding",
    ],
    cta: "Book a Demo",
    enterprise: true,
  },
];

export function FullPricing() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-[1400px]">
        <FadeIn>
          <Eyebrow className="mb-3 text-center">Pricing</Eyebrow>
          <h2 className="mb-4 text-center">
            One Platform, Every Plan You Need
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-center text-neutral-200 md:mb-12">
            Start free. Scale when you&apos;re ready. Enterprise teams save 90%
            this month.
          </p>
        </FadeIn>

        <div className="grid justify-center gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier, i) => (
            <FadeIn
              key={tier.name}
              delay={i * 100}
              className="mx-auto flex w-full max-w-[600px] md:max-w-none"
            >
              {tier.enterprise ? (
                <EnterpriseTierCard tier={tier} />
              ) : (
                <StandardTierCard tier={tier} />
              )}
            </FadeIn>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-neutral-300">
          Annual pricing shown for Creator &amp; Pro — save 30% vs. monthly.
          Enterprise promo: 90% off first month.
        </p>
      </div>
    </section>
  );
}

function StandardTierCard({ tier }: { tier: Tier }) {
  return (
    <div className="card-hover shadow-theme flex max-w-[400px] flex-col rounded-2xl border border-gray-500/30 bg-linear-to-br from-gray-300/20 to-gray-800/20 px-6 py-10 md:p-6">
      <h3>{tier.name}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-white">
          {tier.price}
        </span>
        <span className="text-base text-neutral-300">{tier.period}</span>
        {tier.originalPrice && (
          <span className="text-base text-neutral-300 line-through">
            {tier.originalPrice}/mo
          </span>
        )}
      </div>
      <p className="mt-2 text-base text-neutral-200">{tier.description}</p>

      <ul className="mt-6 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-base">
            <Check
              className="text-secondary-300 mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={2.5}
            />
            <span className="text-neutral-200">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <Button
          as="a"
          href={signupUrl}
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => analytics.planSignupClicked(tier.name)}
          data-ph-capture-attribute-button-id={`pricing-${tier.name.toLowerCase()}-signup`}
        >
          {tier.cta}
        </Button>
      </div>
    </div>
  );
}

function EnterpriseTierCard({ tier }: { tier: Tier }) {
  return (
    <div className="card-hover glow-cta shadow-theme border-primary-300/60 from-primary-200/10 to-primary-400/10 relative flex max-w-[400px] flex-col rounded-2xl border-2 bg-linear-to-br px-6 py-10 md:p-6">
      {/* Badge */}
      <span className="bg-secondary-300 absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-bold text-black">
        Save 90%
      </span>

      <h3 className="text-primary-200">{tier.name}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-primary-300 font-mono text-3xl font-bold">
          {tier.price}
        </span>
        <span className="text-base text-neutral-300">{tier.period}</span>
        {tier.originalPrice && (
          <span className="text-base text-neutral-400 line-through">
            {tier.originalPrice}/mo
          </span>
        )}
      </div>
      <p className="text-secondary-300 mt-1 text-xs font-medium">
        First month — then $999/mo
      </p>
      <p className="mt-2 text-base text-neutral-200">{tier.description}</p>

      <ul className="mt-6 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-base">
            <Check
              className="text-secondary-300 mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={2.5}
            />
            <span className="text-neutral-100">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <CalButton size="md" arrow className="glow-cta shadow-theme w-full" buttonId="pricing-enterprise-demo">
          {tier.cta}
        </CalButton>
      </div>
    </div>
  );
}
