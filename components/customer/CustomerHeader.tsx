import type { RestaurantInfo } from "@/types/customer";
import { getRestaurantImageUrl } from "@/lib/image-url";

interface CustomerHeaderProps {
  restaurant: RestaurantInfo;
}

export function CustomerHeader({ restaurant }: CustomerHeaderProps) {
  const imageSrc = getRestaurantImageUrl(restaurant.restaurantImageUrl);

  return (
    <section className="w-full rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] px-4 py-4 shadow-[0_18px_48px_rgba(108,79,55,0.08)] sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full rounded-[1.5rem] bg-[linear-gradient(160deg,#fffdf8_0%,#f6eee3_60%,#efe4d7_100%)] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-5 sm:py-6 md:px-8 md:py-8 lg:px-10">
        <div className="relative mb-5 h-44 overflow-hidden rounded-[1.25rem] border border-[#eadfce] bg-[#f2eadf] sm:h-52 md:h-60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#2a1c12]/30 via-transparent to-transparent" />
        </div>

        <div className="space-y-4 md:flex md:flex-col md:items-center md:justify-center md:space-y-5 md:text-center">
          <div className="inline-flex rounded-full bg-[#f2eadf] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#2c8b47]">
            TODAY&apos;S SIGNATURE MENU
          </div>
          <div className="flex items-end gap-1 leading-none md:justify-center">
            <span className="text-[2.35rem] font-black tracking-[-0.05em] text-[#19724d] sm:text-[3rem] md:text-[3.3rem]">
              {restaurant.name}
            </span>
            {restaurant.businessType ? (
              <span className="pb-1 font-serif text-[2.1rem] italic text-[#c7463d] sm:text-[2.7rem] md:text-[3rem]">
                {restaurant.businessType}
              </span>
            ) : null}
          </div>
          <p className="text-xs uppercase tracking-[0.26em] text-[#927663] md:text-sm">
            {restaurant.tagline || "CUSTOMER MENU"}
          </p>
          <div className="flex flex-wrap gap-2 text-[0.72rem] font-medium text-[#85584d] md:justify-center">
            {restaurant.location ? (
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
                {restaurant.location}
              </span>
            ) : null}
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
              {restaurant.status || restaurant.openingHours || "Kitchen open"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
