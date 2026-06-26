import type { MenuItem, ServingSize } from "@/types/customer";
import { MenuItemCard } from "@/components/customer/MenuItemCard";

interface SubcategorySectionProps {
  name: string;
  description: string;
  expanded: boolean;
  items: MenuItem[];
  onToggle: () => void;
  onSelectItem: (itemId: string) => void;
  onQuickAdd: (item: MenuItem, serving: ServingSize) => void;
}

export function SubcategorySection({
  name,
  description,
  expanded,
  items,
  onToggle,
  onSelectItem,
  onQuickAdd,
}: SubcategorySectionProps) {
  return (
    <section className="w-full max-w-none rounded-[1.8rem] border border-[#e3d8ca] bg-[#f8f3ec] p-3 md:p-4 lg:p-5">
      <div className="md:flex md:items-start md:justify-between md:gap-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between rounded-[1.2rem] bg-[#dfe4de] px-4 py-3 text-left transition hover:bg-[#d7ddd5] md:bg-transparent md:px-0 md:py-0 md:hover:bg-transparent"
        >
          <div>
            <div className="text-[0.78rem] font-black uppercase tracking-[0.24em] text-[#3c9136] md:text-[0.9rem]">
              {name}
            </div>
            <div className="mt-1 text-sm text-[#8c7164] md:max-w-3xl">
              {description}
            </div>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-semibold text-[#7a3128] md:h-10 md:w-10 md:border md:border-[#ddd0bf] md:bg-[#fffaf4]">
            {expanded ? "−" : "+"}
          </span>
        </button>
      </div>

      {expanded ? (
        <div className="mt-3 grid w-full max-w-none grid-cols-1 gap-4 sm:grid-cols-2 md:mt-5 lg:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] lg:gap-5">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onSelect={() => onSelectItem(item.id)}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
