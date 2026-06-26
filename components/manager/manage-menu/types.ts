export const MENU_CATEGORIES = [
  "Appetizers",
  "Soups",
  "Salads",
  "Seafood",
  "Chicken",
  "Beef",
  "Rice",
  "Noodles",
  "Burgers",
  "Desserts",
  "Beverages",
] as const;

export const FILTER_CATEGORIES = ["All Categories", ...MENU_CATEGORIES] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];
export type MenuFilterCategory = (typeof FILTER_CATEGORIES)[number];

export interface MenuItemPrices {
  small: number;
  medium: number;
  large: number;
}

export interface MenuItemRecord {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  prices: MenuItemPrices;
  image: string;
  available: boolean;
  prepTime: number;
  sku: string;
}

export interface MenuItemFormValues {
  name: string;
  category: MenuCategory;
  description: string;
  smallPrice: string;
  mediumPrice: string;
  largePrice: string;
  image: string;
  available: boolean;
  prepTime: string;
  sku: string;
}
