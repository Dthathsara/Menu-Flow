import type {
  StaffFilters,
  StaffFormValues,
  StaffRole,
  StaffRoleFilter,
  StaffStatus,
  StaffStatusFilter,
} from "./types";

export const DEFAULT_STAFF_FILTERS: StaffFilters = {
  query: "",
  role: "All Roles",
  status: "All Statuses",
};

export const DEFAULT_STAFF_FORM_VALUES: StaffFormValues = {
  fullName: "",
  role: "",
  operationalAccess: "",
  email: "",
  phone: "",
  nicNumber: "",
  address: "",
  status: "Active",
  password: "",
};

export const STAFF_ROLE_FILTER_OPTIONS = [
  { label: "All Roles", value: "All Roles" },
  { label: "Chef", value: "Chef" },
  { label: "Waiter", value: "Waiter" },
  { label: "Counter", value: "Counter" },
] as const satisfies ReadonlyArray<{ label: string; value: StaffRoleFilter }>;

export const STAFF_STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "All Statuses" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "On Leave", value: "On Leave" },
] as const satisfies ReadonlyArray<{ label: string; value: StaffStatusFilter }>;

export const STAFF_ROLE_OPTIONS = [
  { label: "Chef", value: "Chef" },
  { label: "Waiter", value: "Waiter" },
  { label: "Counter", value: "Counter" },
] as const satisfies ReadonlyArray<{ label: string; value: StaffRole }>;

export const DEFAULT_STAFF_ROLE_SUGGESTIONS = STAFF_ROLE_OPTIONS.map(
  (option) => option.value,
);

export const STAFF_STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "On Leave", value: "On Leave" },
] as const satisfies ReadonlyArray<{ label: string; value: StaffStatus }>;
