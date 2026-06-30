export interface QrCodeRecord {
  id: string;
  tableNumber: string;
  section: string;
  branch: string;
<<<<<<< HEAD
  status: "Active";
=======
  qrToken: string;
  customerUrl: string;
  qrImageUrl: string;
  status: string;
  isActive: boolean;
>>>>>>> Dulnith
  qrValue: string;
  createdAt: string;
}

export interface GenerateQrFormValues {
  tableNumber: string;
  section: string;
}
