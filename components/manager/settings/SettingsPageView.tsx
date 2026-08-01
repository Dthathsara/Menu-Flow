"use client";

import { useState } from "react";
import { getManagerPageSectionClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { AppearanceCard } from "./AppearanceCard";
import { CurrentWorkflowCard } from "./CurrentWorkflowCard";
import { CustomerExperienceCard } from "./CustomerExperienceCard";
import { EditRestaurantProfileModal } from "./EditRestaurantProfileModal";
import { OrderingWorkflowCard } from "./OrderingWorkflowCard";
import { PaymentBillingCard } from "./PaymentBillingCard";
import { RestaurantConfigurationCard } from "./RestaurantConfigurationCard";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsToast } from "./SettingsToast";
import { getDefaultSettingsState } from "./settings.helpers";
import type {
  RestaurantProfile,
  SettingsState,
  SettingsThemePreference,
  SettingsToastMessage,
} from "./settings.types";

interface SettingsPageViewProps {
  settings: ManagerSettings;
  restaurantProfile: RestaurantProfile;
  onUpdateRestaurantProfile: (profile: RestaurantProfile) => void;
}

export function SettingsPageView({
  settings,
  restaurantProfile,
  onUpdateRestaurantProfile,
}: SettingsPageViewProps) {
  const [state, setState] = useState<SettingsState>(getDefaultSettingsState);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toasts, setToasts] = useState<SettingsToastMessage[]>([]);

  function pushToast(title: string) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `settings-toast-${Date.now()}`;

    setToasts((current) => [...current, { id, title }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }

  function handleReset() {
    setState(getDefaultSettingsState());
    pushToast("Settings reset to recommended restaurant mode");
  }

  function handleSave() {
    pushToast("Settings saved successfully");
  }

  function handleThemeChange(themePreference: SettingsThemePreference) {
    setState((current) => ({
      ...current,
      appearance: {
        themePreference,
      },
    }));
    pushToast("Theme preference updated");
  }

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <div className="space-y-6">
          <SettingsHeader
            settings={settings}
            profile={restaurantProfile}
            onReset={handleReset}
            onSave={handleSave}
            onEditProfile={() => setProfileModalOpen(true)}
          />

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <OrderingWorkflowCard
              settings={settings}
              value={state.orderingWorkflow}
              onChange={(orderingWorkflow) => setState((current) => ({ ...current, orderingWorkflow }))}
            />
            <CurrentWorkflowCard settings={settings} state={state} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <RestaurantConfigurationCard
              settings={settings}
              value={state.restaurantConfiguration}
              onChange={(restaurantConfiguration) =>
                setState((current) => ({ ...current, restaurantConfiguration }))
              }
            />
            <PaymentBillingCard
              settings={settings}
              value={state.paymentBilling}
              onChange={(paymentBilling) => setState((current) => ({ ...current, paymentBilling }))}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <CustomerExperienceCard
              settings={settings}
              value={state.customerExperience}
              onChange={(customerExperience) =>
                setState((current) => ({ ...current, customerExperience }))
              }
            />
            <AppearanceCard
              settings={settings}
              value={state.appearance.themePreference}
              onChange={handleThemeChange}
            />
          </section>
        </div>
      </section>

      <EditRestaurantProfileModal
        open={profileModalOpen}
        settings={settings}
        profile={restaurantProfile}
        onClose={() => setProfileModalOpen(false)}
        onSave={(profile) => {
          onUpdateRestaurantProfile(profile);
          pushToast("Restaurant profile updated successfully.");
        }}
      />

      <div className="pointer-events-none fixed bottom-4 right-4 z-[120] space-y-2">
        {toasts.map((toast) => (
          <SettingsToast key={toast.id} settings={settings} title={toast.title} />
        ))}
      </div>
    </>
  );
}
