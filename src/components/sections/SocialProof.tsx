import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";

const stats = [
  { value: "Death & Co", label: "Our Bartenders" },
  { value: "Williams & Graham", label: "Our Bartenders" },
  { value: "Lady Jane", label: "Our Bartenders" },
  { value: "BAR 5-Day", label: "Spirits Certified" },
];

export function SocialProof() {
  return (
    <section className="from-primary-400/25 via-primary-300/10 to-primary-400/25 mx-4 max-w-[1200px] rounded-xl border border-white/10 bg-linear-to-b p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-sm md:mx-auto md:rounded-3xl md:p-16">
      <FadeIn>
        <Eyebrow className="mb-6 text-center md:mb-10">
          Our bartenders also work at Denver&apos;s most awarded cocktail bars
        </Eyebrow>
      </FadeIn>
      <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:gap-8">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 100}>
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-white md:text-2xl lg:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-base text-neutral-300">{stat.label}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
