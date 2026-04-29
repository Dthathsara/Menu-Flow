import {
  cn,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerControlShellClasses,
  getManagerLabelClasses,
  getManagerPanelShellClasses,
  getManagerSecondaryButtonClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { Scheme } from "../managerTypes";
import { DEFAULT_SETTINGS_STATE } from "./settings.data";
import type {
  SettingsState,
  SettingsThemePreference,
  WorkflowPreviewCard,
} from "./settings.types";

export function cloneSettingsState(state: SettingsState): SettingsState {
  return {
    orderingWorkflow: { ...state.orderingWorkflow },
    restaurantConfiguration: { ...state.restaurantConfiguration },
    paymentBilling: { ...state.paymentBilling },
    customerExperience: { ...state.customerExperience },
    appearance: { ...state.appearance },
  };
}

export function getDefaultSettingsState(): SettingsState {
  return cloneSettingsState(DEFAULT_SETTINGS_STATE);
}

export function getSettingsSurfaceClasses(scheme: Scheme) {
  return cn(
    "relative overflow-hidden",
    getManagerCardShellClasses(scheme, { interactive: true }),
  );
}

export function getSettingsPanelClasses(scheme: Scheme) {
  return cn(
    "rounded-[20px] border transition-all duration-200 ease-out hover:-translate-y-0.5",
    getManagerPanelShellClasses(scheme),
    scheme === "dark"
      ? "hover:border-blue-400/40 hover:bg-white/[0.03]"
      : "hover:border-blue-300/70 hover:bg-white",
  );
}

export function getSettingsPillClasses(scheme: Scheme) {
  return getManagerAccentPillClasses(scheme, "brand");
}

export function getSettingsFieldLabelClasses(scheme: Scheme) {
  return cn("mb-2 block text-[13px] font-semibold", getManagerLabelClasses(scheme));
}

export function getSettingsMutedTextClasses(scheme: Scheme) {
  return cn("text-[14px] leading-6", getMutedTextClasses(scheme));
}

export function getSettingsStrongTextClasses(scheme: Scheme) {
  return getManagerStrongTextClasses(scheme);
}

export function getSettingsInputClasses(scheme: Scheme) {
  return cn(getManagerControlShellClasses(scheme), "h-10 rounded-[14px] px-4");
}

export function getSettingsGhostButtonClasses(scheme: Scheme) {
  return cn(getManagerSecondaryButtonClasses(scheme), "h-10 rounded-[14px] px-4 text-[14px]");
}

export function getWorkflowPreviewCards(state: SettingsState): WorkflowPreviewCard[] {
  const leadCard: WorkflowPreviewCard = state.orderingWorkflow.waiterConfirmationMode
    ? {
        title: "Waiter Assisted",
        description:
          "Customers request items. Waiters confirm orders before kitchen preparation.",
      }
    : {
        title: "Direct Ordering",
        description:
          "Customers scan QR and send orders directly to kitchen without waiter confirmation.",
      };

  return [
    leadCard,
    {
      title: "QR Menu",
      description: "Customers browse menu items from table QR codes.",
    },
    {
      title: "Receipt Flow",
      description: "Bills are generated after orders are served or completed.",
    },
  ];
}

export function getThemePillLabel(
  activeTheme: SettingsThemePreference,
  option: SettingsThemePreference,
) {
  return activeTheme === option ? "ACTIVE" : "SELECT";
}
