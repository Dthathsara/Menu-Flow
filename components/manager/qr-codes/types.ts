export interface QrCodeRecord {
  id: string;
  tenantId: string;
  tableNumber: string;
  section: string;
  qrToken: string;
  customerUrl: string;
  qrImageUrl: string;
  status: string;
  isActive: boolean;
  qrValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateQrFormValues {
  tableNumber: string;
  section: string;
}
