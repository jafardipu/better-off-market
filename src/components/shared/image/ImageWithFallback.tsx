// components/shared/PropertyImage.tsx
"use client";

import { skeletonDataURL } from "@/components/skeleton/image-loading";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface PropertyImageProps extends Omit<ImageProps, "src" | "onError" | "placeholder" | "blurDataURL"> {
  src: string | undefined | null;
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  fallbackSrc = "/placeholder_image.jpg",
  alt,
  width,
  height,
  className,
  ...rest
}: PropertyImageProps) {
  // Derive the shown image from `src` on every render. Copying it into state
  // kept the first photo when a reused card got a new property (filter/sort).
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgSrc = !src || failedSrc === src ? fallbackSrc : src;

  return (
    <Image
      // A new image gets a fresh <img> (and blur placeholder) instead of
      // showing the previous photo until it loads.
      key={imgSrc}
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL={skeletonDataURL(
        typeof width === "number" ? width : 1200,
        typeof height === "number" ? height : 1200,
      )}
      className={className}
      onError={() => {
        if (src && imgSrc === src) setFailedSrc(src);
      }}
      {...rest}
    />
  );
}