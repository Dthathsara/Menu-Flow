import type { ContactInfo, RestaurantInfo } from "@/types/customer";

interface ContactPanelProps {
  restaurant: RestaurantInfo;
  contact: ContactInfo;
}

export function ContactPanel({ restaurant, contact }: ContactPanelProps) {
  const openingHours =
    restaurant.openingHours ||
    (restaurant.openingTime || restaurant.closingTime
      ? `Daily ${restaurant.openingTime || ""} - ${restaurant.closingTime || ""}`.trim()
      : "");
  const phone = restaurant.phone || "Not provided";
  const email = restaurant.businessEmail?.trim() || "Not provided";
  const address = restaurant.address || "Not provided";

  return (
    <section className="rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] p-4 shadow-[0_18px_48px_rgba(108,79,55,0.08)] sm:p-6">
      <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
        Contact
      </p>
      <h2 className="mt-2 text-2xl font-black text-[#7a2a24]">
        Visit or call {restaurant.name}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#8e7364]">
        Reach the dining team for reservations, pickup timing, or private deck
        seating.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.4rem] bg-[#f6efe5] p-4">
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#a37a6a]">
            Phone
          </div>
          <div className="mt-2 text-lg font-bold text-[#7a2a24]">{phone}</div>
        </div>
        <div className="rounded-[1.4rem] bg-[#f6efe5] p-4">
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#a37a6a]">
            Email
          </div>
          <div className="mt-2 text-lg font-bold text-[#7a2a24]">{email}</div>
        </div>
        <div className="rounded-[1.4rem] bg-[#f6efe5] p-4">
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#a37a6a]">
            Address
          </div>
          <div className="mt-2 text-lg font-bold text-[#7a2a24]">{address}</div>
        </div>
        <div className="rounded-[1.4rem] bg-[#f6efe5] p-4">
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#a37a6a]">
            Opening Hours
          </div>
          <div className="mt-2 text-lg font-bold text-[#7a2a24]">
            {openingHours || "Not provided"}
          </div>
        </div>
      </div>

      {contact.reservations || contact.socials.length ? (
        <div className="mt-5 rounded-[1.4rem] bg-[#6c2a20] p-4 text-[#fff7f2]">
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#f4d6c5]">
            Reservation note
          </div>
          <div className="mt-2 text-base">
            {contact.reservations || "Not provided"}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {contact.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="rounded-full bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20"
              >
                {social.label} - {social.value}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
