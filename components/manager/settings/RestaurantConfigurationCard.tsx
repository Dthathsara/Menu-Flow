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

function getConfigurationInputClasses(settings: ManagerSettings) {
  return cn(
    "w-full h-[44px] rounded-xl px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/40",
    settings.scheme === "dark"
      ? "border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500"
      : "border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
  );
}

function ConfigurationField({
  settings,
  label,
  children,
}: {
  settings: ManagerSettings;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label
        className={cn(
          "text-sm",
          settings.scheme === "dark" ? "text-slate-400" : "text-slate-500",
        )}
      >
        {label}
      </label>
      {children}
    </div>
  );
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
    <ConfigurationField settings={settings} label={label}>
      <div className="relative w-full">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(getConfigurationInputClasses(settings), "pr-10")}
        />
        <ClockIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </div>
    </ConfigurationField>
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

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <ConfigurationField settings={settings} label="Business Type">
          <SettingsSelect
            label="Business Type"
            options={BUSINESS_TYPE_OPTIONS}
            value={value.businessType}
            onChange={(businessType) => onChange({ ...value, businessType })}
            settings={settings}
          />
        </ConfigurationField>
        <ConfigurationField settings={settings} label="Default Service Type">
          <SettingsSelect
            label="Default Service Type"
            options={SERVICE_TYPE_OPTIONS}
            value={value.defaultServiceType}
            onChange={(defaultServiceType) => onChange({ ...value, defaultServiceType })}
            settings={settings}
          />
        </ConfigurationField>
        <ConfigurationField settings={settings} label="Tax Rate (%)">
          <input
            value={value.taxPercentage}
            onChange={(event) => onChange({ ...value, taxPercentage: event.target.value })}
            className={getConfigurationInputClasses(settings)}
          />
        </ConfigurationField>
        <ConfigurationField settings={settings} label="Service Charge (%)">
          <input
            value={value.serviceCharge}
            onChange={(event) => onChange({ ...value, serviceCharge: event.target.value })}
            className={getConfigurationInputClasses(settings)}
          />
        </ConfigurationField>
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
        <ConfigurationField settings={settings} label="Currency">
          <SettingsSelect
            label="Currency"
            options={CURRENCY_OPTIONS}
            value={value.currency}
            onChange={(currency) => onChange({ ...value, currency })}
            settings={settings}
          />
        </ConfigurationField>
        <ConfigurationField settings={settings} label="Order Timeout">
          <SettingsSelect
            label="Order Timeout"
            options={ORDER_TIMEOUT_OPTIONS}
            value={value.orderTimeout}
            onChange={(orderTimeout) => onChange({ ...value, orderTimeout })}
            settings={settings}
          />
        </ConfigurationField>
      </div>
    </section>
  );
}
