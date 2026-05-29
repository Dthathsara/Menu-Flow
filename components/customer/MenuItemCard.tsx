"use client";

import { useState } from "react";
import type { MenuItem, ServingSize } from "@/types/customer";
import {
  CUSTOMER_PLACEHOLDER_IMAGE,
  formatPrice,
  getImageSrc,
} from "@/components/customer/customerUtils";

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: () => void;
  onQuickAdd: (item: MenuItem, serving: ServingSize) => void;
}

const servingOptions: ServingSize[] = ["Small", "Medium", "Large"];

export function MenuItemCard({
  item,
  onSelect,
  onQuickAdd,
}: MenuItemCardProps) {
  const [selectedServing, setSelectedServing] = useState<ServingSize>("Large");
  const imageSrc = getImageSrc(item.image);

  return (
    <>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-3 rounded-[1.35rem] bg-white px-3 py-3 text-left shadow-[0_12px_26px_rgba(122,92,65,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(122,92,65,0.14)] md:hidden"
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border border-[#eadfce] bg-[#f7f0e5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              if (event.currentTarget.src.endsWith(CUSTOMER_PLACEHOLDER_IMAGE)) {
                return;
              }

              event.currentTarget.src = CUSTOMER_PLACEHOLDER_IMAGE;
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-base font-bold leading-5 text-[#7b2b24]">
            {item.name}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.18em] text-[#9d8776]">
            <span>{item.spiceLevel ?? "Chef pick"}</span>
            <span>Prep: {item.prepTime} min</span>
          </div>
          <div className="mt-2 text-lg font-black text-[#2b8a38]">
            {formatPrice(item.basePrice)}
          </div>
        </div>
      </button>

      <article className="hidden h-full flex-col overflow-hidden rounded-[1.55rem] border border-[#e7ddd1] bg-white shadow-[0_16px_32px_rgba(122,92,65,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(122,92,65,0.14)] md:flex">
        <button
          type="button"
          onClick={onSelect}
          className="group relative block h-[220px] w-full overflow-hidden rounded-t-[inherit] bg-[#f4eadc]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={item.name}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
            onError={(event) => {
              if (event.currentTarget.src.endsWith(CUSTOMER_PLACEHOLDER_IMAGE)) {
                return;
              }

              event.currentTarget.src = CUSTOMER_PLACEHOLDER_IMAGE;
            }}
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="inline-flex h-4 w-4 rounded-[4px] border border-white bg-[#1faa2b]" />
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#2e7c38] shadow-sm">
              {item.spiceLevel ?? "Chef pick"}
            </span>
          </div>
          <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#6f5a4d] shadow-sm">
            Customise
          </span>
        </button>

        <div className="flex h-full flex-col p-4">
          <div className="line-clamp-2 text-[1.25rem] font-black leading-6 text-[#7b2b24]">
            {item.name}
          </div>
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-[0.95rem] leading-6 text-[#745f51]">
            {item.description}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 border-b border-[#eee4d7] pb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9d8776]">
              Prep: {item.prepTime} min
            </span>
            <button
              type="button"
              onClick={onSelect}
              className="rounded-md bg-[#f4f1ec] px-3 py-1.5 text-xs font-semibold text-[#6b5648] transition hover:bg-[#ece4d8]"
            >
              View More
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-[1rem] font-semibold text-[#7b2b24]">
                Select Size
              </span>
              <select
                value={selectedServing}
                onChange={(event) =>
                  setSelectedServing(event.target.value as ServingSize)
                }
                className="mt-2 h-11 w-full rounded-[0.8rem] border border-[#e6ded4] bg-[#f5f2ed] px-3 text-[1rem] font-semibold text-[#49372e] outline-none transition focus:border-[#2b8a38]"
              >
                {servingOptions.map((serving) => (
                  <option key={serving} value={serving}>
                    {serving} - {formatPrice(item.servingPrices[serving] ?? 0)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => onQuickAdd(item, selectedServing)}
              className="flex w-full items-center justify-between rounded-[0.9rem] bg-[#188a24] px-4 py-3 text-white transition duration-200 hover:bg-[#116b1b]"
            >
              <span className="text-[1.02rem] font-black">Add</span>
              <span className="text-[1.02rem] font-black">
                {formatPrice(item.servingPrices[selectedServing] ?? 0)}
              </span>
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
