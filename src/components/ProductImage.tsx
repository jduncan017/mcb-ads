import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  direction?: "left" | "right" | "center";
  fadeBottom?: boolean;
  className?: string;
  objectFit?: "cover" | "contain";
  sizes?: string;
  /**
   * Set true only for an above-the-fold hero image so Next preloads it and it
   * paints as the LCP element quickly. Never set on below-the-fold images.
   */
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  width = 1000,
  height = 800,
  className = "",
  objectFit = "cover",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
}: ProductImageProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={objectFit === "cover" ? "object-cover" : "object-contain"}
      />
    </div>
  );
}
