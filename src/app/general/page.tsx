import { Martini, Sparkles, Users } from "lucide-react";
import { IconBubble } from "~/components/IconBubble";
import { Navbar, Footer } from "~/components/layout";
import { CalButton } from "~/components/CalButton";
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
    title: "Premium Bartenders",
    description:
      "BAR-certified bartenders with national competition experience. The same craft-cocktail quality you'd expect from Denver's top cocktail bars — delivered to your event.",
  },
  {
    icon: (
      <IconBubble size="sm">
        <Sparkles />
      </IconBubble>
    ),
    title: "Custom Cocktail Menus",
    description:
      "We design a menu around your event, your guests, and your taste. Signature drinks, classics, and creative mocktails — every pour feels intentional.",
  },
  {
    icon: (
      <IconBubble size="sm">
        <Users />
      </IconBubble>
    ),
    title: "Full-Service Setup",
    description:
      "We bring the bar, glassware, ice, mixers, garnishes, and tools. You provide the venue and the alcohol — we handle everything else, setup through breakdown.",
  },
];

const events = [
  {
    title: "Weddings",
    description:
      "From Denver venues to mountain estates — craft cocktails that match the magic of your day, served by bartenders who won't miss a beat.",
    image: "/action-shots/pouring-cocktails.webp",
    alt: "Bartender pouring cocktails at a wedding",
  },
  {
    title: "Corporate Events",
    description:
      "Holiday parties, client dinners, team celebrations — elevated cocktail service that impresses without the headache of coordinating a caterer plus a bar.",
    image: "/action-shots/hitch.webp",
    alt: "Professional mobile bar setup for corporate events",
  },
  {
    title: "Private Parties",
    description:
      "Birthdays, anniversaries, fundraisers, backyard celebrations — the full bar experience in your home so you can actually be a guest at your own party.",
    image: "/action-shots/james-in-home.webp",
    alt: "Bartender serving cocktails at a private home event",
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
      "The team arrived at our Colorado mountain home with their stunningly charming mobile bar. Thoughtful gestures, attention to detail, exceptional service — I'd give 100 stars if I could.",
    name: "Laura Fronapfel",
    role: "Fundraiser · Colorado Mountains",
    image: "/laura.png",
  },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Navbar */}
      <Navbar
        sticky
        cta={
          <CalButton arrow buttonId="nav-book-call">
            Book a Discovery Call
          </CalButton>
        }
        className="bg-black/80 text-neutral-100 backdrop-blur-lg"
      />

      {/* Hero — page bg */}
      <Hero
        tagline="Denver Mobile Bar · Weddings · Corporate · Private Events"
        heading={
          <>
            We Bring Everything{" "}
            <span className="text-primary-300">But the Alcohol</span>
          </>
        }
        description="Professional bartenders, custom cocktail menus, and full-service setup for weddings, corporate events, and private parties across Denver and the Colorado mountains. You provide the venue and the booze — we handle the rest. Book a free discovery call and we'll design your perfect bar experience."
        screenshotDescription="Mobile Craft Bars event setup with professional bartenders"
        cta={
          <CalButton
            size="lg"
            arrow
            className="glow-cta shadow-theme"
            buttonId="hero-book-call"
          >
            Book a Discovery Call
          </CalButton>
        }
        image="/action-shots/hitch-lake.webp"
      />

      {/* Social Proof — page bg with lifted pill */}
      <div className="SocialProofWrapper px-6 pb-16 md:pb-40">
        <SocialProof />
      </div>

      {/* Services — gradient band */}
      <div id="services">
        <FeatureGrid
          heading="Everything You Need for a Perfect Bar"
          subheading="One team. Turnkey service. So you can actually enjoy your event."
          features={features}
          cta={
            <CalButton
              size="lg"
              arrow
              className="glow-cta shadow-theme w-full md:w-auto"
              buttonId="services-book-call"
            >
              Book a Discovery Call
            </CalButton>
          }
        />
      </div>

      {/* Event Types — page bg */}
      <div id="events">
        <EventTypes
          eyebrow="Events We Serve"
          heading="Which One Are You Planning?"
          subheading="Whatever you're celebrating, we've done it — and we'd love to do yours."
          events={events}
          cta={
            <CalButton
              size="lg"
              arrow
              className="glow-cta shadow-theme w-full md:w-auto"
              buttonId="events-book-call"
            >
              Book a Discovery Call
            </CalButton>
          }
        />
      </div>

      {/* Testimonials — gradient band */}
      <Testimonials eyebrow="What Clients Say" testimonials={testimonials} />

      {/* Final CTA — page bg */}
      <section className="relative px-6 py-20 md:py-28">
        <div className="gradient-orb bg-primary-300 top-0 -left-32 h-[400px] w-[400px]" />
        <div className="gradient-orb bg-secondary-300 -right-32 bottom-0 h-[300px] w-[300px]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="mb-4">Ready to Plan Your Event?</h2>
          <p className="mb-8 text-neutral-200">
            Book a free 15-minute discovery call. We&apos;ll learn about your
            event, design your ideal bar experience, and put together a custom
            quote.
          </p>
          <CalButton
            size="lg"
            arrow
            className="glow-cta shadow-theme"
            buttonId="footer-cta-book-call"
          >
            Book a Discovery Call
          </CalButton>
        </div>
      </section>

      {/* Footer */}
      <hr className="mt-auto" />
      <Footer
        logo={<span className="text-lg font-bold text-white">{siteName}</span>}
        copyright={`© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
        className="text-neutral-200"
      />
    </main>
  );
}
