import {
  X,
  Check,
  Heart,
  Briefcase,
  PartyPopper,
  Martini,
  Sparkles,
  Users,
} from "lucide-react";
import { Navbar, Footer } from "~/components/layout";
import { CalButton } from "~/components/CalButton";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { Wrapper } from "~/components/Wrapper";
import { env } from "~/env";
import { Hero, SocialProof, Testimonials } from "~/components/sections";

const siteName = "Mobile Craft Bars";

const eventTypes = [
  { icon: Heart, label: "Weddings", note: "Mountain estates to downtown venues" },
  { icon: Briefcase, label: "Corporate Events", note: "Holiday parties, brand launches" },
  { icon: PartyPopper, label: "Private Parties", note: "Birthdays, anniversaries, fundraisers" },
];

const included = [
  { icon: Martini, label: "Expert Mixologists", note: "Hand-picked from award-winning bars" },
  { icon: Sparkles, label: "Custom Menu", note: "Designed around your event and guests" },
  { icon: Users, label: "Full-Service Setup", note: "From planning to cleanup, we handle it" },
];

const comparison = [
  {
    label: "Ice",
    them: "Bagged from the gas station",
    us: "Large cubes that don't water down your drink",
  },
  {
    label: "Menu",
    them: "Vodka soda or vodka cran",
    us: "Custom menus, signature drinks & mocktails",
  },
  {
    label: "Ingredients",
    them: "Sour mix and store-bought grenadine",
    us: "Fresh juices and quality house-made syrups",
  },
  {
    label: "Setup",
    them: "Folding table with a tip jar",
    us: "Full mobile bar that fits your venue",
  },
  {
    label: "Bartenders",
    them: "Hired from craigslist",
    us: "Hand-picked from award-winning cocktail bars",
  },
];

const pricingFacts = [
  { value: "$800", label: "Minimum event cost" },
  { value: "3 hrs", label: "Service included" },
  { value: "$100/hr", label: "Each exta hour, per bartender" },
];

const testimonials = [
  {
    quote:
      "They guided me through every step, and the drinks could have been served at any acclaimed restaurant. I got to thoroughly enjoy my son's wedding day.",
    name: "Deborah",
    role: "Wedding · 200+ Guests",
  },
  {
    quote:
      "They helped us design a drink menu that perfectly fit the vibe of our company gathering. Great drinks, excellent service, fantastic experience from start to finish.",
    name: "Elaine Hochberg",
    role: "Corporate Event",
    image: "/elaine.png",
  },
  {
    quote:
      "The team arrived at our Colorado mountain home with their stunningly charming mobile bar. Thoughtful gestures, attention to detail, exceptional service. I'd give 100 stars if I could.",
    name: "Laura Fronapfel",
    role: "Fundraiser · Colorado Mountains",
    image: "/laura.png",
  },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-clip">
      {/* Navbar */}
      <Navbar
        sticky
        cta={<CalButton arrow>Book a 10-Min Call</CalButton>}
        className="bg-black/80 text-neutral-100 backdrop-blur-lg"
      />

      {/* Hero */}
      <Hero
        tagline="Premium Mobile Bartending · Colorado Front Range"
        heading={
          <>
            Not just bartenders. <br />
            <span className="text-white">
              We&apos;re the team behind Denver&apos;s best cocktail bars.
            </span>
          </>
        }
        description="Hand-cut ice. House-made ingredients. Custom menus designed for your event. Starting at $25 per guest."
        screenshotDescription="Mobile Craft Bars event setup with professional bartenders"
        cta={
          <CalButton size="lg" arrow className="glow-cta shadow-theme">
            Book a 10-Min Discovery Call
          </CalButton>
        }
        image="/action-shots/hitch-lake.webp"
      />

      {/* Social Proof */}
      <div className="SocialProofWrapper px-6 pb-16 md:pb-32">
        <SocialProof />
      </div>

      {/* Built for You — combined Events + What's Included */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1100px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
              <Eyebrow className="mb-3">Built for You</Eyebrow>
              <h2>Who We Serve, What You Get</h2>
            </div>
          </FadeIn>
          <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2 md:gap-10">
            <FadeIn delay={100}>
              <Wrapper
                rounded="lg"
                padding="md"
                className="h-full border border-white/10 bg-linear-to-br from-white/[0.04] to-white/[0.01]"
              >
                <p className="text-primary-200 mb-5 text-xs font-semibold tracking-[0.14em] uppercase">
                  Events We Serve
                </p>
                <ul className="space-y-4">
                  {eventTypes.map(({ icon: Icon, label, note }) => (
                    <li key={label} className="flex items-start gap-3">
                      <Icon className="text-primary-200 mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">{label}</p>
                        <p className="text-sm text-neutral-300">{note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Wrapper>
            </FadeIn>
            <FadeIn delay={200}>
              <Wrapper
                rounded="lg"
                padding="md"
                className="h-full border border-white/10 bg-linear-to-br from-white/[0.04] to-white/[0.01]"
              >
                <p className="text-primary-200 mb-5 text-xs font-semibold tracking-[0.14em] uppercase">
                  What You Get
                </p>
                <ul className="space-y-4">
                  {included.map(({ icon: Icon, label, note }) => (
                    <li key={label} className="flex items-start gap-3">
                      <Icon className="text-primary-200 mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">{label}</p>
                        <p className="text-sm text-neutral-300">{note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Wrapper>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="section-pad section-gradient">
        <div className="mx-auto max-w-[1200px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[960px] text-center md:mb-14">
              <Eyebrow className="mb-3">The Difference</Eyebrow>
              <h2>
                Catering Teams vs.{" "}
                <span className="text-primary-200">Mobile Craft Bars</span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="mx-auto max-w-[960px] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {/* Header row */}
              <div className="grid grid-cols-2 border-b border-white/10 md:grid-cols-[180px_1fr_1fr]">
                <div className="hidden bg-white/6 px-5 py-4 md:block" />
                <div className="bg-primary-400/40 px-5 py-4 text-center text-base font-semibold text-neutral-100">
                  Catering Teams
                </div>
                <div className="bg-primary-300/40 px-5 py-4 text-center text-base font-semibold text-white">
                  Mobile Craft Bars
                </div>
              </div>

              {comparison.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-2 md:h-20 md:grid-cols-[180px_1fr_1fr] ${
                    i < comparison.length - 1 ? "border-b border-white/10" : ""
                  }`}
                >
                  <div className="bg-primary-300/40 col-span-2 flex items-center border-b border-white/10 px-5 py-2 text-xs font-bold tracking-wider text-white uppercase md:col-span-1 md:justify-center md:border-b-0 md:py-3.5 md:text-sm md:tracking-wider md:capitalize">
                    {row.label}
                  </div>
                  <div className="bg-primary-800/15 flex items-center gap-2.5 px-5 py-3.5">
                    <X className="h-4 w-4 shrink-0 text-red-300/80" />
                    <span className="text-sm text-neutral-200">{row.them}</span>
                  </div>
                  <div
                    className={`bg-primary-300/20 border-primary-300/10 flex items-center gap-2.5 border-l px-5 py-3.5 md:border-l ${
                      i < comparison.length - 1
                        ? "border-b-primary-300/25 border-b"
                        : ""
                    }`}
                  >
                    <Check className="h-4 w-4 shrink-0 text-green-300/80" />
                    <span className="text-sm font-medium text-white">
                      {row.us}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing / Qualification */}
      <section className="section-pad" id="pricing">
        <div className="mx-auto max-w-[1200px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[960px] text-center md:mb-14">
              <Eyebrow className="mb-3">Pricing</Eyebrow>
              <h2>
                Starting at{" "}
                <span className="text-primary-300 italic">$25 per guest</span>
              </h2>
            </div>
          </FadeIn>

          <div className="mx-auto grid max-w-[960px] grid-cols-2 gap-4 [&>*:last-child]:col-span-2 [&>*:last-child]:mx-auto [&>*:last-child]:w-[calc(50%-0.5rem)] md:grid-cols-3 md:gap-6 md:[&>*:last-child]:col-span-1 md:[&>*:last-child]:w-auto">
            {pricingFacts.map((fact, i) => (
              <FadeIn key={fact.label} delay={i * 80}>
                <Wrapper
                  rounded="lg"
                  padding="md"
                  className="flex h-full flex-col items-center border border-gray-400/30 bg-linear-to-br from-gray-200/20 to-gray-600/20 text-center"
                >
                  <p className="font-heading text-primary-300 text-3xl font-bold md:text-4xl">
                    {fact.value}
                  </p>
                  <p className="mt-2 text-sm text-neutral-200 md:text-base">
                    {fact.label}
                  </p>
                </Wrapper>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="mx-auto mt-8 max-w-[720px] text-center text-sm leading-loose text-neutral-200/80 italic md:text-base">
              Travel fees apply outside Denver metro. <br /> We provide
              everything except the booze (we send a shopping list).
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials
        eyebrow="What Clients Say"
        heading="They're still talking about the drinks"
        testimonials={testimonials}
      />

      {/* Final CTA */}
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="gradient-orb bg-primary-300 top-0 -left-32 h-[400px] w-[400px]" />
        <div className="gradient-orb bg-secondary-300 -right-32 bottom-0 h-[300px] w-[300px]" />
        <div className="relative mx-auto max-w-[720px] text-center">
          <h2 className="mb-4">Currently Booking Summer Events</h2>
          <p className="mb-8 text-neutral-200">
            Grab a 10-minute call. We&apos;ll design your event and send a
            custom quote.
          </p>
          <CalButton size="lg" arrow className="glow-cta shadow-theme">
            Reserve My Date
          </CalButton>
        </div>
      </section>

      {/* Footer */}
      <hr className="mt-auto" />
      <Footer
        logo={<span className="text-lg font-bold text-white">{siteName}</span>}
        copyright={`© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
        bottomContent={
          env.NEXT_PUBLIC_PRIVACY_POLICY_URL ? (
            <a
              href={env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-300 text-sm text-gray-300 transition"
            >
              Privacy Policy
            </a>
          ) : undefined
        }
        className="text-neutral-200"
      />
    </main>
  );
}
