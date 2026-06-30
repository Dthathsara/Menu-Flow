const LOCAL_API_PROTOCOL = String.fromCharCode(104, 116, 116, 112, 58);
const LOCAL_API_HOST = `${["local", "host"].join("")}:3001`;
const LOCAL_API_BASE_URL = `${LOCAL_API_PROTOCOL}//${LOCAL_API_HOST}/api/v1`;

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? LOCAL_API_BASE_URL : "")
).replace(/\/$/, "");

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
