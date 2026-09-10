import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Clock,
  Martini,
  Package,
  ShieldCheck,
  UserCheck,
  Users,
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
 * Google Ads landing page — STAFFING-ONLY variant.
 *
 * Why this page exists
 * --------------------
 * The ad group runs two ads. The "bar catering" ad points at /google (full
 * service, packages from $800). The "bartenders for hire" ad pointed at
 * www.mobilecraftbars.com/services/event-staffing on the Framer site, which:
 *   1. carries a native Framer form whose Google Ads conversion action
 *      ("Submit lead form") has never fired once, and
 *   2. is therefore unmeasurable from the ad account, despite taking ~69% of
 *      spend.
 * This page brings that traffic onto the funnel site, where the conversion
 * path (HoneyBook -> /thank-you?booked=1 -> gtag) already works.
 *
 * Deliberate differences from /google
 * -----------------------------------
 * - PRICE IS IN THE HERO. /google hides per-guest pricing on purpose ($25/guest
 *   reads as sticker shock before value is established). Staffing is the
 *   opposite: "bartender for hire" is a rate-shopping query, and someone
 *   comparing an hourly labor rate who cannot find one bounces. $100/hr for a
 *   vetted, insured, TIPS-certified bartender is a defensible number, so we
 *   lead with it and let it pre-qualify the click.
 * - SELF-SELECT SPLIT, HIGH ON THE PAGE. The real risk on staffing terms is a
 *   visitor who actually needs a full bar. The Framer page buried that at the
 *   very bottom. Here it sits right under the form so full-service seekers
 *   route to /google instead of filling in the wrong form and wasting a sales
 *   cycle on both sides.
 * - RISK, NOT ROMANCE. The objection for staffing is liability: you are letting
 *   strangers serve alcohol at your event. Certification and insurance lead the
 *   trust section; the cocktail-pedigree line supports quality underneath it.
 * - STAFFING RATIO GUIDANCE. "How many bartenders do I need" is the question
 *   this visitor actually has. Answering it adds the kind of substantive,
 *   useful content that Quality Score's landing page experience rewards, and
 *   it is the single most-asked question in the inquiry thread.
 * - Hero image is a bartender pouring, NOT the Whiskey Hitch trailer. This page
 *   sells people, not the mobile bar; showing the trailer contradicts the offer.
 *
 * Every CTA label on this page is unique and distinct from /google's, because
 * PostHog autocapture keys on button text (see CalButton).
 */

const siteName = "Mobile Craft Bars";

/** Hourly rates, booking fee and minimum are from the live staffing page. */
const rates = [
  {
    icon: Martini,
    role: "Professional Bartenders",
    blurb:
      "Vetted craft bartenders with years of high-volume service. They run your bar, not just pour at it.",
    price: "$100",
    unit: "per bartender, per hour",
  },
  {
    icon: Users,
    role: "Event Support Staff",
    blurb:
      "Experienced servers and barbacks. Keep the line moving, glassware clear, and ice stocked.",
    price: "$60",
    unit: "per staff member, per hour",
  },
];

const bookingTerms = [
  { icon: Clock, label: "3 hour minimum", note: "Per staff member" },
  { icon: BadgeCheck, label: "$200 booking fee", note: "Per event" },
  {
    icon: Package,
    label: "Travel fees",
    note: "May apply outside Denver metro",
  },
];

const credentials = [
  {
    icon: ShieldCheck,
    label: "Covered by general liability insurance",
    note: "Certificates available for venues that require them",
  },
  {
    icon: BadgeCheck,
    label: "TIPS certified and food safety trained",
    note: "Every bartender on the team, no exceptions",
  },
  {
    icon: UserCheck,
    label: "Vetted for high-volume service",
    note: "They have worked the rush before and stay calm in it",
  },
  {
    icon: Award,
    label: "Craft cocktail backgrounds",
    note: "Hired from Denver bars like Death & Co and Williams & Graham",
  },
];

const goodFitFor = [
  "Venues that already have a bar built in",
  "DIY weddings where you have rented or bought the setup",
  "Corporate events at hotels and conference centers",
  "Anyone who wants full control of the bar design and the bottles",
  "Events where you are supplying the equipment and the alcohol",
];

const howItWorks = [
  {
    title: "Tell us about the event",
    description:
      "Date, venue, guest count, and what you are pouring. Takes about a minute in the form.",
  },
  {
    title: "We tell you how many people you need",
    description:
      "Based on guest count and service style, we recommend a staffing count and send a flat quote within 24 hours. No sales call required.",
  },
  {
    title: "The team shows up ready",
    description:
      "On time, in uniform, briefed on your menu, working from first pour to last call.",
  },
];

/**
 * Standard hospitality staffing ratios. Deliberately given as guidance rather
 * than a promise, since bar complexity moves the number as much as headcount.
 */
const staffingGuide = [
  { guests: "Up to 50 guests", staff: "1 bartender" },
  { guests: "50 to 100 guests", staff: "2 bartenders" },
  { guests: "100 to 175 guests", staff: "2 bartenders + 1 support" },
  { guests: "175 to 250 guests", staff: "3 bartenders + 1 support" },
];

/**
 * Verbatim excerpts from the business's public Google reviews.
 *
 * Selection rule for THIS page: every quote had to be about the PEOPLE — the
 * staffing count, the professionalism, the crowd handling — not about the
 * Whiskey Hitch trailer. Reviews praising the bar itself ("the trailer was
 * amazing", "stunningly charming mobile bar") are great on /google and wrong
 * here, because this page's whole premise is that the client already has a bar.
 *
 * Six, not three: the desktop layout is a 3-column grid, so six fills two clean
 * rows instead of leaving a ragged trailing row, and the mobile carousel pages
 * through all six. On a page where the product IS the people, proof depth is
 * doing more work than it does on the full-service page.
 *
 * Trimmed for length only. No wording was changed or recombined.
 */
const testimonials = [
  {
    quote:
      "He guided me through every step: what cocktails are crowd pleasers, how much to order, how many bartenders were needed, and the right amount of time to set up, serve, and depart. The team he brought with him was top notch. The drinks could have been served at any acclaimed restaurant.",
    name: "Deborah",
    role: "Wedding · 200+ Guests",
  },
  {
    quote:
      "They provided amazing service to all wedding guests and managed the flow of people perfectly. James was very professional, responded quickly to emails and calls, and handled multiple changes to the bar menu, guest count, and the amount of hours contracted.",
    name: "Andi Stemple",
    role: "Wedding · Private Property",
  },
  {
    quote:
      "He and his staff went above and beyond the day of our party. I was super impressed with their ability to serve a large group, and there was never a line. We received so many compliments on the drinks, service and general congeniality of James and his amazing team.",
    name: "Julie Berghoff",
    role: "Engagement Party",
  },
  {
    quote:
      "James was an absolute delight to work with. Such amazing cocktail menu options, and so neat and professional. What a way to please a crowd of 130! He handled the evening with ease. A wedding planner's dream. 10 out of 10!",
    name: "Kerr Murray",
    role: "Wedding · 130 Guests",
  },
  {
    quote:
      "We've had the pleasure of having James serve up the best cocktails in Denver for every private and corporate event we host. He sets the standard, and now we can't imagine an event without him. The matchless service and professionalism makes hiring him a no brainer every single time.",
    name: "Leanne Duque",
    role: "Corporate & Private Events",
  },
  {
    quote:
      "Fantastic experience, and was the highlight of our party. Easy to schedule and book. The drinks were delicious and all of our guests kept complimenting them. Definitely book James!",
    name: "Katie Ryan",
    role: "Private Party",
  },
];

/**
 * Dedicated staffing inquiry form (HoneyBook placement 4). Same account pid as
 * the main contact form, different placement index. Its post-submit redirect
 * points at /thank-you?booked=1, the same URL the full-service form uses, so
 * the existing conversion path applies unchanged.
 */
const STAFFING_PLACEMENT = 4;

export default function StaffingLandingPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-clip">
      {/* Skip link for keyboard / screen-reader users. */}
      <a
        href="#book"
        className="focus:bg-primary-300 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to staffing quote form
      </a>

      <ScrollDepthTracker />

      <Navbar
        sticky
        cta={<CalButton arrow>Get Staffing Rates</CalButton>}
        className="bg-black/80 text-neutral-100 backdrop-blur-lg"
      />

      {/* Hero — rate-forward, because this is a rate-shopping search. */}
      <Hero
        tagline="Denver · Boulder · Front Range · Mountain Venues"
        heading={
          <>
            Hire Denver bartenders <br />
            <span className="text-white">without the full bar package.</span>
          </>
        }
        description="TIPS-certified, insured, craft-trained bartenders for your event. You supply the bar and the bottles, we bring the people. $100 per hour, per bartender."
        screenshotDescription="Mobile Craft Bars bartender pouring cocktails at a Denver event"
        cta={
          <CalButton size="lg" arrow className="glow-cta shadow-theme">
            Get Your Staffing Quote
          </CalButton>
        }
        belowCta={
          <p className="mt-5 max-w-xl text-sm text-neutral-200">
            3 hour minimum · $200 event booking fee · quote back within 24 hours
          </p>
        }
        image="/action-shots/pouring-cocktails.webp"
        priorityImage
      />

      {/* Quote form + how it works. Mirrors /google's proven layout: form is
          the second section, not the last. */}
      <section className="section-pad section-gradient scroll-mt-24" id="book">
        <FadeIn>
          <div className="mx-auto mb-10 max-w-[760px] text-center md:mb-14">
            <Eyebrow className="mb-3">Staffing Quote</Eyebrow>
            <h2 className="text-2xl md:text-3xl">
              Tell us your date and guest count
            </h2>
          </div>
        </FadeIn>

        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-14">
          {/* Left: inquiry form */}
          <FadeIn delay={150} className="lg:w-1/2 lg:shrink-0">
            <Wrapper
              rounded="lg"
              padding="md"
              className="border border-white/10 bg-white"
            >
              <HoneyBookEmbed placement={STAFFING_PLACEMENT} />
            </Wrapper>
          </FadeIn>

          {/* Right: how it works + terms + photo */}
          <div className="flex flex-col lg:flex-1" id="how-it-works">
            <FadeIn delay={200}>
              <div className="mb-6 text-center md:mb-8 lg:text-left">
                <Eyebrow className="mb-3">How It Works</Eyebrow>
                <h3 className="font-heading text-2xl tracking-wide text-white">
                  Three Steps, Flat Pricing
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
                        <p className="text-sm leading-relaxed text-neutral-200">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Wrapper>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={550}>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-neutral-200 sm:flex-row sm:gap-8">
                {bookingTerms.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="text-primary-200 h-4 w-4 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn
              delay={650}
              className="mt-6 hidden grow lg:flex lg:flex-col"
            >
              <div className="relative min-h-[200px] w-full grow overflow-hidden rounded-xl border border-white/10">
                <Image
                  src="/action-shots/james-in-home.webp"
                  alt="Mobile Craft Bars bartender serving guests at a private Denver event"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Self-select split — placed immediately after the form so a full-service
          visitor reroutes before submitting the wrong inquiry. */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1100px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
              <Eyebrow className="mb-3">
                Make Sure You&apos;re In The Right Place
              </Eyebrow>
              <h2>Staffing Only, Or The Whole Bar?</h2>
            </div>
          </FadeIn>
          <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2 md:gap-10">
            <FadeIn delay={100}>
              <Wrapper
                rounded="lg"
                padding="md"
                className="from-primary-300/30 ring-primary-300/40 h-full border border-white/10 bg-linear-to-br to-slate-900 ring-1"
              >
                <p className="text-primary-200 mb-5 text-xs font-semibold tracking-[0.14em] uppercase">
                  Staffing only · this page
                </p>
                <p className="mb-5 text-sm leading-relaxed text-neutral-200">
                  You have the bar, the glassware and the alcohol. You need
                  skilled people behind it. Good fit if you recognise yourself
                  here:
                </p>
                <ul className="space-y-3">
                  {goodFitFor.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <UserCheck className="text-primary-200 mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-sm text-neutral-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </Wrapper>
            </FadeIn>
            <FadeIn delay={200}>
              <Wrapper
                rounded="lg"
                padding="md"
                className="flex h-full flex-col border border-white/10 bg-slate-900/60"
              >
                <p className="text-primary-200 mb-5 text-xs font-semibold tracking-[0.14em] uppercase">
                  Full bar service
                </p>
                <p className="mb-5 text-sm leading-relaxed text-neutral-200">
                  If you do not want to source a bar, glassware, ice, mixers and
                  garnishes yourself, you want the catering package instead. It
                  covers everything except the alcohol, and includes the
                  bartenders.
                </p>
                <ul className="mb-6 space-y-3">
                  <li className="flex items-start gap-3">
                    <Martini className="text-primary-200 mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-sm text-neutral-200">
                      Custom cocktail menu built for your event
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Package className="text-primary-200 mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-sm text-neutral-200">
                      Bar, glassware, tools, ice and garnishes included
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="text-primary-200 mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-sm text-neutral-200">
                      Setup and breakdown handled by the team
                    </span>
                  </li>
                </ul>
                <Link
                  href="/google"
                  className="text-primary-200 hover:text-primary-100 mt-auto inline-flex items-center text-sm font-semibold tracking-wide transition"
                  data-ph-capture-attribute-button-text="staffing-to-full-service"
                >
                  See full bar packages, from $800 →
                </Link>
              </Wrapper>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Rates */}
      <section className="section-pad section-gradient">
        <div className="mx-auto max-w-[1100px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
              <Eyebrow className="mb-3">Hourly Rates</Eyebrow>
              <h2>No Packages, No Markup Games</h2>
            </div>
          </FadeIn>
          <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2 md:gap-10">
            {rates.map(({ icon: Icon, role, blurb, price, unit }, i) => (
              <FadeIn key={role} delay={100 + i * 100}>
                <Wrapper
                  rounded="lg"
                  padding="md"
                  className="from-primary-300/30 flex h-full flex-col border border-white/10 bg-linear-to-br to-slate-900"
                >
                  <Icon className="text-primary-200 mb-4 h-6 w-6" />
                  <h3 className="font-heading mb-2 text-xl tracking-wide text-white">
                    {role}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-neutral-200">
                    {blurb}
                  </p>
                  <div className="mt-auto">
                    <p className="text-primary-200 font-heading text-4xl">
                      {price}
                    </p>
                    <p className="text-sm text-neutral-200">{unit}</p>
                  </div>
                </Wrapper>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={300}>
            <ul className="mx-auto mt-8 flex max-w-[960px] flex-col gap-4 sm:flex-row sm:justify-center sm:gap-10">
              {bookingTerms.map(({ icon: Icon, label, note }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon className="text-primary-200 mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-sm text-neutral-200">{note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* Staffing ratio guidance — answers the question this visitor arrives with */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1100px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
              <Eyebrow className="mb-3">Common Question</Eyebrow>
              <h2>How Many Bartenders Do I Need?</h2>
              <p className="mt-4 text-neutral-200">
                A rough starting point. Full bars, signature cocktails and a
                single service window all push the number up, so tell us what
                you are pouring and we will size it properly.
              </p>
            </div>
          </FadeIn>
          <div className="mx-auto grid max-w-[960px] gap-4 sm:grid-cols-2">
            {staffingGuide.map(({ guests, staff }, i) => (
              <FadeIn key={guests} delay={100 + i * 75}>
                <Wrapper
                  rounded="lg"
                  padding="md"
                  className="flex h-full items-center justify-between gap-4 border border-white/10 bg-slate-900/60"
                >
                  <span className="text-sm text-neutral-200">{guests}</span>
                  <span className="font-heading text-primary-200 text-right text-lg tracking-wide">
                    {staff}
                  </span>
                </Wrapper>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials — liability first, pedigree second */}
      <section className="section-pad section-gradient">
        <div className="mx-auto max-w-[1100px]">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
              <Eyebrow className="mb-3">Who You&apos;re Hiring</Eyebrow>
              <h2>Certified, Insured, And Actually Good</h2>
            </div>
          </FadeIn>
          <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2">
            {credentials.map(({ icon: Icon, label, note }, i) => (
              <FadeIn key={label} delay={100 + i * 75}>
                <Wrapper
                  rounded="lg"
                  padding="md"
                  className="h-full border border-white/10 bg-slate-900/60"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="text-primary-200 mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{label}</p>
                      <p className="text-sm text-neutral-200">{note}</p>
                    </div>
                  </div>
                </Wrapper>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Testimonials
        eyebrow="What Clients Say"
        heading="The people are the product"
        testimonials={testimonials}
      />

      {/* Final CTA */}
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="gradient-orb bg-primary-300 top-0 -left-32 h-[400px] w-[400px]" />
        <div className="gradient-orb bg-secondary-300 -right-32 bottom-0 h-[300px] w-[300px]" />
        <div className="relative mx-auto max-w-[720px] text-center">
          <h2 className="mb-4">Good Bartenders Get Booked Early</h2>
          <p className="mb-8 text-neutral-200">
            Send us your date and guest count. Flat quote back within 24 hours,
            no obligation.
          </p>
          <CalButton size="lg" arrow className="glow-cta shadow-theme">
            Check Bartender Availability
          </CalButton>
        </div>
      </section>

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
