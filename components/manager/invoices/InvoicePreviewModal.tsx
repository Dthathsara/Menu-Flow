import { COMPANY_ADDRESS } from "./invoice.data";
import { InvoiceModalFrame } from "./InvoiceModalFrame";
import {
  cn,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { InvoiceRecord } from "./invoice.types";

interface InvoicePreviewModalProps {
  settings: ManagerSettings;
  invoice: InvoiceRecord;
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
  isActionLoading?: boolean;
}

export function InvoicePreviewModal({
  settings,
  invoice,
  onClose,
  onDownload,
  onPrint,
  isActionLoading,
}: InvoicePreviewModalProps) {
  return (
    <InvoicePreviewModalFrame
      settings={settings}
      invoice={invoice}
      onClose={onClose}
      onDownload={onDownload}
      onPrint={onPrint}
      isActionLoading={isActionLoading}
    />
  );
}

function InvoicePreviewModalFrame({
  settings,
  invoice,
  onClose,
  onDownload,
  onPrint,
  isActionLoading = false,
}: InvoicePreviewModalProps) {
  const billedTo = invoice.billedTo;

  return (
    <InvoiceModalFrame
      open
      settings={settings}
      title="Invoice Preview"
      subtitle={`Print-ready subscription invoice for ${billedTo.restaurantName}.`}
      maxWidthClassName="max-w-[980px]"
      footer={
        <>
          <button
            type="button"
            onClick={onDownload}
            disabled={isActionLoading}
            className={cn(
              getManagerSecondaryButtonClasses(settings.scheme),
              "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55",
            )}
          >
            Download
          </button>
          <button
            type="button"
            onClick={onPrint}
            disabled={isActionLoading}
            className={cn(
              getManagerPrimaryButtonClasses(settings.scheme),
              "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55",
            )}
          >
            Print Invoice
          </button>
        </>
      }
      onClose={onClose}
    >
      <div className="rounded-[18px] bg-white p-6 text-slate-800 sm:p-7">
        <div className="grid gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-[2rem] font-bold leading-none text-slate-900">MenuFlow</h3>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              Smart menus. Faster service.
              <br />
              {COMPANY_ADDRESS}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-[2rem] font-bold leading-none text-slate-900">INVOICE</div>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              Invoice: #{invoice.invoiceNumber || invoice.id}
              <br />
              Billing Date: {invoice.billingDate}
              <br />
              Due Date: {invoice.renewalDate}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="text-[1.15rem] font-semibold text-slate-600">Billed To:</div>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">
            {billedTo.restaurantName}
            <br />
            {billedTo.restaurantAddress}
            <br />
            {billedTo.billingEmail}
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[14px] border border-slate-200">
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-slate-100">
              <tr>
                {["Description", "Cycle", "Amount"].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: invoice.invoiceLineLabel,
                  cycle: invoice.cycle,
                  amount: invoice.lineAmount,
                },
                { label: "Tax / Service", cycle: "-", amount: invoice.taxDisplay },
                ...(invoice.discountAmount && invoice.discountAmount > 0
                  ? [{ label: "Discount", cycle: "-", amount: invoice.discountDisplay }]
                  : []),
                { label: "Total", cycle: "", amount: invoice.totalDisplay },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="border-b border-slate-200 px-4 py-4 text-[15px] font-semibold text-slate-900">
                    {row.label}
                  </td>
                  <td className="border-b border-slate-200 px-4 py-4 text-[15px] font-semibold text-slate-900">
                    {row.cycle}
                  </td>
                  <td className="border-b border-slate-200 px-4 py-4 text-[15px] font-semibold text-slate-900">
                    {row.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-[15px] leading-7 text-slate-600">
          Status: <span className="font-semibold text-slate-800">{invoice.status}</span>
          <br />
          Thank you for using MenuFlow.
        </p>
      </div>
    </InvoiceModalFrame>
  );
}
