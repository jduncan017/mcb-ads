import { FadeIn } from "~/components/FadeIn";
import { ProductImage } from "~/components/ProductImage";

interface ProductShowcaseProps {
  image?: string;
}

export function ProductShowcase({
  image = "/product/script-upload.jpg",
}: ProductShowcaseProps) {
  return (
    <section className="relative mt-16 mb-10 overflow-hidden md:mt-40 md:mb-0 md:[mask-image:linear-gradient(to_bottom,black_60%,rgba(0,0,0,0)_90%)] md:[-webkit-mask-image:linear-gradient(to_bottom,black_65%,rgba(0,0,0,0)_90%)]">
      {/* Decorative gradient orb */}
      <div className="gradient-orb bg-primary-300 top-1/2 left-1/2 hidden h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 md:block" />

      <div className="relative mx-auto max-w-[1200px]">
        <FadeIn>
          <h2 className="mb-8 px-4 text-center md:mb-16 md:px-0">
            See Your Entire Pre-Production in One View
          </h2>
        </FadeIn>
        <FadeIn delay={150}>
          <div className="px-6 md:mr-0">
            <ProductImage
              src={image}
              alt="Full product interface with sidebar navigation, script editor, AI breakdown panel, shooting schedule calendar, and storyboard grid"
              direction="center"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
