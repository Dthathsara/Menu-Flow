"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getImageUrl,
  PLACEHOLDER_FOOD_IMAGE,
} from "@/lib/image-url";
import { cn } from "./managerUtils";

interface RestaurantProfileImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
  highPriority?: boolean;
}

function isPlaceholderSrc(src: string) {
  return src === PLACEHOLDER_FOOD_IMAGE;
}

export function RestaurantProfileImage({
  src,
  alt,
  className,
  imageClassName,
  eager = false,
  highPriority = false,
}: RestaurantProfileImageProps) {
  const safeSrc = useMemo(() => getImageUrl(src), [src]);
  const normalizedSrc = safeSrc;
  const [displayedSrc, setDisplayedSrc] = useState(() => normalizedSrc);

  useEffect(() => {
    if (!normalizedSrc || normalizedSrc === displayedSrc) {
      return;
    }

    let cancelled = false;
    const image = new Image();

    image.decoding = "async";
    image.onload = () => {
      if (!cancelled) {
        setDisplayedSrc(normalizedSrc);
      }
    };
    image.onerror = () => {
      if (!cancelled && isPlaceholderSrc(displayedSrc)) {
        setDisplayedSrc(PLACEHOLDER_FOOD_IMAGE);
      }
    };
    image.src = normalizedSrc;

    return () => {
      cancelled = true;
    };
  }, [displayedSrc, normalizedSrc]);

  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayedSrc}
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={highPriority ? "high" : "auto"}
        onError={() => {
          if (!isPlaceholderSrc(displayedSrc)) {
            setDisplayedSrc(PLACEHOLDER_FOOD_IMAGE);
          }
        }}
      />
    </div>
  );
}
