import type { SummaryCardAccent } from "@/components/common/SummaryCard";

export const STAFF_ROLES = ["Chef", "Waiter", "Counter"] as const;
export const STAFF_STATUSES = ["Active", "Inactive", "On Leave"] as const;

export type StaffRole = string;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

export type StaffRoleFilter = "All Roles" | StaffRole;
export type StaffStatusFilter = "All Statuses" | StaffStatus;

export interface StaffRecord {
  id: string;
  userId?: string;
  tenantId?: string;
  fullName: string;
  address: string;
  role: StaffRole;
  operationalAccess?: string | null;
  email: string;
  phone: string;
  nicNumber: string;
  status: StaffStatus;
  lastActive: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffFormValues {
  fullName: string;
  role: StaffRole;
  operationalAccess: string;
  email: string;
  phone: string;
  nicNumber: string;
  address: string;
  status: StaffStatus;
  password?: string;
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
  accent: SummaryCardAccent;
}

export interface StaffSummaryCounts {
  totalUsers: number;
  kitchenStaff: number;
  serviceStaff: number;
  activeToday: number;
}
