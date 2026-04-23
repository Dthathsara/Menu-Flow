import { cn, getFocusRingClasses } from "../managerUtils";
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
    return scheme === "dark"
      ? "border-amber-400/18 bg-amber-500/12 text-amber-200"
      : "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (role === "Waiter") {
    return scheme === "dark"
      ? "border-blue-400/18 bg-blue-500/12 text-blue-200"
      : "border-blue-200 bg-blue-50 text-blue-700";
  }

  return scheme === "dark"
    ? "border-cyan-400/18 bg-cyan-500/12 text-cyan-200"
    : "border-cyan-200 bg-cyan-50 text-cyan-700";
}

export function getStatusBadgeClasses(status: StaffStatus, scheme: Scheme) {
  if (status === "Active") {
    return scheme === "dark"
      ? "border-emerald-400/18 bg-emerald-500/12 text-emerald-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Inactive") {
    return scheme === "dark"
      ? "border-rose-400/18 bg-rose-500/12 text-rose-200"
      : "border-rose-200 bg-rose-50 text-rose-700";
  }

  return scheme === "dark"
    ? "border-amber-400/18 bg-amber-500/12 text-amber-200"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

export function getUsersFieldLabelClasses(scheme: Scheme) {
  return cn(
    "text-[11px] font-semibold uppercase tracking-[0.22em]",
    scheme === "dark" ? "text-[#8FA2C6]" : "text-slate-500",
  );
}

export function getUsersMutedTextClasses(scheme: Scheme) {
  return scheme === "dark" ? "text-[#A2B1CF]" : "text-slate-500";
}

export function getUsersPanelClasses(scheme: Scheme) {
  return cn(
    "rounded-[20px] border",
    scheme === "dark"
      ? "border-[#1A2B4D] bg-[#081425]"
      : "border-slate-200 bg-white",
  );
}

export function getUsersCardClasses(scheme: Scheme, interactive = false) {
  return cn(
    "rounded-[24px] border",
    scheme === "dark"
      ? "border-[#18305C] bg-[linear-gradient(180deg,#09172D_0%,#071426_100%)] text-white shadow-[0_28px_60px_rgba(2,6,23,0.34)]"
      : "border-slate-200 bg-white text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.08)]",
    interactive &&
      (scheme === "dark"
        ? "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#25447F]"
        : "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300"),
  );
}

export function getUsersInputClasses(scheme: Scheme, multiline = false) {
  return cn(
    "box-border w-full min-w-0 rounded-[14px] border px-4 text-[15px] outline-none transition-all duration-200 ease-out",
    multiline ? "min-h-[104px] py-3.5" : "h-11",
    scheme === "dark"
      ? "border-[#1A2B4D] bg-[#091427] text-white placeholder:text-[#68789D] hover:border-[#274983] focus:border-[#3879F5]"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500",
    getFocusRingClasses(scheme),
  );
}

export function getUsersSearchShellClasses(scheme: Scheme) {
  return cn(
    "flex h-11 items-center gap-3 rounded-[14px] border px-4 transition-all duration-200 ease-out",
    scheme === "dark"
      ? "border-[#1A2B4D] bg-[#091427] text-white hover:border-[#274983] focus-within:border-[#3879F5]"
      : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus-within:border-blue-500",
    "focus-within:-translate-y-0.5",
    getFocusRingClasses(scheme),
  );
}

export function getUsersActionButtonClasses(
  scheme: Scheme,
  tone: "default" | "primary" | "danger" = "default",
) {
  if (tone === "primary") {
    return cn(
      "inline-flex h-10 items-center justify-center rounded-[14px] px-5 text-[14px] font-semibold text-white",
      "bg-[linear-gradient(135deg,#3B82F6,#2563EB)] shadow-[0_18px_40px_rgba(37,99,235,0.26)]",
      "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(37,99,235,0.32)] active:translate-y-0 active:scale-[0.99]",
      getFocusRingClasses(scheme),
    );
  }

  if (tone === "danger") {
    return cn(
      "inline-flex h-10 items-center justify-center rounded-[14px] border px-5 text-[14px] font-semibold",
      scheme === "dark"
        ? "border-rose-400/20 bg-rose-500/12 text-rose-100 hover:bg-rose-500/18"
        : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
      "transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
      getFocusRingClasses(scheme),
    );
  }

  return cn(
    "inline-flex h-8 items-center justify-center rounded-[11px] border px-3 text-[13px] font-semibold",
    scheme === "dark"
      ? "border-[#22385F] bg-[#13203B] text-white hover:border-[#345A99] hover:bg-[#172746]"
      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white",
    "transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
    getFocusRingClasses(scheme),
  );
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
    },
    {
      title: "KITCHEN STAFF",
      value: kitchenStaff,
      note: "Chefs handling kitchen preparation and service output.",
    },
    {
      title: "SERVICE STAFF",
      value: serviceStaff,
      note: "Waiters and counter staff supporting guest service flow.",
    },
    {
      title: "ACTIVE TODAY",
      value: activeToday,
      note: "Staff members currently marked active in the system.",
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
