import { API_BASE_URL } from "@/lib/api-config";

export const DEFAULT_IMAGE_PLACEHOLDER_SRC = "/customer/placeholder-food.svg";

const ALLOWED_IMAGE_PROTOCOLS = new Set(["http:", "https:", "blob:", "data:"]);
const BACKEND_UPLOADS_PREFIX = "/uploads/";

export function getBackendOrigin() {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/backend\/?$/, "");
}

export function getSafeImageSrc(value: unknown, fallback = DEFAULT_IMAGE_PLACEHOLDER_SRC) {
  return typeof value === "string" ? getRestaurantImageUrl(value, fallback) : fallback;
}

export function getRestaurantImageUrl(
  value?: string | null,
  fallback = DEFAULT_IMAGE_PLACEHOLDER_SRC,
) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return fallback;
  }

  if (normalizedValue.startsWith("blob:")) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith("http://") || normalizedValue.startsWith("https://")) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith(BACKEND_UPLOADS_PREFIX)) {
    return `${getBackendOrigin()}${normalizedValue}`;
  }

  if (normalizedValue.startsWith("/")) {
    return normalizedValue;
  }

  return `${getBackendOrigin()}/${normalizedValue}`;
}

export function getImageUrl(url?: string | null, fallback = DEFAULT_IMAGE_PLACEHOLDER_SRC) {
  const imageUrl = getRestaurantImageUrl(url, fallback);

  try {
    const parsedUrl = new URL(imageUrl);
    return ALLOWED_IMAGE_PROTOCOLS.has(parsedUrl.protocol) ? imageUrl : fallback;
  } catch {
    return imageUrl.startsWith("/") ? imageUrl : fallback;
  }
}

export function getSafeImageSrcFromCandidates(
  values: unknown[],
  fallback = DEFAULT_IMAGE_PLACEHOLDER_SRC,
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
  return value.startsWith(`${getBackendOrigin()}${BACKEND_UPLOADS_PREFIX}`);
}
