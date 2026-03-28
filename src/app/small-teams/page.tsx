import { redirect } from "next/navigation";
// import { type Metadata } from "next";
// import { QueryLink } from "~/components/QueryLink";
//
// import { Button } from "~/components/Button";
// import { FadeIn } from "~/components/FadeIn";
// import { Eyebrow } from "~/components/Eyebrow";
// import { ProductImage } from "~/components/ProductImage";
// import { Navbar, Footer } from "~/components/layout";
// const signupUrl = "https://www.finalbitai.com/login?t=signup";
// import {
//   Hero,
//   ProductShowcase,
//   ValueProps,
//   PricingCards,
//   Testimonials,
//   SocialProof,
// } from "~/components/sections";
//
// export const metadata: Metadata = {
//   title: "FinalBit — AI Pre-Production for Filmmakers",
//   description:
//     "Upload your screenplay. Get a full breakdown, schedule, budget, and storyboard in minutes. Built for individual filmmakers and creators.",
// };
//
// const steps = [
//   {
//     number: "01",
//     title: "Upload Your Script",
//     description:
//       "Drag and drop your screenplay. FinalBit reads and understands it instantly.",
//   },
//   {
//     number: "02",
//     title: "AI Does the Heavy Lifting",
//     description:
//       "Breakdown, schedule, budget, and storyboard are generated automatically from your screenplay.",
//   },
//   {
//     number: "03",
//     title: "Create & Iterate",
//     description:
//       "Refine your pre-production. Generate video, run script analysis, collaborate with the AI co-pilot.",
//   },
// ];
//
// const testimonials = [
//   {
//     quote:
//       "As an independent filmmaker, FinalBit makes life so much easier. From ironing out my story ideas, to creating a pitch deck, to doing ALL of my pre-production, it is the most advanced, AI enhanced, all in one production assistant.",
//     name: "Bryce Hirschberg",
//     role: "Director · Writer · Editor · Actor",
//     image: "/bryce_hirschberg.webp",
//   },
//   {
//     quote:
//       "FinalBit's powerful array of AI-integrated functionalities is so impressive that it has displaced four of my other screenwriting software programs. Thanks to FinalBit, I have completed over a year's worth of work in just three months.",
//     name: "J. Thomas Stroud, Jr.",
//     role: "Writer",
//     image: "/j-thomas-stroud.webp",
//   },
//   {
//     quote:
//       "When I use FinalBit, I feel like I've stepped into the future. Basically a one stop tool for writers, directors, and producers of all skill levels. With a few clicks I get coverage, script notes, storyboards, even a shooting schedule.",
//     name: "Daniel Farag",
//     role: "Actor · Producer · Writer",
//     image: "/daniel_farag.webp",
//   },
// ];

export default function SoloPage() {
  redirect("/enterprise");

  // return (
  //   <main className="flex min-h-screen flex-col">
  //     {/* Navbar */}
  //     <Navbar
  //       sticky
  //       cta={
  //         <Button as="a" href={signupUrl} arrow>
  //           Start Free
  //         </Button>
  //       }
  //       className="bg-black/80 text-neutral-100 backdrop-blur-lg"
  //     />
  //
  //     {/* Hero */}
  //     <Hero
  //       tagline="For Filmmakers & Creators"
  //       heading={
  //         <>
  //           Upload Your Screenplay.{" "}
  //           <span className="text-primary-300">
  //             Get a Full Breakdown in Minutes.
  //           </span>
  //         </>
  //       }
  //       description="Stop spending days on manual pre-production. FinalBit handles breakdowns, scheduling, budgeting, storyboards, and video — so you can focus on the creative work."
  //       screenshotDescription="Script upload interface with drag-and-drop zone and a preview of the AI-generated breakdown"
  //       cta={
  //         <Button
  //           as="a"
  //           href={signupUrl}
  //           size="lg"
  //           arrow
  //           className="glow-cta shadow-theme"
  //         >
  //           Try It Free
  //         </Button>
  //       }
  //       image="/product/script-upload.png"
  //     />
  //
  //     {/* Full Product View */}
  //     <ProductShowcase image="/product/pitch-deck.png" />
  //
  //     {/* Social Proof */}
  //     <div className="SocialProofWrapper px-6 pb-16 md:pb-40">
  //       <SocialProof />
  //     </div>
  //
  //     {/* Feature Deep-Dives (alternating copy + product shots) */}
  //     <div id="features" className="mb-10 md:mb-20">
  //       <hr />
  //       <ValueProps />
  //       <hr />
  //     </div>
  //
  //     {/* How It Works */}
  //     <hr />
  //     <section className="section-pad shadow-theme relative overflow-hidden bg-black/20">
  //       <div className="relative mx-auto max-w-[600px]">
  //         <FadeIn>
  //           <Eyebrow className="mb-3 text-center">Getting Started</Eyebrow>
  //           <h2 className="mb-12 text-center">How It Works</h2>
  //         </FadeIn>
  //         <div className="space-y-8">
  //           {steps.map((step, i) => (
  //             <FadeIn key={step.number} delay={i * 100}>
  //               <div className="flex gap-5">
  //                 <div className="bg-primary-300/20 text-primary-300 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold">
  //                   {step.number}
  //                 </div>
  //                 <div>
  //                   <h3>{step.title}</h3>
  //                   <p className="mt-2 text-lg text-neutral-200">
  //                     {step.description}
  //                   </p>
  //                 </div>
  //               </div>
  //             </FadeIn>
  //           ))}
  //         </div>
  //       </div>
  //     </section>
  //
  //     {/* Pricing */}
  //     <hr />
  //     <div id="pricing">
  //       <PricingCards />
  //     </div>
  //
  //     {/* Testimonials */}
  //     <hr />
  //     <Testimonials eyebrow="What Creators Say" testimonials={testimonials} />
  //
  //     {/* Final CTA */}
  //     <hr />
  //     <section id="signup" className="section-pad relative overflow-hidden">
  //       <div className="gradient-orb bg-primary-300 top-1/2 -left-32 h-[400px] w-[400px] -translate-y-1/2" />
  //       <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-10 md:flex-row md:gap-16">
  //         <FadeIn delay={200} className="flex min-w-0 flex-1 items-center">
  //           <ProductImage
  //             src="/product/schedules-1.png"
  //             alt="FinalBit product interface showing script breakdown and scheduling"
  //             direction="left"
  //           />
  //         </FadeIn>
  //         <FadeIn className="flex flex-col items-start gap-6 md:w-5/12 md:shrink-0">
  //           <Eyebrow>Start Creating</Eyebrow>
  //           <h2>Ready to Transform Your Pre-Production?</h2>
  //           <p className="text-neutral-200">
  //             Join thousands of filmmakers who go from screenplay to full
  //             pre-production in minutes. Free to start, no credit card required.
  //           </p>
  //           <div className="mt-4 w-full max-w-[520px] md:w-auto">
  //             <Button
  //               as="a"
  //               href={signupUrl}
  //               size="lg"
  //               arrow
  //               className="glow-cta shadow-theme w-full md:w-auto"
  //             >
  //               Get Started Now
  //             </Button>
  //           </div>
  //           <p className="mt-4 text-sm text-neutral-300">
  //             Have a larger team?{" "}
  //             <QueryLink
  //               href="/enterprise"
  //               className="text-primary-200 underline underline-offset-2 transition hover:text-white"
  //             >
  //               See Enterprise pricing
  //             </QueryLink>
  //           </p>
  //         </FadeIn>
  //       </div>
  //     </section>
  //
  //     {/* Footer */}
  //     <hr className="mt-auto" />
  //     <Footer
  //       logo={<span className="text-lg font-bold text-white">FinalBit</span>}
  //       copyright="&copy; 2026 FinalBit. All rights reserved."
  //       className="text-neutral-200"
  //     />
  //   </main>
  // );
}
