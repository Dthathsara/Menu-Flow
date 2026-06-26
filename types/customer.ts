export type ServingSize = "Small" | "Medium" | "Large";

export type TabId = "menu" | "orders" | "contact";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  servingPrices: Record<ServingSize, number>;
  prepTime: number;
  categoryName?: string;
  subCategoryName?: string;
  available?: boolean;
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
  id?: string | null;
  name: string;
  hotelName?: string;
  businessType?: string;
  location?: string;
  address?: string;
  email?: string;
  businessEmail?: string;
  restaurantImageUrl: string;
  phone?: string;
  kitchenOpenTime?: string;
  kitchenCloseTime?: string;
  openingHours?: string;
  taxRate?: number;
  serviceChargeRate?: number;
  discountRate?: number;
  status?: string;
  titlePrefix: string;
  titleAccent: string;
  tagline: string;
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
  categoryName?: string;
  subCategoryName?: string;
  crust?: string;
  serving: ServingSize;
  quantity: number;
  unitPrice: number;
  prepTime?: number;
  image: string;
}

export interface CustomerOrderHistoryItem {
  id: string;
  menu_item_id: string;
  food_name: string;
  category_name: string;
  sub_category_name: string;
  serving_size: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  prep_time_min: number;
  image_url: string;
  item_note: string;
}

export interface CustomerOrderHistory {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  order_status: string;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  service_charge_amount: number;
  discount_amount: number;
  total_amount: number;
  placed_at: string;
  items: CustomerOrderHistoryItem[];
}
