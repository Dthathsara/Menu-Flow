"use client";

import { cn, getManagerStrongTextClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { getUsersFieldLabelClasses, getUsersMutedTextClasses } from "./helpers";
import { UsersActionButton, UsersModalFrame, UsersPanel } from "./shared";
import type { StaffRecord } from "./types";

interface DeleteStaffModalProps {
  open: boolean;
  settings: ManagerSettings;
  staff: StaffRecord | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function DeleteStaffModal({
  open,
  settings,
  staff,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteStaffModalProps) {
  if (!staff) {
    return null;
  }

  return (
    <UsersModalFrame
      open={open}
      settings={settings}
      title="Delete Staff Member"
      subtitle="This action will remove the selected staff member from the active roster."
      maxWidthClassName="max-w-[560px]"
      onClose={onClose}
      titleId="delete-staff-modal-title"
      footer={
        <>
          <UsersActionButton
            type="button"
            settings={settings}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </UsersActionButton>
          <UsersActionButton
            type="submit"
            form="delete-staff-form"
            tone="danger"
            settings={settings}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Staff Member"}
          </UsersActionButton>
        </>
      }
    >
      <form
        id="delete-staff-form"
        onSubmit={(event) => {
          event.preventDefault();

          if (!isDeleting) {
            void onConfirm();
          }
        }}
      >
        <UsersPanel
          settings={settings}
          className={cn(
            "p-4 sm:p-5",
            settings.scheme === "dark"
              ? "border-rose-400/18 bg-rose-500/8"
              : "border-rose-200 bg-rose-50",
          )}
        >
          <div
            className={cn(
              "text-[1.05rem] font-semibold",
              getManagerStrongTextClasses(settings.scheme),
            )}
          >
            Delete {staff.fullName}?
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <div className={getUsersFieldLabelClasses(settings.scheme)}>Role</div>
              <div className="mt-1 text-[15px] font-medium">{staff.role}</div>
            </div>
            <div>
              <div className={getUsersFieldLabelClasses(settings.scheme)}>Email</div>
              <div className="mt-1 text-[15px] font-medium break-all">{staff.email}</div>
            </div>
          </div>
          <p className={cn("mt-4 text-[15px] leading-6", getUsersMutedTextClasses(settings.scheme))}>
            This action will remove the staff member from the directory immediately.
          </p>
        </UsersPanel>
      </form>
    </UsersModalFrame>
  );
}
