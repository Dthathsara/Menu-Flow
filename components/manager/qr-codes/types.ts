export interface QrCodeRecord {
  id: string;
  tableNumber: string;
  section: string;
  branch: string;
  status: "Active";
  qrValue: string;
  createdAt: string;
}

export interface GenerateQrFormValues {
  tableNumber: string;
  section: string;
}
