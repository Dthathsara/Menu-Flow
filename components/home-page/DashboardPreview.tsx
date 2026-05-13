import { StatCard } from "@/components/common/cards";

const stats = [
  {
    title: "Today Orders",
    value: "248",
    caption: "+14.2%",
    accentClassName: "text-emerald-500",
  },
  {
    title: "Menu Views",
    value: "3.8K",
    caption: "Active scans",
    accentClassName: "text-cyan-500",
  },
  {
    title: "Satisfaction",
    value: "98%",
    caption: "Excellent",
    accentClassName: "text-orange-500",
  },
];

const dishes = [
  {
    name: "Truffle Pasta",
    description: "Chef special · Rich & creamy",
    price: "$18",
  },
  {
    name: "Citrus Salmon",
    description: "Fresh grill · Bestseller",
    price: "$24",
  },
];

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[40rem] lg:mx-0">
      <div className="absolute inset-8 -z-10 rounded-[2.75rem] blur-3xl animate-[pulseGlow_12s_ease-in-out_infinite] [background-image:var(--dashboard-halo)]" />

      <div className="rounded-[2rem] border [background-image:var(--preview-shell)] p-3 shadow-[var(--panel-shadow)] [border-color:var(--border-soft)] sm:p-5">
        <div className="rounded-[1.9rem] border [background-image:var(--preview-main)] p-5 [border-color:var(--border-soft)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Live dashboard</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
                MenuFlow Bistro
              </h3>
            </div>

            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium [border-color:var(--border-soft)] bg-[var(--live-chip-bg)] text-[var(--live-chip-text)]">
              Live
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="mt-6 rounded-[1.75rem] border bg-[var(--preview-section)] p-5 shadow-[var(--card-shadow)] [border-color:var(--border-soft)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg text-[var(--text-secondary)]">
                  Customer Mobile Menu
                </p>
                <h4 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  Featured Dishes
                </h4>
              </div>

              <span className="inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-medium [border-color:var(--border-soft)] bg-[var(--mock-chip-bg)] text-[var(--mock-chip-text)]">
                QR Ready
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {dishes.map((dish) => (
                <div
                  key={dish.name}
                  className="flex items-center justify-between gap-4 rounded-[1.4rem] border bg-[var(--surface-soft)] px-4 py-4 shadow-[var(--card-shadow)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--panel-strong)] hover:[border-color:var(--dish-hover-border)] [border-color:var(--border-soft)] sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-xl font-semibold text-[var(--text-primary)]">
                      {dish.name}
                    </p>
                    <p className="mt-1 text-base text-[var(--text-secondary)]">
                      {dish.description}
                    </p>
                  </div>
                  <p className="text-right text-2xl font-semibold text-[var(--text-primary)]">
                    {dish.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-10 top-[57%] hidden rounded-full border bg-[var(--mock-chip-bg)] px-4 py-2 text-sm font-medium text-[var(--mock-chip-text)] shadow-[var(--card-shadow)] [border-color:var(--border-soft)] md:inline-flex">
        QR Ready
      </div>
    </div>
  );
}
