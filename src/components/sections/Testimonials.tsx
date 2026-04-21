"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Wrapper } from "~/components/Wrapper";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  image?: string;
}

interface TestimonialsProps {
  eyebrow?: string;
  heading?: string;
  testimonials: Testimonial[];
}

export function Testimonials({
  eyebrow = "Testimonials",
  heading = "What People Are Saying",
  testimonials,
}: TestimonialsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIdx(idx);
  }

  function scrollTo(idx: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: "smooth" });
  }

  return (
    <section className="section-pad section-gradient">
      <div className="mx-auto max-w-[1400px]">
        <FadeIn>
          <Eyebrow className="mb-3 text-center">{eyebrow}</Eyebrow>
          <h2 className="mb-12 text-center">{heading}</h2>
        </FadeIn>

        {/* Desktop: grid */}
        <div className="hidden gap-8 lg:grid lg:grid-cols-3 lg:items-stretch">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 100} className="h-full">
              <TestimonialCard testimonial={t} />
            </FadeIn>
          ))}
        </div>

        {/* Mobile: scroll-snap carousel */}
        <div className="lg:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="w-full shrink-0 snap-center"
              >
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
          {/* Arrows + dots */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => scrollTo(Math.max(0, activeIdx - 1))}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/20 transition ${
                activeIdx === 0
                  ? "opacity-30"
                  : "opacity-100 active:scale-95"
              }`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIdx
                      ? "w-6 bg-primary-300"
                      : "w-2 bg-neutral-300/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() =>
                scrollTo(Math.min(testimonials.length - 1, activeIdx + 1))
              }
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/20 transition ${
                activeIdx === testimonials.length - 1
                  ? "opacity-30"
                  : "opacity-100 active:scale-95"
              }`}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <Wrapper
      rounded="lg"
      padding="sm"
      className="card-hover flex h-full flex-col border border-gray-400/30 bg-linear-to-br from-gray-200/20 to-gray-600/20"
    >
      <p className="text-xl leading-relaxed font-light text-neutral-200">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="mt-auto flex items-center gap-3 pt-8">
        {t.image ? (
          <Image
            src={t.image}
            alt={t.name}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="font-heading bg-primary-400/40 border-primary-300/40 text-primary-100 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border text-2xl font-semibold"
          >
            {t.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xl font-medium">{t.name}</p>
          <p className="text-lg text-neutral-200">{t.role}</p>
        </div>
      </div>
    </Wrapper>
  );
}
