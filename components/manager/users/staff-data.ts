import type {
  StaffFilters,
  StaffFormValues,
  StaffRecord,
  StaffRole,
  StaffRoleFilter,
  StaffStatusFilter,
} from "./types";

export const DEFAULT_STAFF_FILTERS: StaffFilters = {
  query: "",
  role: "All Roles",
  status: "All Statuses",
};

export const DEFAULT_STAFF_FORM_VALUES: StaffFormValues = {
  fullName: "",
  role: "Chef",
  email: "",
  phone: "",
  nicNumber: "",
  address: "",
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

export const INITIAL_STAFF_RECORDS: StaffRecord[] = [
  {
    id: "staff-nadeesha-senanayake",
    fullName: "Nadeesha Senanayake",
    address: "18 Temple Road, Nugegoda",
    role: "Chef",
    email: "nadeesha.senanayake@menuflow.lk",
    phone: "+94 77 415 8221",
    nicNumber: "199018402345",
    status: "Active",
    lastActive: "2026-04-24T11:40:00+05:30",
  },
  {
    id: "staff-tharindu-wijesinghe",
    fullName: "Tharindu Wijesinghe",
    address: "42 Lake Drive, Maharagama",
    role: "Chef",
    email: "tharindu.wijesinghe@menuflow.lk",
    phone: "+94 71 884 2021",
    nicNumber: "199214701238",
    status: "Active",
    lastActive: "2026-04-24T10:12:00+05:30",
  },
  {
    id: "staff-sanduni-rajapaksha",
    fullName: "Sanduni Rajapaksha",
    address: "7 Station Lane, Moratuwa",
    role: "Chef",
    email: "sanduni.rajapaksha@menuflow.lk",
    phone: "+94 76 883 1102",
    nicNumber: "199623403176",
    status: "On Leave",
    lastActive: "2026-04-23T18:35:00+05:30",
  },
  {
    id: "staff-kavindu-peris",
    fullName: "Kavindu Peris",
    address: "105 Galle Road, Dehiwala",
    role: "Waiter",
    email: "kavindu.peris@menuflow.lk",
    phone: "+94 75 220 8765",
    nicNumber: "199911203842",
    status: "Active",
    lastActive: "2026-04-24T09:48:00+05:30",
  },
  {
    id: "staff-sachini-gunawardena",
    fullName: "Sachini Gunawardena",
    address: "23 School Avenue, Koltawa",
    role: "Waiter",
    email: "sachini.gunawardena@menuflow.lk",
    phone: "+94 70 432 9988",
    nicNumber: "200112602054",
    status: "Inactive",
    lastActive: "2026-04-20T13:18:00+05:30",
  },
  {
    id: "staff-dilan-hettiarachchi",
    fullName: "Dilan Hettiarachchi",
    address: "11 Main Cross Road, Piliyandala",
    role: "Counter",
    email: "dilan.hettiarachchi@menuflow.lk",
    phone: "+94 72 318 7745",
    nicNumber: "199611278340",
    status: "On Leave",
    lastActive: "2026-04-22T08:54:00+05:30",
  },
  {
    id: "staff-malsha-fernando",
    fullName: "Malsha Fernando",
    address: "58 Flower Road, Colombo 07",
    role: "Counter",
    email: "malsha.fernando@menuflow.lk",
    phone: "+94 74 226 6403",
    nicNumber: "199804502781",
    status: "Active",
    lastActive: "2026-04-24T08:06:00+05:30",
  },
];
