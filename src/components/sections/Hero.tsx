import { type ReactNode } from "react";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { ProductImage } from "~/components/ProductImage";

interface HeroProps {
  tagline: string;
  heading: ReactNode;
  description: string;
  cta: ReactNode;
  image?: string;
  screenshotDescription?: string;
}

export function Hero({
  tagline,
  heading,
  description,
  cta,
  image = "/product/script-upload.jpg",
  screenshotDescription,
}: HeroProps) {
  return (
    <section className="section-pad relative overflow-hidden">
      {/* Gradient orb behind hero image */}
      <div className="gradient-orb bg-primary-300 top-1/2 -right-16 hidden h-[500px] w-[500px] -translate-y-1/2 opacity-20 md:block" />

      <div className="relative mx-auto flex max-w-[1400px] flex-col-reverse gap-10 md:items-center md:gap-12 lg:flex-row">
        {/* Copy */}
        <FadeIn className="flex flex-col items-start gap-6 md:shrink-0 lg:w-5/12">
          <Eyebrow className="hidden md:block">{tagline}</Eyebrow>
          <h1>{heading}</h1>
          <p className="max-w-xl text-neutral-200">{description}</p>
          <div className="mt-4 flex w-full max-w-[520px] flex-col gap-4 sm:w-auto sm:flex-row">
            {cta}
          </div>
        </FadeIn>

        {/* Product image */}
        <FadeIn delay={200} className="flex min-w-0 flex-1 items-center">
          <ProductImage
            src={image}
            alt={screenshotDescription ?? "Mobile Craft Bars setup"}
            direction="right"
          />
        </FadeIn>
      </div>
    </section>
  );
}
