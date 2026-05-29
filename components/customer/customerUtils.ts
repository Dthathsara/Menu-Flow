export const CUSTOMER_PLACEHOLDER_IMAGE = "/customer/placeholder-food.svg";

export function formatPrice(value?: number | string | null) {
  const numeric = Number(value ?? 0);

  return `Rs. ${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getImageSrc(image?: string | null) {
  if (!image || image.trim() === "") {
    return CUSTOMER_PLACEHOLDER_IMAGE;
  }

  return image;
}

export function getSectionKey(categoryId: string, subcategoryId: string) {
  return `${categoryId}:${subcategoryId}`;
}
