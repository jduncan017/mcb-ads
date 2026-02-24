import { List, CalendarDays, LayoutGrid } from "lucide-react";
import { FadeIn } from "~/components/FadeIn";
import { Eyebrow } from "~/components/Eyebrow";
import { IconBubble } from "~/components/IconBubble";
import { ProductImage } from "~/components/ProductImage";

const rows = [
  {
    icon: <List />,
    heading: "AI-Powered Breakdowns",
    description:
      "Upload your screenplay and get a complete breakdown — characters, locations, props, wardrobe — generated in seconds. No more days of manual tagging.",
    shotAlt:
      "Script breakdown panel showing tagged elements, character list, and location summary",
    image: "/product/script.png",
  },
  {
    icon: <CalendarDays />,
    heading: "Schedule & Budget",
    description:
      "AI generates your shooting schedule and production budget directly from the breakdown. Know your numbers before you commit a single dollar.",
    shotAlt:
      "Calendar view with color-coded shooting days, alongside a budget summary with line items",
    image: "/product/budgeting-3.png",
  },
  {
    icon: <LayoutGrid />,
    heading: "Storyboard & Video",
    description:
      "Turn scenes into AI-generated storyboard frames and video clips. Visualize your film before you shoot a single frame.",
    shotAlt:
      "Storyboard grid with AI-generated frames and a video preview player",
    image: "/product/video-editor.png",
  },
];

export function ValueProps() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn>
          <Eyebrow className="mb-3 text-center">Features</Eyebrow>
          <h2 className="mb-12 text-center md:mb-24">
            Everything You Need, One Platform
          </h2>
        </FadeIn>
      </div>
      <div className="mx-auto max-w-[1200px] space-y-16 md:space-y-40">
        {rows.map((row, i) => {
          const imageOnRight = i % 2 === 0;
          return (
            <FadeIn key={row.heading} delay={i * 100}>
              <div
                className={`flex flex-col-reverse items-center gap-6 md:flex-row md:gap-16 ${
                  !imageOnRight ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Copy */}
                <div className="flex max-w-[480px] flex-1 flex-col items-start gap-4 px-4 md:px-0">
                  <div className="Header flex w-full items-center gap-4">
                    <div className="hidden md:block">
                      <IconBubble size="sm">{row.icon}</IconBubble>
                    </div>
                    <h2 className="w-full text-center md:text-start">
                      {row.heading}
                    </h2>
                  </div>
                  <p className="text-center text-neutral-200 md:text-start">
                    {row.description}
                  </p>
                </div>

                {/* Product shot — bleeds off-screen on mobile */}
                <div className="w-full flex-1 px-2 md:mx-0">
                  <ProductImage
                    src={row.image}
                    alt={row.shotAlt}
                    direction={imageOnRight ? "right" : "left"}
                  />
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
