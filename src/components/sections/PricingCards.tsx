import { Check } from "lucide-react";
import { Button } from "~/components/Button";
import { Wrapper } from "~/components/Wrapper";
import { FadeIn } from "~/components/FadeIn";
const signupUrl = "https://www.finalbitai.com/login?t=signup";

interface PricingTier {
  name: string;
  price: string;
  monthlyPrice?: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
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
    monthlyPrice: "$40",
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
    monthlyPrice: "$100",
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
    highlighted: true,
  },
];

export function PricingCards() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn>
          <h2 className="mb-4 text-center">Simple Pricing</h2>
          <p className="mb-8 text-center text-neutral-200 md:mb-12">
            Start creating. Upgrade when you&apos;re ready.
          </p>
        </FadeIn>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <FadeIn key={tier.name} delay={i * 150} className="flex">
              <Wrapper
                rounded="lg"
                padding="sm"
                className={`card-hover flex flex-col border ${
                  tier.highlighted
                    ? "border-primary-400/50 from-primary-200/5 to-primary-400/5 bg-linear-to-br"
                    : "border-gray-500/30 bg-linear-to-br from-gray-300/20 to-gray-800/20"
                }`}
              >
                <div className="PricingTitle flex w-full justify-between">
                  <h3>{tier.name}</h3>
                  {tier.highlighted && (
                    <span className="bg-primary-300/20 text-primary-300 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold">
                      Best Value
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-white">
                      {tier.price}
                    </span>
                    <span className="text-base text-neutral-300">
                      {tier.period}
                    </span>
                    {tier.monthlyPrice && (
                      <span className="text-base text-neutral-300 line-through">
                        {tier.monthlyPrice}/mo
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-base text-neutral-200">
                  {tier.description}
                </p>
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
                    variant={tier.highlighted ? "primary" : "outline"}
                    size="md"
                    className={`w-full ${tier.highlighted ? "glow-cta" : ""}`}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </Wrapper>
            </FadeIn>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-neutral-300">
          Annual pricing shown — save 30% vs. monthly billing.
        </p>
      </div>
    </section>
  );
}
