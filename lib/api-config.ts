const API_VERSION_PATH = "/api/v1";

function normalizeApiBaseUrl(value: string) {
  const withoutTrailingSlash = value.replace(/\/+$/, "");

  if (withoutTrailingSlash.endsWith(API_VERSION_PATH)) {
    return withoutTrailingSlash;
  }

  if (withoutTrailingSlash.endsWith("/api")) {
    return `${withoutTrailingSlash}/v1`;
  }

  return `${withoutTrailingSlash}${API_VERSION_PATH}`;
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1",
);

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
  },
  systemAdmin: {
    me: "/system-admin/me",
    profile: "/system-admin/me",
    changePassword: "/system-admin/me/password",
    clients: "/system-admin/clients",
    client: (clientId: string) => `/system-admin/clients/${encodeURIComponent(clientId)}`,
    users: "/system-admin/users",
    user: (userId: string) => `/system-admin/users/${encodeURIComponent(userId)}`,
    roles: "/system-admin/users/roles",
  },
  chef: {
    dashboardSummary: "/chef/dashboard/summary",
    orders: "/chef/orders",
    myOrders: "/chef/my-orders",
    availableTables: "/chef/tables/available",
    profile: "/chef/profile",
    changePassword: "/chef/change-password",
    orderStatus: (orderId: string) => `/chef/orders/${encodeURIComponent(orderId)}/status`,
  },
  managerDashboard: {
    overview: "/dashboard/manager",
  },
  waiter: {
    orders: "/waiter/orders",
    myOrders: "/waiter/my-orders",
    tables: "/waiter/tables",
    notifications: "/waiter/notifications",
    orderStatus: (orderId: string) => `/waiter/orders/${encodeURIComponent(orderId)}/status`,
  },
} as const;

export function apiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pathWithoutDuplicateVersion = normalizedPath.startsWith(API_VERSION_PATH)
    ? normalizedPath.slice(API_VERSION_PATH.length) || "/"
    : normalizedPath;

  return `${API_BASE_URL}${pathWithoutDuplicateVersion}`;
}
