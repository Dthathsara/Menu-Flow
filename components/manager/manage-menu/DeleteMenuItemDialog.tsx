import { TrashIcon, XIcon } from "../icons";
import {
  cn,
  getContentSurfaceClasses,
  getFocusRingClasses,
  getInteractiveSecondaryButtonClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

interface DeleteMenuItemDialogProps {
  open: boolean;
  settings: ManagerSettings;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteMenuItemDialog({
  open,
  settings,
  itemName,
  onClose,
  onConfirm,
}: DeleteMenuItemDialogProps) {
  if (!open || !itemName) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-[20px] border p-5 sm:p-6",
          getContentSurfaceClasses(settings.scheme),
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-menu-item-title"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-md bg-rose-500/14 text-rose-500">
            <TrashIcon className="size-5" />
          </span>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-md border transition-all duration-200 ease-out hover:-translate-y-0.5",
              settings.scheme === "dark"
                ? "border-white/10 bg-slate-950/34 text-slate-200 hover:border-white/16 hover:bg-slate-950/48"
                : "border-slate-200 bg-slate-50/90 text-slate-600 hover:border-slate-300 hover:bg-white",
              getFocusRingClasses(settings.scheme),
            )}
            aria-label="Close delete dialog"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <h3 id="delete-menu-item-title" className="mt-4 text-xl font-semibold">
          Remove menu item?
        </h3>
        <p className={cn("mt-2 text-sm leading-6", getMutedTextClasses(settings.scheme))}>
          <span className="font-semibold text-current">{itemName}</span> will be removed from the
          current menu list. This action only affects local state for now.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-semibold",
              settings.scheme === "dark"
                ? "border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white",
              getInteractiveSecondaryButtonClasses(settings.scheme),
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-md bg-rose-500 px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(244,63,94,0.24)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-rose-600 active:translate-y-0 active:scale-[0.99]",
              getFocusRingClasses(settings.scheme),
            )}
          >
            Remove Item
          </button>
        </div>
      </div>
    </div>
  );
}
