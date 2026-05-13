export type SettingsBusinessType =
  | "Restaurant"
  | "Café"
  | "Hotel Restaurant"
  | "Food Court Stall"
  | "Cloud Kitchen"
  | "Bar / Lounge";

export type SettingsServiceType =
  | "Dine-in"
  | "Takeaway"
  | "Room Service"
  | "Self Service";

export type SettingsCurrency =
  | "LKR - Sri Lankan Rupee"
  | "USD - US Dollar"
  | "INR - Indian Rupee";

export type SettingsOrderTimeout =
  | "10 minutes"
  | "15 minutes"
  | "20 minutes"
  | "30 minutes";

export type SettingsThemePreference = "dark-premium" | "light-clean" | "auto";

export interface RestaurantProfile {
  name: string;
  location: string;
  imageSrc: string;
}

export interface OrderingWorkflowSettings {
  waiterConfirmationMode: boolean;
  directCustomerOrdering: boolean;
  allowCustomerOrderNotes: boolean;
  callWaiterButton: boolean;
  kitchenAutoPrint: boolean;
}

export interface RestaurantConfigurationSettings {
  businessType: SettingsBusinessType;
  defaultServiceType: SettingsServiceType;
  taxRate: string;
  serviceCharge: string;
  openingTime: string;
  closingTime: string;
  currency: SettingsCurrency;
  orderTimeout: SettingsOrderTimeout;
}

export interface PaymentBillingSettings {
  cashPayments: boolean;
  cardPayments: boolean;
  onlinePayments: boolean;
  autoGenerateReceipt: boolean;
}

export interface CustomerExperienceSettings {
  showFeaturedItems: boolean;
  showPreparationTime: boolean;
  allowOrderTracking: boolean;
}

export interface AppearanceSettings {
  themePreference: SettingsThemePreference;
}

export interface SettingsState {
  orderingWorkflow: OrderingWorkflowSettings;
  restaurantConfiguration: RestaurantConfigurationSettings;
  paymentBilling: PaymentBillingSettings;
  customerExperience: CustomerExperienceSettings;
  appearance: AppearanceSettings;
}

export interface SettingsSelectOption<T extends string> {
  label: string;
  value: T;
}

export interface SettingsToastMessage {
  id: string;
  title: string;
}

export interface WorkflowPreviewCard {
  title: string;
  description: string;
}

export interface ThemeOption {
  key: SettingsThemePreference;
  title: string;
  description: string;
}
