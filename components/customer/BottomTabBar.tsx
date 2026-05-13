import type { TabId } from "@/types/customer";

interface BottomTabBarProps {
  activeTab: TabId;
  orderCount: number;
  onChange: (tab: TabId) => void;
}

const tabConfig: { id: TabId; label: string; icon: string }[] = [
  { id: "menu", label: "Menu", icon: "≡" },
  { id: "orders", label: "Orders", icon: "□" },
  { id: "contact", label: "Contact", icon: "◐" },
];

export function BottomTabBar({
  activeTab,
  orderCount,
  onChange,
}: BottomTabBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-3 z-30 px-3 sm:px-5">
      <div className="mx-auto max-w-[420px] rounded-[1.6rem] border border-[#16761f] bg-[#1f8b21] p-1.5 shadow-[0_18px_36px_rgba(31,104,35,0.28)] sm:max-w-3xl">
        <div className="grid grid-cols-3 gap-1">
          {tabConfig.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`relative rounded-[1.1rem] px-4 py-3 text-center transition ${
                  isActive
                    ? "bg-[#157a1b] text-white"
                    : "text-[#eef8ea] hover:bg-white/10"
                }`}
              >
                <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em]">
                  {tab.label}
                </div>
                <div className="mt-1 text-sm opacity-80">{tab.icon}</div>
                {tab.id === "orders" && orderCount > 0 ? (
                  <span className="absolute right-3 top-2 rounded-full bg-white px-1.5 py-0.5 text-[0.65rem] font-bold text-[#1f8b21]">
                    {orderCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
