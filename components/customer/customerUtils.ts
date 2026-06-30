<<<<<<< HEAD
export function formatPrice(amount: number) {
  return `Rs. ${amount.toFixed(2)}`;
=======
import { getImageUrl, PLACEHOLDER_FOOD_IMAGE } from "@/lib/image-url";

export const CUSTOMER_PLACEHOLDER_IMAGE = PLACEHOLDER_FOOD_IMAGE;

export function formatPrice(value?: number | string | null) {
  const numeric = Number(value ?? 0);

  return `Rs. ${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getImageSrc(image?: string | null) {
  return getImageUrl(image);
>>>>>>> Dulnith
}

export function getSectionKey(categoryId: string, subcategoryId: string) {
  return `${categoryId}:${subcategoryId}`;
}
