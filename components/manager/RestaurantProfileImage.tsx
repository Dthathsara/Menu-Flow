"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_IMAGE_PLACEHOLDER_SRC, getRestaurantImageUrl } from "@/lib/image-url";
import { cn } from "./managerUtils";

interface RestaurantProfileImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
  priority?: boolean;
}

export function RestaurantProfileImage({
  src,
  alt,
  className,
  imageClassName,
  eager = false,
  priority = false,
}: RestaurantProfileImageProps) {
  const nextSrc = getRestaurantImageUrl(src, "");
  const [mounted, setMounted] = useState(false);
  const [visibleSrc, setVisibleSrc] = useState(DEFAULT_IMAGE_PLACEHOLDER_SRC);
  const lastValidSrcRef = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!nextSrc) {
      setVisibleSrc(
        lastValidSrcRef.current || DEFAULT_IMAGE_PLACEHOLDER_SRC,
      );
      return;
    }

    if (nextSrc === visibleSrc) {
      return;
    }

    if (nextSrc.startsWith("blob:") || nextSrc.startsWith("data:")) {
      const timeoutId = window.setTimeout(() => {
        lastValidSrcRef.current = nextSrc;
        setVisibleSrc(nextSrc);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!cancelled) {
        lastValidSrcRef.current = nextSrc;
        setVisibleSrc(nextSrc);
      }
    };
    img.onerror = () => {
      if (!cancelled && !lastValidSrcRef.current) {
        setVisibleSrc(DEFAULT_IMAGE_PLACEHOLDER_SRC);
      }
    };
    img.src = nextSrc;

    return () => {
      cancelled = true;
    };
  }, [nextSrc, visibleSrc]);

  function handleError() {
    if (visibleSrc === DEFAULT_IMAGE_PLACEHOLDER_SRC) {
      return;
    }

    setVisibleSrc(
      lastValidSrcRef.current && lastValidSrcRef.current !== visibleSrc
        ? lastValidSrcRef.current
        : DEFAULT_IMAGE_PLACEHOLDER_SRC,
    );
  }

  function handleLoad() {
    if (visibleSrc && visibleSrc !== DEFAULT_IMAGE_PLACEHOLDER_SRC) {
      lastValidSrcRef.current = visibleSrc;
    }
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={visibleSrc}
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
