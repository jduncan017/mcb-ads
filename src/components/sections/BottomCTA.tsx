import { FadeIn } from "~/components/FadeIn";
import { Button } from "~/components/Button";
import { calAttrs } from "~/lib/cal";

export function BottomCTA() {
  return (
    <section className="relative px-6 py-20 md:py-28">
      {/* Decorative gradient orbs */}
      <div className="gradient-orb -left-32 top-0 h-[400px] w-[400px] bg-primary-300" />
      <div className="gradient-orb -right-32 bottom-0 h-[300px] w-[300px] bg-secondary-300" />

      <div className="relative mx-auto max-w-2xl text-center">
        <FadeIn>
          <h2 className="mb-4">Ready to Transform Your Pre-Production?</h2>
          <p className="mb-8 text-neutral-200">
            Join thousands of filmmakers who&apos;ve replaced their entire tool
            stack with one connected platform.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button as="link" href="/small-teams" size="lg" className="glow-cta shadow-theme">
              Start Free
            </Button>
            <Button variant="outline" size="lg" {...calAttrs}>
              Book a Demo
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
