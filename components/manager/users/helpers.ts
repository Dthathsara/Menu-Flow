import {
  cn,
  getManagerBadgeClasses,
  getManagerCardShellClasses,
  getManagerControlShellClasses,
  getManagerDangerButtonClasses,
  getManagerEyebrowClasses,
  getManagerPanelShellClasses,
  getManagerPrimaryButtonClasses,
  getManagerTableActionButtonClasses,
  getManagerTextInputClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { Scheme } from "../managerTypes";
import type {
  StaffFilters,
  StaffFormValues,
  StaffRecord,
  StaffRole,
  StaffStatus,
  StaffSummaryCard,
} from "./types";

const AVATAR_GRADIENTS = [
  "from-[#466CFF] via-[#5967F0] to-[#845DE7]",
  "from-[#315AE5] via-[#4C6FF8] to-[#6D57E8]",
  "from-[#1F7FDB] via-[#2A7DD4] to-[#22B4C8]",
  "from-[#3F63FF] via-[#5468F3] to-[#9A58E0]",
];

export function getInitials(fullName: string) {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getAvatarGradientClasses(seed: string) {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[total % AVATAR_GRADIENTS.length];
}

export function getOperationalAccessLabel(role: StaffRole) {
  if (role === "Chef") {
    return "Kitchen preparation and food workflow access";
  }

  if (role === "Waiter") {
    return "Floor service and order coordination access";
  }

  return "Cashier, front-desk, and order handoff access";
}

export function getRoleBadgeClasses(role: StaffRole, scheme: Scheme) {
  if (role === "Chef") {
    return getManagerBadgeClasses("amber", scheme);
  }

  if (role === "Waiter") {
    return getManagerBadgeClasses("brand", scheme);
  }

  return getManagerBadgeClasses("cyan", scheme);
}

export function getStatusBadgeClasses(status: StaffStatus, scheme: Scheme) {
  if (status === "Active") {
    return getManagerBadgeClasses("success", scheme);
  }

  if (status === "Inactive") {
    return getManagerBadgeClasses("danger", scheme);
  }

  return getManagerBadgeClasses("warning", scheme);
}

export function getUsersFieldLabelClasses(scheme: Scheme) {
  return getManagerEyebrowClasses(scheme);
}

export function getUsersMutedTextClasses(scheme: Scheme) {
  return getMutedTextClasses(scheme);
}

export function getUsersPanelClasses(scheme: Scheme) {
  return getManagerPanelShellClasses(scheme);
}

export function getUsersCardClasses(scheme: Scheme, interactive = false) {
  return getManagerCardShellClasses(scheme, { interactive });
}

export function getUsersInputClasses(scheme: Scheme, multiline = false) {
  return getManagerTextInputClasses(scheme, { multiline });
}

export function getUsersSearchShellClasses(scheme: Scheme) {
  return getManagerControlShellClasses(scheme);
}

export function getUsersActionButtonClasses(
  scheme: Scheme,
  tone: "default" | "primary" | "danger" = "default",
) {
  if (tone === "primary") {
    return cn(getManagerPrimaryButtonClasses(scheme), "h-10 rounded-[14px] px-5 text-[14px]");
  }

  if (tone === "danger") {
    return cn(getManagerDangerButtonClasses(scheme), "h-10 rounded-[14px] px-5 text-[14px]");
  }

  return cn(getManagerTableActionButtonClasses(scheme), "h-8 rounded-[11px] px-3 text-[13px]");
}

export function filterStaffRecords(records: StaffRecord[], filters: StaffFilters) {
  const query = filters.query.trim().toLowerCase();

  return records.filter((record) => {
    const matchesQuery =
      !query ||
      record.fullName.toLowerCase().includes(query) ||
      record.email.toLowerCase().includes(query) ||
      record.phone.toLowerCase().includes(query);

    const matchesRole = filters.role === "All Roles" || record.role === filters.role;
    const matchesStatus =
      filters.status === "All Statuses" || record.status === filters.status;

    return matchesQuery && matchesRole && matchesStatus;
  });
}

export function getStaffSummaryCards(records: StaffRecord[]): StaffSummaryCard[] {
  const totalUsers = records.length;
  const kitchenStaff = records.filter((record) => record.role === "Chef").length;
  const serviceStaff = records.filter((record) => record.role !== "Chef").length;
  const activeToday = records.filter((record) => record.status === "Active").length;

  return [
    {
      title: "TOTAL USERS",
      value: totalUsers,
      note: "All restaurant staff profiles currently listed for this branch.",
      accent: "blue",
    },
    {
      title: "KITCHEN STAFF",
      value: kitchenStaff,
      note: "Chefs handling kitchen preparation and service output.",
      accent: "amber",
    },
    {
      title: "SERVICE STAFF",
      value: serviceStaff,
      note: "Waiters and counter staff supporting guest service flow.",
      accent: "purple",
    },
    {
      title: "ACTIVE TODAY",
      value: activeToday,
      note: "Staff members currently marked active in the system.",
      accent: "green",
    },
  ];
}

export function formatStaffCountLabel(count: number) {
  return `${count} STAFF MEMBER${count === 1 ? "" : "S"}`;
}

function formatCalendarDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatClockTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatLastActiveLabel(value: string, referenceDate = new Date()) {
  const target = new Date(value);
  const normalizedTarget = new Date(target);
  normalizedTarget.setHours(0, 0, 0, 0);

  const normalizedReference = new Date(referenceDate);
  normalizedReference.setHours(0, 0, 0, 0);

  const differenceInDays =
    (normalizedReference.getTime() - normalizedTarget.getTime()) / (24 * 60 * 60 * 1000);

  if (differenceInDays === 0) {
    return `Today, ${formatClockTime(value)}`;
  }

  if (differenceInDays === 1) {
    return `Yesterday, ${formatClockTime(value)}`;
  }

  return formatCalendarDate(value);
}

export function createStaffRecord(
  values: StaffFormValues,
  currentRecord?: StaffRecord | null,
) {
  const id =
    currentRecord?.id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `staff-${Date.now()}`);

  return {
    id,
    fullName: values.fullName.trim(),
    role: values.role,
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    nicNumber: values.nicNumber.trim(),
    address: values.address.trim(),
    status: currentRecord?.status ?? "Active",
    lastActive: currentRecord?.lastActive ?? new Date().toISOString(),
  } satisfies StaffRecord;
}
