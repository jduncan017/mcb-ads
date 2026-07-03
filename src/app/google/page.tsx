import Image from "next/image";
import {
  Heart,
  Briefcase,
  PartyPopper,
  Martini,
  Sparkles,
  Users,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { Navbar, Footer } from "~/components/layout";
import { CalButton } from "~/components/CalButton";
import { HoneyBookEmbed } from "~/components/HoneyBookEmbed";
import { ScrollDepthTracker } from "~/components/ScrollDepthTracker";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { Wrapper } from "~/components/Wrapper";
import { env } from "~/env";
import { Hero, Testimonials } from "~/components/sections";

/**
 * Google Ads landing page — search-intent variant of /general.
 *
 * /general is the Meta funnel (education-first, built for cold social
 * traffic). This page is for people who just searched "bartender denver"
 * and already want the service: compressed hero, booking form immediately
 * after it, trust and proof below. Keep the two pages independent so Meta
 * can resume on /general untouched.
 *
 * Deliberate differences from /general:
 * - Form is the second section, not the last.
 * - Pricing leads with "packages from $800" (event minimum), not "$25 per
 *   guest" — search visitors comparing bartending services read per-guest
 *   pricing as sticker shock before they've seen the value.
 * - Copy speaks to "hire bartenders in Denver" intent, not "imagine your
 *   event" inspiration.
 */

const siteName = "Mobile Craft Bars";

const eventTypes = [
  {
    icon: Heart,
    label: "Weddings",
    note: "Mountain estates to downtown venues",
  },
  {
    icon: Briefcase,
    label: "Corporate Events",
    note: "Holiday parties, brand launches",
  },
  {
    icon: PartyPopper,
    label: "Private Parties",
    note: "Birthdays, anniversaries, fundraisers",
  },
];

const included = [
  {
    icon: Martini,
    label: "Expert Mixologists",
    note: "Hand-picked from award-winning Denver bars",
  },
  {
    icon: Sparkles,
    label: "Custom Cocktail Menu",
    note: "Designed around your event and guests",
  },
  {
    icon: Users,
    label: "Full-Service Setup",
    note: "Bar, equipment, ice, planning to cleanup",
  },
];

const trustPoints = [
  { icon: ShieldCheck, label: "Licensed & insured" },
  { icon: BadgeCheck, label: "Free consultation" },
];

const howItWorks = [
  {
    title: "Tell us about your event",
    description:
      "Date, location, guest count, and the kind of drinks you're picturing. Takes about a minute in the form.",
  },
  {
    title: "Get your quote within 24 hours",
    description:
      "A real quote tailored to your event, not a price range and a sales call. We'll confirm availability for your date at the same time.",
  },
  {
    title: "We handle the rest",
    description:
      "Custom menu, professional bartenders, full bar setup, ice, and cleanup. You provide the venue and the booze — we send a shopping list.",
  },
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

export default function GoogleLandingPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-clip">
      <ScrollDepthTracker />

      {/* Navbar */}
      <Navbar
        sticky
        cta={<CalButton arrow>Check Availability</CalButton>}
        className="bg-black/80 text-neutral-100 backdrop-blur-lg"
      />

      {/* Hero — compressed, intent-matched */}
      <Hero
        tagline="Denver · Boulder · Front Range · Mountain Venues"
        heading={
          <>
            Denver&apos;s top-rated <br />
            <span className="text-white">event bartenders for hire.</span>
          </>
        }
        description="Licensed, insured, full-service craft cocktail bar for weddings, corporate events, and private parties. Packages from $800."
        screenshotDescription="Mobile Craft Bars event setup with professional bartenders"
        cta={
          <CalButton size="lg" arrow className="glow-cta shadow-theme">
            Check Your Date
          </CalButton>
        }
        belowCta={
          <p className="mt-5 max-w-xl text-sm text-neutral-300">
            Hire some of Denver&apos;s best bartenders — from bars like{" "}
            <span className="font-semibold text-white">Death &amp; Co</span>,{" "}
            <span className="font-semibold text-white">
              Williams &amp; Graham
            </span>{" "}
            &amp; <span className="font-semibold text-white">Lady Jane</span>.
          </p>
        }
        image="/action-shots/hitch-lake.webp"
      />

      {/* Booking form + how it works — centered header, then two columns on
          desktop (form left, steps + proof + photo right); stacked on mobile. */}
      <section className="section-pad section-gradient scroll-mt-24" id="book">
        {/* Centered section title (promoted out of the form column) */}
        <FadeIn>
          <div className="mx-auto mb-10 max-w-[760px] text-center md:mb-14">
            <Eyebrow className="mb-3">Check Availability</Eyebrow>
            <h2 className="text-2xl md:text-3xl">
              Tell us your date, get a quote in 24 hours
            </h2>
          </div>
        </FadeIn>

        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-14">
          {/* Left: booking form */}
          <FadeIn delay={150} className="lg:w-1/2 lg:shrink-0">
            <Wrapper
              rounded="lg"
              padding="md"
              className="border border-white/10 bg-white"
            >
              <HoneyBookEmbed />
            </Wrapper>
          </FadeIn>

          {/* Right: how it works + proof + photo */}
          <div className="flex flex-col lg:flex-1" id="how-it-works">
            <FadeIn delay={200}>
              <div className="mb-6 text-center md:mb-8 lg:text-left">
                <Eyebrow className="mb-3">How It Works</Eyebrow>
                <h3 className="font-heading text-2xl tracking-wide text-white">
                  Three Steps, No Surprises
                </h3>
              </div>
            </FadeIn>
            <div className="flex flex-col gap-4">
              {howItWorks.map((step, i) => (
                <FadeIn key={step.title} delay={250 + i * 100}>
                  <Wrapper
                    rounded="lg"
                    padding="md"
                    className="from-primary-300/30 border border-white/10 bg-linear-to-br to-slate-900"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-400 text-primary-100 ring-primary-300/40 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-heading mb-1 text-xl tracking-wide text-white">
                          {step.title}
                        </h4>
                        <p className="text-sm leading-relaxed text-neutral-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Wrapper>
                </FadeIn>
              ))}
            </div>

            {/* Proof points + pricing note under the steps */}
            <FadeIn delay={550}>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-neutral-200 sm:flex-row sm:gap-8">
                {trustPoints.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="text-primary-200 h-4 w-4 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-loose text-neutral-200/80 italic">
                Packages from $800 including 3 hours of service. Travel fees
                apply outside Denver metro.
              </p>
            </FadeIn>

            {/* Photo fills the extra desktop height beside the form */}
            <FadeIn
              delay={650}
              className="mt-6 hidden grow lg:flex lg:flex-col"
            >
              <div className="relative min-h-[200px] w-full grow overflow-hidden rounded-xl border border-white/10">
                <Image
                  src="/action-shots/pouring-cocktails.webp"
                  alt="Mobile Craft Bars mixologist pouring craft cocktails"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Who we serve / what you get */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1100px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
              <Eyebrow className="mb-3">Full-Service Bartending</Eyebrow>
              <h2>More Than Bartenders — a Complete Bar</h2>
            </div>
          </FadeIn>
          <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2 md:gap-10">
            <FadeIn delay={100}>
              <Wrapper
                rounded="lg"
                padding="md"
                className="from-primary-300/30 h-full border border-white/10 bg-linear-to-br to-slate-900"
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
                className="from-primary-300/30 h-full border border-white/10 bg-linear-to-br to-slate-900"
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

      {/* Testimonials */}
      <Testimonials
        eyebrow="What Clients Say"
        heading="They're still talking about the drinks"
        testimonials={testimonials}
      />

      {/* Final CTA — scrolls back up to the form */}
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="gradient-orb bg-primary-300 top-0 -left-32 h-[400px] w-[400px]" />
        <div className="gradient-orb bg-secondary-300 -right-32 bottom-0 h-[300px] w-[300px]" />
        <div className="relative mx-auto max-w-[720px] text-center">
          <h2 className="mb-4">Dates Book Up Fast in Summer</h2>
          <p className="mb-8 text-neutral-200">
            Check availability for your date. Quote within 24 hours, no
            obligation.
          </p>
          <CalButton size="lg" arrow className="glow-cta shadow-theme">
            Check My Date Now
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
