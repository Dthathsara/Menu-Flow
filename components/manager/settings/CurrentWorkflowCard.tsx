import { cn, getManagerPageSubtitleClasses, getManagerSectionTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { SettingsState } from "./settings.types";
import {
  getSettingsMutedTextClasses,
  getSettingsPanelClasses,
  getSettingsPillClasses,
  getSettingsSurfaceClasses,
  getWorkflowPreviewCards,
} from "./settings.helpers";

interface CurrentWorkflowCardProps {
  settings: ManagerSettings;
  state: SettingsState;
}

export function CurrentWorkflowCard({ settings, state }: CurrentWorkflowCardProps) {
  const cards = getWorkflowPreviewCards(state);

  return (
    <section className={cn("p-5 sm:p-6", getSettingsSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={getManagerSectionTitleClasses()}>Current Workflow</h2>
          <p className={cn("mt-2 text-[15px] leading-6", getManagerPageSubtitleClasses(settings.scheme))}>
            Preview how customers and waiters will interact.
          </p>
        </div>
        <span className={getSettingsPillClasses(settings.scheme)}>LIVE MODE</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className={cn("p-5", getSettingsPanelClasses(settings.scheme))}>
            <h3 className={getManagerSectionTitleClasses()}>{card.title}</h3>
            <p className={cn("mt-3", getSettingsMutedTextClasses(settings.scheme))}>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
