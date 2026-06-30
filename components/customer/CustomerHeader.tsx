import type { RestaurantInfo } from "@/types/customer";
<<<<<<< HEAD
=======
import {
  getImageUrl,
  isBackendUploadImageSrc,
  PLACEHOLDER_FOOD_IMAGE,
} from "@/lib/image-url";
>>>>>>> Dulnith

interface CustomerHeaderProps {
  restaurant: RestaurantInfo;
}

export function CustomerHeader({ restaurant }: CustomerHeaderProps) {
<<<<<<< HEAD
  return (
    <section className="w-full rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] px-4 py-4 shadow-[0_18px_48px_rgba(108,79,55,0.08)] sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full rounded-[1.5rem] bg-[linear-gradient(160deg,#fffdf8_0%,#f6eee3_60%,#efe4d7_100%)] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-5 sm:py-6 md:px-8 md:py-8 lg:px-10">
=======
  const imageSrc = getCustomerRestaurantImageSrc(restaurant);
  const businessType = restaurant.businessType?.trim() ?? "";
  const shouldInlineBusinessType = businessType.length > 0 && businessType.length <= 12;

  return (
    <section className="w-full rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] px-4 py-4 shadow-[0_18px_48px_rgba(108,79,55,0.08)] sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full rounded-[1.5rem] bg-[linear-gradient(160deg,#fffdf8_0%,#f6eee3_60%,#efe4d7_100%)] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-5 sm:py-6 md:px-8 md:py-8 lg:px-10">
        <div className="relative mb-5 flex h-44 items-center justify-center overflow-hidden rounded-[1.25rem] border border-[#eadfce] bg-[#f2eadf] sm:h-52 md:h-60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={imageSrc}
            src={imageSrc}
            alt={restaurant.name}
            className="max-h-full max-w-full object-contain"
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied === "true") {
                return;
              }

              event.currentTarget.dataset.fallbackApplied = "true";
              if (!event.currentTarget.src.endsWith(PLACEHOLDER_FOOD_IMAGE)) {
                event.currentTarget.src = PLACEHOLDER_FOOD_IMAGE;
              }
            }}
          />
        </div>

>>>>>>> Dulnith
        <div className="space-y-4 md:flex md:flex-col md:items-center md:justify-center md:space-y-5 md:text-center">
          <div className="inline-flex rounded-full bg-[#f2eadf] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#2c8b47]">
            {restaurant.bannerLabel}
          </div>
<<<<<<< HEAD
          <div className="flex items-end gap-1 leading-none md:justify-center">
            <span className="text-[2.35rem] font-black tracking-[-0.05em] text-[#19724d] sm:text-[3rem] md:text-[3.3rem]">
              {restaurant.titlePrefix}
            </span>
            <span className="pb-1 font-serif text-[2.1rem] italic text-[#c7463d] sm:text-[2.7rem] md:text-[3rem]">
              {restaurant.titleAccent}
            </span>
=======
          <div className="flex flex-wrap items-baseline justify-start gap-x-2 gap-y-1 leading-none md:justify-center">
            <span className="text-[2.05rem] font-black text-[#19724d] sm:text-[2.85rem] md:text-[3.3rem]">
              {restaurant.name}
            </span>
            {businessType ? (
              <span
                className={`font-serif text-[1.85rem] italic text-[#c7463d] sm:text-[2.45rem] md:text-[3rem] ${
                  shouldInlineBusinessType ? "" : "w-full md:w-auto"
                }`}
              >
                {businessType}
              </span>
            ) : null}
>>>>>>> Dulnith
          </div>
          <p className="text-xs uppercase tracking-[0.26em] text-[#927663] md:text-sm">
            {restaurant.tagline}
          </p>
          <div className="flex flex-wrap gap-2 text-[0.72rem] font-medium text-[#85584d] md:justify-center">
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
              {restaurant.location}
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
              {restaurant.kitchenHours}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function getCustomerRestaurantImageSrc(restaurant: RestaurantInfo) {
  const rawImageUrl = restaurant.restaurantImageUrl?.trim();

  if (!rawImageUrl) {
    return PLACEHOLDER_FOOD_IMAGE;
  }

  const imageUrl = getImageUrl(rawImageUrl);

  if (imageUrl === PLACEHOLDER_FOOD_IMAGE) {
    return PLACEHOLDER_FOOD_IMAGE;
  }

  if (!isBackendUploadImageSrc(imageUrl)) {
    return imageUrl;
  }

  const version =
    restaurant.restaurantImageUpdatedAt?.trim() ||
    restaurant.updatedAt?.trim() ||
    rawImageUrl;
  const separator = imageUrl.includes("?") ? "&" : "?";

  return `${imageUrl}${separator}v=${encodeURIComponent(version)}`;
}
