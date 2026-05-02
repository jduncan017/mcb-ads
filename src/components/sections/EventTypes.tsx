import { type ReactNode } from "react";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { ProductImage } from "~/components/ProductImage";

interface EventType {
  title: string;
  description: string;
  image: string;
  alt: string;
}

interface EventTypesProps {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  events: EventType[];
  cta?: ReactNode;
}

export function EventTypes({
  eyebrow,
  heading,
  subheading,
  events,
  cta,
}: EventTypesProps) {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-[1200px]">
        {(eyebrow ?? heading ?? subheading) && (
          <FadeIn>
            <div className="mx-auto mb-8 max-w-[960px] text-center md:mb-12">
              {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
              {heading && <h2>{heading}</h2>}
              {subheading && (
                <p className="mx-auto mt-3 max-w-[720px] text-neutral-200">
                  {subheading}
                </p>
              )}
            </div>
          </FadeIn>
        )}

        <div className="grid items-stretch gap-6 sm:grid-cols-3">
          {events.map((e, i) => (
            <FadeIn key={e.title} delay={i * 100} className="h-full">
              <div className="card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-gray-400/30 bg-linear-to-br from-gray-200/20 to-gray-600/20">
                <ProductImage
                  src={e.image}
                  alt={e.alt}
                  width={4}
                  height={3}
                  className="rounded-none"
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3>{e.title}</h3>
                  <p className="mt-2 text-base text-neutral-200">
                    {e.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {cta && (
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-[520px] md:w-auto">{cta}</div>
          </div>
        )}
      </div>
    </section>
  );
}
