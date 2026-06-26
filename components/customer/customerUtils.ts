export function formatPrice(amount: number) {
  return `Rs. ${amount.toFixed(2)}`;
}

export function getSectionKey(categoryId: string, subcategoryId: string) {
  return `${categoryId}:${subcategoryId}`;
}
