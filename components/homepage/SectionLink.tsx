"use client";

import { MouseEvent, type ComponentPropsWithoutRef } from "react";

import { SECTION_GAP } from "@/components/common/spacing";

const HASH_LINK_PATTERN = /^#[a-z0-9-]+$/i;

type SectionLinkProps = ComponentPropsWithoutRef<"a"> & {
  navigationDelay?: number;
};

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function getHeaderOffset() {
  const header = document.querySelector("header");

  if (header instanceof HTMLElement) {
    return header.getBoundingClientRect().height + SECTION_GAP;
  }

  const fallbackHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
  );

  return (Number.isNaN(fallbackHeight) ? 92 : fallbackHeight) + SECTION_GAP;
}

export function scrollToSection(hash: string) {
  if (!HASH_LINK_PATTERN.test(hash)) {
    return false;
  }

  const target = document.querySelector(hash);

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const top =
    window.scrollY + target.getBoundingClientRect().top - getHeaderOffset();
  const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;

  if (window.location.hash === hash) {
    window.history.replaceState(null, "", nextUrl);
  } else {
    window.history.pushState(null, "", nextUrl);
  }

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });

  return true;
}

export function SectionLink({
  href,
  onClick,
  navigationDelay = 0,
  ...props
}: SectionLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      !href ||
      !HASH_LINK_PATTERN.test(href) ||
      event.button !== 0 ||
      isModifiedClick(event) ||
      props.target === "_blank"
    ) {
      return;
    }

    event.preventDefault();

    window.setTimeout(() => {
      if (!scrollToSection(href)) {
        window.location.hash = href;
      }
    }, navigationDelay);
  };

  return <a {...props} href={href} onClick={handleClick} />;
}
