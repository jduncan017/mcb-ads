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
}

export function ProductImage({
  src,
  alt,
  width = 1000,
  height = 800,
  className = "",
  objectFit = "cover",
  sizes = "(max-width: 1024px) 100vw, 50vw",
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
        className={objectFit === "cover" ? "object-cover" : "object-contain"}
      />
    </div>
  );
}
