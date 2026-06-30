import type { MenuCategory } from "@/types/customer";

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2 rounded-[1.5rem] bg-[#f1e8dd] p-2">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={`rounded-[1.2rem] px-4 py-3 text-left transition duration-200 ${
                isActive
                  ? "bg-[#fffdf8] text-[#267b37] shadow-[0_10px_24px_rgba(67,112,62,0.12)]"
                  : "text-[#7f2e28] hover:bg-white/60"
              }`}
            >
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.22em]">
                {category.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
