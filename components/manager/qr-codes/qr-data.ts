import type { GenerateQrFormValues, QrCodeRecord } from "./types";

export const DEFAULT_QR_BRANCH = "Chinese Dragon Cafe";
export const DEFAULT_QR_BASE_URL = "https://menuflow.app/menu";

export function createTableQrValue(
  tableNumber: string,
  section: string,
  branch: string,
) {
  const url = new URL(DEFAULT_QR_BASE_URL);

  url.searchParams.set("table", tableNumber.trim().toUpperCase());
  url.searchParams.set("section", section.trim());
  url.searchParams.set("branch", branch.trim());

  return url.toString();
}

export function createQrCodeRecord(
  values: GenerateQrFormValues,
  overrides?: Partial<QrCodeRecord>,
): QrCodeRecord {
  const id =
    overrides?.id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `qr-${Date.now()}`);
  const tableNumber = values.tableNumber.trim().toUpperCase();
  const section = values.section.trim();
  const branch = overrides?.branch ?? DEFAULT_QR_BRANCH;
  const qrValue = createTableQrValue(tableNumber, section, branch);

  return {
    id,
<<<<<<< HEAD
    tableNumber,
    section,
    branch,
    status: "Active",
    qrValue,
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
=======
    tenantId: overrides?.tenantId ?? "",
    tableNumber,
    section,
    branch,
    qrToken: overrides?.qrToken ?? "",
    customerUrl: overrides?.customerUrl ?? qrValue,
    qrImageUrl: overrides?.qrImageUrl ?? "",
    status: "Active",
    isActive: overrides?.isActive ?? true,
    qrValue,
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
>>>>>>> Dulnith
  };
}

export const INITIAL_QR_CODES: QrCodeRecord[] = [
  createQrCodeRecord(
    {
      tableNumber: "T-01",
      section: "Indoor Section",
    },
    {
      id: "qr-t-01",
      createdAt: "2026-04-20T08:30:00.000Z",
    },
  ),
  createQrCodeRecord(
    {
      tableNumber: "T-08",
      section: "VIP Section",
    },
    {
      id: "qr-t-08",
      createdAt: "2026-04-20T09:00:00.000Z",
    },
  ),
  createQrCodeRecord(
    {
      tableNumber: "T-12",
      section: "Outdoor Section",
    },
    {
      id: "qr-t-12",
      createdAt: "2026-04-20T09:30:00.000Z",
    },
  ),
  createQrCodeRecord(
    {
      tableNumber: "T-15",
      section: "Rooftop Section",
    },
    {
      id: "qr-t-15",
      createdAt: "2026-04-20T10:00:00.000Z",
    },
  ),
];
