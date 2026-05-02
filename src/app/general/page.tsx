import { Martini, Sparkles, Users, X, Check } from "lucide-react";
import { IconBubble } from "~/components/IconBubble";
import { Navbar, Footer } from "~/components/layout";
import { CalButton } from "~/components/CalButton";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { Wrapper } from "~/components/Wrapper";
import { env } from "~/env";
import {
  Hero,
  FeatureGrid,
  EventTypes,
  SocialProof,
  Testimonials,
} from "~/components/sections";

const siteName = env.NEXT_PUBLIC_SITE_NAME ?? "Mobile Craft Bars";

const features = [
  {
    icon: (
      <IconBubble size="sm">
        <Martini />
      </IconBubble>
    ),
    title: "Real Bartenders, Not Cater Waiters",
    description:
      "Hand-picked from Death & Co, Williams & Graham, Lady Jane, and other top Denver cocktail bars. National competition experience. BAR-certified.",
  },
  {
    icon: (
      <IconBubble size="sm">
        <Sparkles />
      </IconBubble>
    ),
    title: "Custom Menu, Designed for You",
    description:
      "Built around your event, your guests, your vibe. Signature drinks, classics done right, and creative mocktails for non-drinkers.",
  },
  {
    icon: (
      <IconBubble size="sm">
        <Users />
      </IconBubble>
    ),
    title: "Setup to Breakdown",
    description:
      "We bring the bar, glassware, ice, juices, garnishes, and tools. You bring the venue and the booze (we send a shopping list).",
  },
];

const events = [
  {
    title: "Weddings",
    description:
      "Mountain estates, downtown venues, urban backyards. 50 to 200+ guests. Your guests will text you about the cocktails for weeks.",
    image: "/action-shots/pouring-cocktails.webp",
    alt: "Bartender pouring cocktails at a wedding",
  },
  {
    title: "Corporate Events",
    description:
      "Holiday parties, executive dinners, team celebrations, brand launches. Cocktails that match the impression you're making.",
    image: "/action-shots/hitch.webp",
    alt: "Professional mobile bar setup for corporate events",
  },
  {
    title: "Private Parties",
    description:
      "Milestone birthdays, anniversaries, fundraisers. For hosts who care what their guests drink. Minimum 30 guests.",
    image: "/action-shots/james-in-home.webp",
    alt: "Bartender serving cocktails at a private home event",
  },
];

const comparison = [
  {
    label: "Ice",
    them: "Bagged from the gas station",
    us: "Hand-cut, large-format, doesn't water down your drink",
  },
  {
    label: "Menu",
    them: "Vodka soda or vodka cran",
    us: "Custom menu, signature drinks, creative mocktails",
  },
  {
    label: "Ingredients",
    them: "Pre-mixed sour mix and grenadine",
    us: "Fresh juices, house-made syrups, real garnishes",
  },
  {
    label: "Setup",
    them: "Folding table with a tip jar",
    us: "Full mobile bar that fits your venue",
  },
  {
    label: "Bartenders",
    them: "Whoever the caterer found",
    us: "Hand-picked from Denver's most awarded cocktail bars",
  },
];

const pricingFacts = [
  { value: "$25", label: "Per guest, starting" },
  { value: "$800", label: "Minimum event" },
  { value: "3 hrs", label: "Service included" },
  { value: "$100/hr", label: "Per extra bartender hour" },
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
        cta={
          <CalButton arrow>Book a 10-Min Call</CalButton>
        }
        className="bg-black/80 text-neutral-100 backdrop-blur-lg"
      />

      {/* Hero */}
      <Hero
        tagline="Premium Mobile Bartending · Denver & Colorado Mountains"
        heading={
          <>
            You&apos;re not hiring a bartender. You&apos;re hiring{" "}
            <span className="text-primary-300">
              the team behind Denver&apos;s best cocktail bars
            </span>
            .
          </>
        }
        description="Hand-cut ice. House-made ingredients. Custom menus designed for your event. Starting at $25 per guest."
        screenshotDescription="Mobile Craft Bars event setup with professional bartenders"
        cta={
          <CalButton size="lg" arrow className="glow-cta shadow-theme">
            Book My 10-Min Discovery Call
          </CalButton>
        }
        image="/action-shots/hitch-lake.webp"
      />

      {/* Social Proof */}
      <div className="SocialProofWrapper px-6 pb-16 md:pb-32">
        <SocialProof />
      </div>

      {/* Comparison */}
      <section className="section-pad section-gradient">
        <div className="mx-auto max-w-[1200px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[960px] text-center md:mb-14">
              <Eyebrow className="mb-3">The Difference</Eyebrow>
              <h2>
                Most Event Bartenders vs.{" "}
                <span className="text-primary-300">Mobile Craft Bars</span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="mx-auto max-w-[960px] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {/* Header row */}
              <div className="grid grid-cols-2 border-b border-white/10 md:grid-cols-[180px_1fr_1fr]">
                <div className="hidden bg-white/[0.06] px-5 py-4 md:block" />
                <div className="bg-primary-400/40 px-5 py-4 text-center text-base font-semibold text-neutral-100">
                  Most Event Bartenders
                </div>
                <div className="bg-primary-300/40 px-5 py-4 text-center text-base font-semibold text-white">
                  Mobile Craft Bars
                </div>
              </div>

              {comparison.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-2 md:grid-cols-[180px_1fr_1fr] ${
                    i < comparison.length - 1
                      ? "border-b border-white/10"
                      : ""
                  }`}
                >
                  <div className="bg-primary-300/15 col-span-2 flex items-center border-b border-white/10 px-5 py-2 text-xs font-bold tracking-wider text-white uppercase md:col-span-1 md:border-b-0 md:py-3.5 md:text-sm md:tracking-wide md:normal-case">
                    {row.label}
                  </div>
                  <div className="bg-primary-400/15 flex items-center gap-2.5 px-5 py-3.5">
                    <X className="h-4 w-4 shrink-0 text-white/40" />
                    <span className="text-sm text-neutral-200">{row.them}</span>
                  </div>
                  <div
                    className={`bg-primary-300/20 border-primary-300/40 flex items-center gap-2.5 border-l px-5 py-3.5 md:border-l ${
                      i < comparison.length - 1
                        ? "border-b border-b-primary-300/25"
                        : ""
                    }`}
                  >
                    <Check className="text-primary-200 h-4 w-4 shrink-0" />
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

      {/* Event Types */}
      <div id="events">
        <EventTypes
          eyebrow="Events We Serve"
          heading="Which One Are You Planning?"
          events={events}
          cta={
            <CalButton
              size="lg"
              arrow
              className="glow-cta shadow-theme w-full md:w-auto"
            >
              Plan My Event
            </CalButton>
          }
        />
      </div>

      {/* Features */}
      <div id="services">
        <FeatureGrid
          heading="What You Get When You Book Us"
          features={features}
          cta={
            <CalButton
              size="lg"
              arrow
              className="glow-cta shadow-theme w-full md:w-auto"
            >
              Get My Quote
            </CalButton>
          }
        />
      </div>

      {/* Pricing / Qualification */}
      <section className="section-pad" id="pricing">
        <div className="mx-auto max-w-[1200px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[960px] text-center md:mb-14">
              <Eyebrow className="mb-3">Pricing</Eyebrow>
              <h2>
                Starts at{" "}
                <span className="text-primary-300">$25 per guest</span>
              </h2>
            </div>
          </FadeIn>

          <div className="mx-auto grid max-w-[960px] grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {pricingFacts.map((fact, i) => (
              <FadeIn key={fact.label} delay={i * 80}>
                <Wrapper
                  rounded="lg"
                  padding="sm"
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
            <div className="mx-auto mt-8 max-w-[720px] text-center text-sm text-neutral-300 md:text-base">
              Denver Metro &amp; Colorado mountains. Travel fees apply outside
              the metro. You bring the booze (we send a shopping list). Best
              fit for events of 30+ guests.
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials
        eyebrow="What Clients Say"
        heading="The Drinks They&apos;re Still Talking About"
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
