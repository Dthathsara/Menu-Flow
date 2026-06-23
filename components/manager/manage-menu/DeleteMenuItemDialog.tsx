import { TrashIcon, XIcon } from "../icons";
import {
  cn,
  getManagerBodyTextClasses,
  getManagerIconButtonClasses,
  getManagerModalSurfaceClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

interface DeleteMenuItemDialogProps {
  open: boolean;
  settings: ManagerSettings;
  itemName?: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteMenuItemDialog({
  open,
  settings,
  itemName,
  isDeleting = false,
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
        className={cn("max-w-md p-5 sm:p-6", getManagerModalSurfaceClasses(settings.scheme))}
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
            className={getManagerIconButtonClasses(settings.scheme, true)}
            aria-label="Close delete dialog"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <h3 id="delete-menu-item-title" className="mt-4 text-[1.35rem] font-semibold">
          Remove menu item?
        </h3>
        <p className={cn("mt-2", getManagerBodyTextClasses(settings.scheme))}>
          <span className="font-semibold text-current">{itemName}</span> will be removed from the
          current menu list and deleted from the database.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={getManagerSecondaryButtonClasses(settings.scheme)}
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              getManagerPrimaryButtonClasses(settings.scheme),
              "bg-rose-500 shadow-[0_16px_34px_rgba(244,63,94,0.24)] hover:bg-rose-600 hover:shadow-[0_22px_40px_rgba(244,63,94,0.28)]",
            )}
          >
            {isDeleting ? "Removing..." : "Remove Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
