import type {
  RestaurantProfile,
  SettingsBusinessType,
  SettingsCurrency,
  SettingsOrderTimeout,
  SettingsSelectOption,
  SettingsServiceType,
  SettingsState,
  ThemeOption,
} from "./settings.types";

export const DEFAULT_RESTAURANT_PROFILE: RestaurantProfile = {
  hotelName: "",
  businessEmail: "",
  businessType: "",
  businessLocation: "",
  businessAddress: "",
  kitchenOpenTime: "",
  kitchenCloseTime: "",
  taxRate: "5",
  serviceChargeRate: "3",
  discountRate: "",
  restaurantImageUrl: "/customer/placeholder-food.svg",
};

export const BUSINESS_TYPE_OPTIONS: readonly SettingsSelectOption<SettingsBusinessType>[] = [
  { label: "Restaurant", value: "Restaurant" },
  { label: "Café", value: "Café" },
  { label: "Hotel Restaurant", value: "Hotel Restaurant" },
  { label: "Food Court Stall", value: "Food Court Stall" },
  { label: "Cloud Kitchen", value: "Cloud Kitchen" },
  { label: "Bar / Lounge", value: "Bar / Lounge" },
];

export const SERVICE_TYPE_OPTIONS: readonly SettingsSelectOption<SettingsServiceType>[] = [
  { label: "Dine-in", value: "Dine-in" },
  { label: "Takeaway", value: "Takeaway" },
  { label: "Room Service", value: "Room Service" },
  { label: "Self Service", value: "Self Service" },
];

export const CURRENCY_OPTIONS: readonly SettingsSelectOption<SettingsCurrency>[] = [
  { label: "LKR - Sri Lankan Rupee", value: "LKR - Sri Lankan Rupee" },
  { label: "USD - US Dollar", value: "USD - US Dollar" },
  { label: "INR - Indian Rupee", value: "INR - Indian Rupee" },
];

export const ORDER_TIMEOUT_OPTIONS: readonly SettingsSelectOption<SettingsOrderTimeout>[] = [
  { label: "10 minutes", value: "10 minutes" },
  { label: "15 minutes", value: "15 minutes" },
  { label: "20 minutes", value: "20 minutes" },
  { label: "30 minutes", value: "30 minutes" },
];

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    key: "dark-premium",
    title: "Dark Premium",
    description: "Best for manager dashboard and modern SaaS look.",
  },
  {
    key: "light-clean",
    title: "Light Clean",
    description: "Bright dashboard mode for daytime operation.",
  },
  {
    key: "auto",
    title: "Auto",
    description: "Switch theme according to system preference.",
  },
];

export const DEFAULT_SETTINGS_STATE: SettingsState = {
  orderingWorkflow: {
    waiterConfirmationMode: true,
    directCustomerOrdering: false,
    allowCustomerOrderNotes: true,
    callWaiterButton: true,
    kitchenAutoPrint: false,
  },
  restaurantConfiguration: {
    businessType: "Restaurant",
    defaultServiceType: "Dine-in",
    taxRate: "5",
    serviceCharge: "10",
    openingTime: "09:00 AM",
    closingTime: "11:00 PM",
    currency: "LKR - Sri Lankan Rupee",
    orderTimeout: "10 minutes",
  },
  paymentBilling: {
    cashPayments: true,
    cardPayments: true,
    onlinePayments: false,
    autoGenerateReceipt: true,
  },
  customerExperience: {
    showFeaturedItems: true,
    showPreparationTime: true,
    allowOrderTracking: true,
  },
  appearance: {
    themePreference: "dark-premium",
  },
};
