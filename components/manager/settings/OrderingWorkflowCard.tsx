import { cn, getManagerPageSubtitleClasses, getManagerSectionTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { SettingsSwitch } from "./SettingsSwitch";
import type { OrderingWorkflowSettings } from "./settings.types";
import {
  getSettingsMutedTextClasses,
  getSettingsPanelClasses,
  getSettingsPillClasses,
  getSettingsSurfaceClasses,
} from "./settings.helpers";

interface OrderingWorkflowCardProps {
  settings: ManagerSettings;
  value: OrderingWorkflowSettings;
  onChange: (value: OrderingWorkflowSettings) => void;
}

interface WorkflowRowProps {
  settings: ManagerSettings;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function WorkflowRow({
  settings,
  title,
  description,
  checked,
  onChange,
}: WorkflowRowProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-4 sm:p-5", getSettingsPanelClasses(settings.scheme))}>
      <div className="min-w-0">
        <h3 className={getManagerSectionTitleClasses()}>{title}</h3>
        <p className={cn("mt-2 max-w-[42rem]", getSettingsMutedTextClasses(settings.scheme))}>
          {description}
        </p>
      </div>
      <div className="pt-1">
        <SettingsSwitch checked={checked} onChange={onChange} label={title} />
      </div>
    </div>
  );
}

export function OrderingWorkflowCard({
  settings,
  value,
  onChange,
}: OrderingWorkflowCardProps) {
  return (
    <section className={cn("p-5 sm:p-6", getSettingsSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={getManagerSectionTitleClasses()}>Ordering Workflow</h2>
          <p className={cn("mt-2 text-[15px] leading-6", getManagerPageSubtitleClasses(settings.scheme))}>
            Control how QR orders are accepted, confirmed, and served.
          </p>
        </div>
        <span className={getSettingsPillClasses(settings.scheme)}>ORDER MODE</span>
      </div>

      <div className="mt-6 space-y-4">
        <WorkflowRow
          settings={settings}
          title="Waiter Confirmation Mode"
          description="When enabled, customers can submit item requests, but the order is not sent to kitchen until a waiter confirms it. Useful for hotels, fine dining, bars, and restaurants with table service."
          checked={value.waiterConfirmationMode}
          onChange={(checked) =>
            onChange({
              ...value,
              waiterConfirmationMode: checked,
              directCustomerOrdering: !checked,
            })
          }
        />
        <WorkflowRow
          settings={settings}
          title="Direct Customer Ordering"
          description="When enabled, customers can scan QR and place orders directly without waiter approval. Useful for cafés, food courts, fast food, and self-service restaurants."
          checked={value.directCustomerOrdering}
          onChange={(checked) =>
            onChange({
              ...value,
              directCustomerOrdering: checked,
              waiterConfirmationMode: !checked,
            })
          }
        />
        <WorkflowRow
          settings={settings}
          title="Allow Customer Order Notes"
          description='Customers can add notes like "less spicy", "no onions", or allergy instructions before placing orders.'
          checked={value.allowCustomerOrderNotes}
          onChange={(checked) => onChange({ ...value, allowCustomerOrderNotes: checked })}
        />
        <WorkflowRow
          settings={settings}
          title="Call Waiter Button"
          description="Adds a customer-side button so customers can request waiter support from their table."
          checked={value.callWaiterButton}
          onChange={(checked) => onChange({ ...value, callWaiterButton: checked })}
        />
        <WorkflowRow
          settings={settings}
          title="Kitchen Auto Print"
          description="Automatically print or prepare kitchen tickets when orders are confirmed."
          checked={value.kitchenAutoPrint}
          onChange={(checked) => onChange({ ...value, kitchenAutoPrint: checked })}
        />
      </div>
    </section>
  );
}
