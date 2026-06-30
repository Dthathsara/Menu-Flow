import {
  cn,
  getInteractiveCardClasses,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerPanelShellClasses,
  getManagerProgressTrackClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { PaymentMethodSummary } from "./billing.types";

interface PaymentMethodsCardProps {
  settings: ManagerSettings;
  methods: PaymentMethodSummary[];
}

export function PaymentMethodsCard({
  settings,
  methods,
}: PaymentMethodsCardProps) {
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Payment Methods</h3>
          <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
            How customers are paying after QR-based ordering.
          </p>
        </div>
        <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>METHODS</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {methods.map((method, index) => (
          <div
            key={`${method.method}-${index}`}
            className={cn(
              getManagerPanelShellClasses(settings.scheme),
              getInteractiveCardClasses(settings.scheme),
              "px-4 py-4",
            )}
          >
            <div className={cn("text-[15px] font-semibold", getManagerStrongTextClasses(settings.scheme))}>
              {method.label}
            </div>
            <p className={cn("mt-2 text-[12px] leading-5", getMutedTextClasses(settings.scheme))}>
              {method.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {methods.map((method, index) => (
          <div key={`${method.method}-${index}-progress`} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-[13px] font-semibold">
              <span className={getManagerStrongTextClasses(settings.scheme)}>{method.label}</span>
              <span className={getManagerStrongTextClasses(settings.scheme)}>{method.percent}%</span>
            </div>
            <div className={cn("h-2.5 w-full overflow-hidden", getManagerProgressTrackClasses(settings.scheme))}>
              <div
                className={cn("h-full rounded-full bg-gradient-to-r", method.accentClassName)}
                style={{ width: `${method.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
