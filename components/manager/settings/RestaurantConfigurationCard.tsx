import { ClockIcon } from "../icons";
import { cn, getManagerPageSubtitleClasses, getManagerSectionTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import {
  BUSINESS_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  ORDER_TIMEOUT_OPTIONS,
  SERVICE_TYPE_OPTIONS,
} from "./settings.data";
import {
  getSettingsFieldLabelClasses,
  getSettingsInputClasses,
  getSettingsPillClasses,
  getSettingsSurfaceClasses,
} from "./settings.helpers";
import { SettingsSelect } from "./SettingsSelect";
import type { RestaurantConfigurationSettings } from "./settings.types";

interface RestaurantConfigurationCardProps {
  settings: ManagerSettings;
  value: RestaurantConfigurationSettings;
  onChange: (value: RestaurantConfigurationSettings) => void;
}

function TimeInput({
  settings,
  label,
  value,
  onChange,
}: {
  settings: ManagerSettings;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={getSettingsFieldLabelClasses(settings.scheme)}>{label}</label>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(getSettingsInputClasses(settings.scheme), "pr-10")}
        />
        <ClockIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

export function RestaurantConfigurationCard({
  settings,
  value,
  onChange,
}: RestaurantConfigurationCardProps) {
  return (
    <section className={cn("p-5 sm:p-6", getSettingsSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={getManagerSectionTitleClasses()}>Restaurant Configuration</h2>
          <p className={cn("mt-2 text-[15px] leading-6", getManagerPageSubtitleClasses(settings.scheme))}>
            Settings for different restaurant and hotel operating styles.
          </p>
        </div>
        <span className={getSettingsPillClasses(settings.scheme)}>BUSINESS RULES</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={getSettingsFieldLabelClasses(settings.scheme)}>Business Type</label>
          <SettingsSelect
            label="Business Type"
            options={BUSINESS_TYPE_OPTIONS}
            value={value.businessType}
            onChange={(businessType) => onChange({ ...value, businessType })}
            settings={settings}
          />
        </div>
        <div>
          <label className={getSettingsFieldLabelClasses(settings.scheme)}>Default Service Type</label>
          <SettingsSelect
            label="Default Service Type"
            options={SERVICE_TYPE_OPTIONS}
            value={value.defaultServiceType}
            onChange={(defaultServiceType) => onChange({ ...value, defaultServiceType })}
            settings={settings}
          />
        </div>
        <div>
          <label className={getSettingsFieldLabelClasses(settings.scheme)}>Tax Rate (%)</label>
          <input
            value={value.taxRate}
            onChange={(event) => onChange({ ...value, taxRate: event.target.value })}
            className={getSettingsInputClasses(settings.scheme)}
          />
        </div>
        <div>
          <label className={getSettingsFieldLabelClasses(settings.scheme)}>Service Charge (%)</label>
          <input
            value={value.serviceCharge}
            onChange={(event) => onChange({ ...value, serviceCharge: event.target.value })}
            className={getSettingsInputClasses(settings.scheme)}
          />
        </div>
        <TimeInput
          settings={settings}
          label="Opening Time"
          value={value.openingTime}
          onChange={(openingTime) => onChange({ ...value, openingTime })}
        />
        <TimeInput
          settings={settings}
          label="Closing Time"
          value={value.closingTime}
          onChange={(closingTime) => onChange({ ...value, closingTime })}
        />
        <div>
          <label className={getSettingsFieldLabelClasses(settings.scheme)}>Currency</label>
          <SettingsSelect
            label="Currency"
            options={CURRENCY_OPTIONS}
            value={value.currency}
            onChange={(currency) => onChange({ ...value, currency })}
            settings={settings}
          />
        </div>
        <div>
          <label className={getSettingsFieldLabelClasses(settings.scheme)}>Order Timeout</label>
          <SettingsSelect
            label="Order Timeout"
            options={ORDER_TIMEOUT_OPTIONS}
            value={value.orderTimeout}
            onChange={(orderTimeout) => onChange({ ...value, orderTimeout })}
            settings={settings}
          />
        </div>
      </div>
    </section>
  );
}
