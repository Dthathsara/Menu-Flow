import Image from "next/image";
import type { CartItem } from "@/types/customer";
import { formatPrice } from "@/components/customer/customerUtils";

interface OrdersPanelProps {
  items: CartItem[];
  total: number;
  onRemove: (key: string) => void;
}

export function OrdersPanel({ items, total, onRemove }: OrdersPanelProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] p-6 text-center shadow-[0_18px_48px_rgba(108,79,55,0.08)]">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
          Orders
        </p>
        <h2 className="mt-3 text-2xl font-black text-[#7a2a24]">
          No items added yet
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#8e7364]">
          Open any menu item, choose a serving size, set a quantity, and add it
          to your order.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] p-4 shadow-[0_18px_48px_rgba(108,79,55,0.08)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
            Orders
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#7a2a24]">
            Current selections
          </h2>
        </div>
        <div className="rounded-full bg-[#f0eadf] px-4 py-2 text-sm font-semibold text-[#7a6050]">
          {items.length} item{items.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const subtotal = item.unitPrice * item.quantity;

          return (
            <article
              key={item.key}
              className="flex gap-3 rounded-[1.4rem] bg-[#f6efe5] p-3"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border border-[#eadfce] bg-white">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold leading-5 text-[#7a2a24]">
                  {item.name}
                </div>
                <div className="mt-2 text-sm text-[#8e7364]">
                  {item.serving} serving
                  {item.crust ? ` · ${item.crust}` : ""} · Qty {item.quantity}
                </div>
                <div className="mt-1 text-sm text-[#8e7364]">
                  {formatPrice(item.unitPrice)} each
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-lg font-black text-[#2b8a38]">
                    {formatPrice(subtotal)}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.key)}
                    className="rounded-full border border-[#d9b6ad] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#b03a34] transition hover:bg-[#fff1ee]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 rounded-[1.4rem] bg-[#6c2a20] px-4 py-4 text-[#fff7f2]">
        <div className="flex items-center justify-between text-sm uppercase tracking-[0.18em] text-[#f4d6c5]">
          <span>Total amount</span>
          <span>Ready to confirm</span>
        </div>
        <div className="mt-2 text-3xl font-black">{formatPrice(total)}</div>
      </div>
    </section>
  );
}
