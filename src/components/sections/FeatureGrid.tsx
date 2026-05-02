import { type ReactNode } from "react";
import { Wrapper } from "~/components/Wrapper";
import { FadeIn } from "~/components/FadeIn";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureGridProps {
  heading?: string;
  subheading?: string;
  features: Feature[];
  columns?: 2 | 3;
  cta?: ReactNode;
}

export function FeatureGrid({
  heading,
  subheading,
  features,
  columns = 3,
  cta,
}: FeatureGridProps) {
  const gridCols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <section className="section-pad section-gradient">
      <div className="mx-auto max-w-[1200px]">
        {(heading ?? subheading) && (
          <FadeIn>
            <div className="mx-auto mb-8 max-w-[960px] text-center md:mb-12">
              {heading && <h2>{heading}</h2>}
              {subheading && (
                <p className="mx-auto mt-3 max-w-[720px] text-neutral-200">
                  {subheading}
                </p>
              )}
            </div>
          </FadeIn>
        )}
        <div className={`grid items-stretch gap-6 ${gridCols}`}>
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 100} className="h-full">
              <Wrapper
                rounded="lg"
                padding="sm"
                className="card-hover flex h-full flex-col border border-gray-400/30 bg-linear-to-br from-gray-200/20 to-gray-600/20"
              >
                <div className="mb-4">{f.icon}</div>
                <h3>{f.title}</h3>
                <p className="mt-2 text-base text-neutral-200">
                  {f.description}
                </p>
              </Wrapper>
            </FadeIn>
          ))}
        </div>
        {cta && (
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-[520px] md:w-auto">
              {cta}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
