export const ALL_CATEGORIES_LABEL = "All Categories";
export const ALL_AVAILABILITY_LABEL = "All Availability";

export type MenuFilterCategory = string;
export type MenuAvailabilityFilter =
  | typeof ALL_AVAILABILITY_LABEL
  | "Available"
  | "Unavailable";

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuItemRecord {
  id: string;
  tenantId: string;
  name: string;
  categoryName: string;
  subCategoryName?: string | null;
  description: string;
  imageUrl: string;
  image: string;
  smallPrice: number;
  mediumPrice: number;
  largePrice: number;
  available: boolean;
  active: boolean;
  sortOrder: number;
  prepTime: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MenuItemFormValues {
  name: string;
  categoryName: string;
  subCategoryName: string;
  description: string;
  smallPrice: string;
  mediumPrice: string;
  largePrice: string;
  image: string;
  imageFile: File | null;
  available: boolean;
  prepTime: string;
  sku: string;
}
