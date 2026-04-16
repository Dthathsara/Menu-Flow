export type ServingSize = "Small" | "Medium" | "Large";

export type TabId = "menu" | "orders" | "contact";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  servingPrices: Record<ServingSize, number>;
  spiceLevel?: "Mild" | "Medium" | "Hot";
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  defaultExpanded: boolean;
  items: MenuItem[];
}

export interface MenuCategory {
  id: string;
  name: string;
  accentLabel: string;
  description: string;
  subcategories: Subcategory[];
}

export interface SocialLink {
  label: string;
  value: string;
  href: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  reservations: string;
  socials: SocialLink[];
}

export interface RestaurantInfo {
  name: string;
  titlePrefix: string;
  titleAccent: string;
  tagline: string;
  location: string;
  heroSummary: string;
  heroNote: string;
  bannerLabel: string;
  kitchenHours: string;
}

export interface CustomerMenuData {
  restaurant: RestaurantInfo;
  contact: ContactInfo;
  categories: MenuCategory[];
}

export interface CartItem {
  key: string;
  itemId: string;
  name: string;
  crust?: string;
  serving: ServingSize;
  quantity: number;
  unitPrice: number;
  image: string;
}
