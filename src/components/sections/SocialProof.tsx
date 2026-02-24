import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";

const stats = [
  { value: "45,000+", label: "Filmmakers" },
  { value: "70,000+", label: "Scripts Analyzed" },
  { value: "90%", label: "Time Saved" },
  { value: "4.9/5", label: "Rating" },
];

export function SocialProof() {
  return (
    <section className="shadow-theme mx-4 max-w-[1200px] rounded-xl border border-gray-200/20 bg-black/20 p-6 md:mx-auto md:rounded-full md:p-20">
      <FadeIn>
        <Eyebrow className="mb-6 text-center md:mb-10">
          Trusted by filmmakers and studios worldwide
        </Eyebrow>
      </FadeIn>
      <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:gap-8">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 100}>
            <div className="text-center">
              <p className="font-heading text-4xl font-bold text-white md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-lg text-neutral-300">{stat.label}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
