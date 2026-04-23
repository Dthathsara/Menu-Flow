export const STAFF_ROLES = ["Chef", "Waiter", "Counter"] as const;
export const STAFF_STATUSES = ["Active", "Inactive", "On Leave"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];
export type StaffStatus = (typeof STAFF_STATUSES)[number];

export type StaffRoleFilter = "All Roles" | StaffRole;
export type StaffStatusFilter = "All Statuses" | StaffStatus;

export interface StaffRecord {
  id: string;
  fullName: string;
  address: string;
  role: StaffRole;
  email: string;
  phone: string;
  nicNumber: string;
  status: StaffStatus;
  lastActive: string;
}

export interface StaffFormValues {
  fullName: string;
  role: StaffRole;
  email: string;
  phone: string;
  nicNumber: string;
  address: string;
}

export interface StaffFilters {
  query: string;
  role: StaffRoleFilter;
  status: StaffStatusFilter;
}

export interface StaffSummaryCard {
  title: string;
  value: number;
  note: string;
}
