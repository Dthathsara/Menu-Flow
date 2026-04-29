"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { XIcon } from "../icons";
import {
  cn,
  getManagerIconButtonClasses,
  getManagerModalSurfaceClasses,
  getManagerModalTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSectionSubtitleClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { formatCurrency, formatReceiptDate, getMutedButtonClasses } from "./billing.helpers";
import type { BillRecord } from "./billing.types";

interface BillReceiptModalProps {
  open: boolean;
  settings: ManagerSettings;
  bill: BillRecord | null;
  onClose: () => void;
  onDownloadPdf: () => void;
}

export function BillReceiptModal({
  open,
  settings,
  bill,
  onClose,
  onDownloadPdf,
}: BillReceiptModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  function handlePrintReceipt() {
    if (!bill) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=920,height=980");

    if (!printWindow) {
      window.print();
      return;
    }

    const lines = bill.receipt.items
      .map(
        (item) =>
          `<tr><td>${item.name} x ${item.quantity}</td><td style="text-align:right;font-weight:700;">${formatCurrency(item.total)}</td></tr>`,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${bill.billId} Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
            .receipt { max-width: 760px; margin: 24px auto; background: #ffffff; border-radius: 22px; padding: 24px; }
            .row { display: flex; justify-content: space-between; gap: 16px; }
            .muted { color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td { border-bottom: 1px solid #e2e8f0; padding: 14px 0; font-size: 16px; }
            .total { font-size: 24px; font-weight: 700; margin-top: 18px; padding-top: 18px; border-top: 2px solid #0f172a; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="row">
              <div>
                <h1 style="margin:0 0 8px;font-size:40px;">${bill.receipt.restaurantName}</h1>
                <div class="muted" style="margin-bottom:6px;">${bill.receipt.branchName}</div>
                <div class="muted">Bill ID: ${bill.billId}</div>
              </div>
              <div style="text-align:right;" class="muted">
                <div>Table: ${bill.tableNumber}</div>
                <div style="margin-top:8px;">Waiter: ${bill.waiterName}</div>
                <div style="margin-top:8px;">Date: ${formatReceiptDate(bill.receipt.issuedOn)}</div>
              </div>
            </div>
            <table>
              <tbody>
                ${lines}
                <tr><td>Subtotal</td><td style="text-align:right;font-weight:700;">${formatCurrency(bill.receipt.subtotal)}</td></tr>
                <tr><td>Tax 5%</td><td style="text-align:right;font-weight:700;">${formatCurrency(bill.receipt.taxAmount)}</td></tr>
                <tr><td>Service Charge</td><td style="text-align:right;font-weight:700;">${formatCurrency(bill.receipt.serviceCharge)}</td></tr>
              </tbody>
            </table>
            <div class="row total">
              <div>Total</div>
              <div>${formatCurrency(bill.total)}</div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.setTimeout(() => window.close(), 120);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  if (!open || !bill) {
    return null;
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 px-6 py-8 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bill-receipt-title"
        className={cn(
          "w-full max-w-[960px] max-h-[calc(100vh-80px)] overflow-hidden rounded-[24px] border",
          getManagerModalSurfaceClasses(settings.scheme),
        )}
      >
        <div className="flex max-h-[calc(100vh-80px)] flex-col overflow-hidden rounded-[24px]">
          <div
            className={cn(
              "flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5",
              settings.scheme === "dark"
                ? "border-white/10 bg-slate-900/72"
                : "border-slate-200 bg-slate-50/85",
            )}
          >
            <div className="min-w-0">
              <h2 id="bill-receipt-title" className={getManagerModalTitleClasses()}>
                Bill Receipt
              </h2>
              <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
                {bill.billId} - {bill.tableNumber}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={getManagerIconButtonClasses(settings.scheme, true)}
              aria-label="Close Bill Receipt"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div
            className={cn(
              "min-h-0 overflow-y-auto px-6 py-6",
              settings.scheme === "dark" ? "bg-slate-950/98" : "bg-white/98",
            )}
          >
            <div className="rounded-[22px] bg-slate-50 p-6 text-slate-800">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-[1.7rem] font-bold tracking-tight text-slate-800 sm:text-[1.95rem]">
                    {bill.receipt.restaurantName}
                  </h3>
                  <div className="mt-1.5 text-[15px] text-slate-500">{bill.receipt.branchName}</div>
                  <div className="mt-1 text-[15px] text-slate-500">Bill ID: {bill.billId}</div>
                </div>
                <div className="space-y-1 text-[15px] text-slate-500 md:text-right">
                  <div>Table: {bill.tableNumber}</div>
                  <div>Waiter: {bill.waiterName}</div>
                  <div>Date: {formatReceiptDate(bill.receipt.issuedOn)}</div>
                </div>
              </div>

              <div className="my-4 border-t border-dashed border-slate-300" />

              <div>
                {bill.receipt.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-[15px]"
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-bold text-slate-800">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-[15px]">
                <div className="flex items-center justify-between border-b border-slate-200 py-3">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatCurrency(bill.receipt.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 py-3">
                  <span>Tax 5%</span>
                  <span className="font-bold text-slate-800">{formatCurrency(bill.receipt.taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 py-3">
                  <span>Service Charge</span>
                  <span className="font-bold text-slate-800">{formatCurrency(bill.receipt.serviceCharge)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 border-t-2 border-slate-800 pt-5">
                <span className="text-[1.2rem] font-bold text-slate-900 sm:text-[1.4rem]">Total</span>
                <span className="text-[2rem] font-bold tracking-tight text-slate-900 sm:text-[2.2rem]">
                  {formatCurrency(bill.total)}
                </span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex shrink-0 justify-end gap-3 border-t px-6 py-5",
              settings.scheme === "dark"
                ? "border-white/10 bg-slate-900/72"
                : "border-slate-200 bg-slate-50/85",
            )}
          >
            <button type="button" onClick={handlePrintReceipt} className={getMutedButtonClasses(settings.scheme)}>
              Print Receipt
            </button>
            <button
              type="button"
              onClick={onDownloadPdf}
              className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-5 text-[14px]")}
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
