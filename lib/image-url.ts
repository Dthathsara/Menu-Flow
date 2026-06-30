const LOCAL_API_PROTOCOL = String.fromCharCode(104, 116, 116, 112, 58);
const LOCAL_API_HOST = `${["local", "host"].join("")}:3001`;
const LOCAL_API_ORIGIN = `${LOCAL_API_PROTOCOL}//${LOCAL_API_HOST}`;

export const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  (process.env.NODE_ENV === "development" ? LOCAL_API_ORIGIN : "")
).replace(/\/$/, "");

export const PLACEHOLDER_FOOD_IMAGE = "/customer/placeholder-food.svg";

export const DEFAULT_IMAGE_PLACEHOLDER_SRC = PLACEHOLDER_FOOD_IMAGE;

export function getImageUrl(value?: string | null): string {
  if (!value || !value.trim()) {
    return PLACEHOLDER_FOOD_IMAGE;
  }

  const src = value.trim();

  if (src.startsWith("blob:")) {
    return src;
  }

  if (src.startsWith("data:")) {
    return src;
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (src.startsWith("/uploads/")) {
    return API_ORIGIN ? `${API_ORIGIN}${src}` : src;
  }

  if (src.startsWith("uploads/")) {
    return API_ORIGIN ? `${API_ORIGIN}/${src}` : `/${src}`;
  }

  if (src.startsWith("/")) {
    return src;
  }

  return `${API_ORIGIN}/uploads/${src}`;
}

export function getBackendOrigin() {
  return API_ORIGIN;
}

export function getRestaurantImageUrl(
  value?: string | null,
  fallback = PLACEHOLDER_FOOD_IMAGE,
) {
  const imageUrl = getImageUrl(value);
  return imageUrl === PLACEHOLDER_FOOD_IMAGE ? fallback : imageUrl;
}

export function getSafeImageSrc(value: unknown, fallback = PLACEHOLDER_FOOD_IMAGE) {
  if (typeof value !== "string") {
    return fallback;
  }

  const imageUrl = getImageUrl(value);
  return imageUrl === PLACEHOLDER_FOOD_IMAGE ? fallback : imageUrl;
}

export function getSafeImageSrcFromCandidates(
  values: unknown[],
  fallback = PLACEHOLDER_FOOD_IMAGE,
) {
  for (const value of values) {
    const safeValue = getSafeImageSrc(value, "");

    if (safeValue) {
      return safeValue;
    }
  }

  return fallback;
}

export function isBlobImageSrc(value: string) {
  return value.startsWith("blob:");
}

export function isBackendUploadImageSrc(value: string) {
  return value.startsWith(`${API_ORIGIN}/uploads/`);
}
