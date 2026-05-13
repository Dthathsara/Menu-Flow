import { cn, getManagerPageSubtitleClasses, getManagerSectionTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { SettingsSwitch } from "./SettingsSwitch";
import type { PaymentBillingSettings } from "./settings.types";
import {
  getSettingsMutedTextClasses,
  getSettingsPanelClasses,
  getSettingsPillClasses,
  getSettingsSurfaceClasses,
} from "./settings.helpers";

interface PaymentBillingCardProps {
  settings: ManagerSettings;
  value: PaymentBillingSettings;
  onChange: (value: PaymentBillingSettings) => void;
}

function PaymentRow({
  settings,
  title,
  description,
  checked,
  onChange,
}: {
  settings: ManagerSettings;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-4", getSettingsPanelClasses(settings.scheme))}>
      <div className="min-w-0">
        <h3 className={getManagerSectionTitleClasses()}>{title}</h3>
        <p className={cn("mt-2", getSettingsMutedTextClasses(settings.scheme))}>{description}</p>
      </div>
      <div className="pt-1">
        <SettingsSwitch checked={checked} onChange={onChange} label={title} />
      </div>
    </div>
  );
}

export function PaymentBillingCard({
  settings,
  value,
  onChange,
}: PaymentBillingCardProps) {
  return (
    <section className={cn("p-5 sm:p-6", getSettingsSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={getManagerSectionTitleClasses()}>Payment & Billing</h2>
          <p className={cn("mt-2 text-[15px] leading-6", getManagerPageSubtitleClasses(settings.scheme))}>
            Choose how customers pay and how receipts are handled.
          </p>
        </div>
        <span className={getSettingsPillClasses(settings.scheme)}>CHECKOUT</span>
      </div>

      <div className="mt-6 space-y-4">
        <PaymentRow
          settings={settings}
          title="Cash Payments"
          description="Allow customers to pay at counter or through waiter collection."
          checked={value.cashPayments}
          onChange={(cashPayments) => onChange({ ...value, cashPayments })}
        />
        <PaymentRow
          settings={settings}
          title="Card Payments"
          description="Enable POS/card payment tracking in billing."
          checked={value.cardPayments}
          onChange={(cardPayments) => onChange({ ...value, cardPayments })}
        />
        <PaymentRow
          settings={settings}
          title="Online Payments"
          description="Prepare the system for payment gateway integration."
          checked={value.onlinePayments}
          onChange={(onlinePayments) => onChange({ ...value, onlinePayments })}
        />
        <PaymentRow
          settings={settings}
          title="Auto Generate Receipt"
          description="Create receipts automatically after the bill is marked as paid."
          checked={value.autoGenerateReceipt}
          onChange={(autoGenerateReceipt) => onChange({ ...value, autoGenerateReceipt })}
        />
      </div>
    </section>
  );
}
