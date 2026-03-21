import { Users, Sparkles, RefreshCcw } from "lucide-react";
import { IconBubble } from "~/components/IconBubble";
import { Button } from "~/components/Button";
import { Navbar, Footer } from "~/components/layout";
import { OfferTicker } from "~/components/OfferTicker";
import { CalButton } from "~/components/CalButton";
import {
  Hero,
  FeatureGrid,
  ComparisonTable,
  SocialProof,
  FullPricing,
  Testimonials,
} from "~/components/sections";

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

const testimonials = [
  {
    quote:
      "As an independent filmmaker, FinalBit makes life so much easier. From ironing out my story ideas, to creating a pitch deck, to doing ALL of my pre-production, it is the most advanced, AI enhanced, all in one production assistant.",
    name: "Bryce Hirschberg",
    role: "Director · Writer · Editor · Actor",
    image: "/bryce_hirschberg.webp",
  },
  {
    quote:
      "FinalBit's powerful array of AI-integrated functionalities is so impressive that it has displaced four of my other screenwriting software programs. Thanks to FinalBit, I have completed over a year's worth of work in just three months.",
    name: "J. Thomas Stroud, Jr.",
    role: "Writer",
    image: "/j-thomas-stroud.webp",
  },
  {
    quote:
      "When I use FinalBit, I feel like I've stepped into the future. Basically a one stop tool for writers, directors, and producers of all skill levels. With a few clicks I get coverage, script notes, storyboards, even a shooting schedule.",
    name: "Daniel Farag",
    role: "Actor · Producer · Writer",
    image: "/daniel_farag.webp",
  },
];

export default function TeamsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Navbar */}
      <Navbar
        sticky
        cta={<CalButton arrow buttonId="nav-book-demo">Book a Demo</CalButton>}
        className="bg-black/80 text-neutral-100 backdrop-blur-lg"
      />

      {/* Offer Ticker */}
      <OfferTicker />

      {/* Hero */}
      <Hero
        tagline="For Filmmakers & Production Teams"
        heading={
          <>
            One Platform Replaces{" "}
            <span className="text-primary-300">4+ Tools</span>
          </>
        }
        description="Stop juggling separate apps for scripts, breakdowns, schedules, budgets, and AI. FinalBit turns days of manual pre-production into hours — with everything connected in one workspace. Book a demo and we'll break down your script live so you can see exactly how it works for your project."
        screenshotDescription="Team workspace showing collaborative breakdown, shared schedule, and real-time budget tracking"
        cta={
          <Button
            as="a"
            href="#pricing"
            size="lg"
            arrow
            className="glow-cta shadow-theme"
            data-ph-capture-attribute-button-id="hero-view-pricing"
          >
            View Pricing
          </Button>
        }
        image="/product/script-upload.png"
      />

      {/* Social Proof */}
      <div className="SocialProofWrapper px-6 pb-16 md:pb-40">
        <SocialProof />
      </div>

      {/* Feature Highlights */}
      <hr />
      <div id="features">
        <FeatureGrid
          heading="Built for Production Teams"
          subheading="Everything your crew needs, connected in one workspace."
          features={features}
          cta={
            <Button
              as="a"
              href="#pricing"
              size="lg"
              arrow
              className="glow-cta shadow-theme w-full md:w-auto"
              data-ph-capture-attribute-button-id="features-view-pricing"
            >
              View Pricing
            </Button>
          }
        />
      </div>

      {/* Comparison Table */}
      <hr />
      <div id="compare">
        <ComparisonTable />
      </div>

      {/* Pricing — All 4 Tiers */}
      <hr />
      <div id="pricing">
        <FullPricing />
      </div>

      {/* Testimonials */}
      <hr />
      <Testimonials eyebrow="What Creators Say" testimonials={testimonials} />

      {/* Final CTA */}
      <hr />
      <section className="relative px-6 py-20 md:py-28">
        <div className="gradient-orb bg-primary-300 top-0 -left-32 h-[400px] w-[400px]" />
        <div className="gradient-orb bg-secondary-300 -right-32 bottom-0 h-[300px] w-[300px]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="mb-4">Ready to Replace Your Tool Stack?</h2>
          <p className="mb-8 text-neutral-200">
            Join 45,000+ filmmakers and studios who go from screenplay to full
            pre-production in minutes. Lock in 90% off your first month.
          </p>
          <CalButton size="lg" arrow className="glow-cta shadow-theme" buttonId="footer-cta-demo">
            Book a Demo — Save 90%
          </CalButton>
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
