"use client";

import { cn, getManagerStrongTextClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import {
  getUsersFieldLabelClasses,
  getUsersMutedTextClasses,
} from "./helpers";
import {
  StaffInitialAvatar,
  StaffRoleBadge,
  StaffStatusBadge,
  UsersActionButton,
  UsersModalFrame,
  UsersPanel,
} from "./shared";
import type { StaffRecord } from "./types";

interface StaffProfileModalProps {
  open: boolean;
  settings: ManagerSettings;
  staff: StaffRecord | null;
  onClose: () => void;
  onEdit: (staff: StaffRecord) => void;
}

export function StaffProfileModal({
  open,
  settings,
  staff,
  onClose,
  onEdit,
}: StaffProfileModalProps) {
  if (!staff) {
    return null;
  }

  return (
    <UsersModalFrame
      open={open}
      settings={settings}
      title="Staff Profile"
      subtitle="Review role, identity details, address, and operational access for this team member."
      maxWidthClassName="max-w-[720px]"
      onClose={onClose}
      titleId="staff-profile-modal-title"
      footer={
        <>
          <UsersActionButton type="button" tone="primary" settings={settings} onClick={() => onEdit(staff)}>
            Edit Staff Member
          </UsersActionButton>
          <UsersActionButton type="button" settings={settings} onClick={onClose}>
            Close
          </UsersActionButton>
        </>
      }
    >
      <UsersPanel settings={settings} className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <StaffInitialAvatar staff={staff} className="size-[78px] shrink-0 text-[23px]" />
          <div className="min-w-0">
            <div
              className={cn(
                "text-[1.05rem] font-semibold sm:text-[1.15rem]",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              {staff.fullName}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StaffRoleBadge role={staff.role} settings={settings} />
              <StaffStatusBadge status={staff.status} settings={settings} />
            </div>
            <div className={cn("mt-4 text-[15px] leading-6", getUsersMutedTextClasses(settings.scheme))}>
              {staff.address}
            </div>
          </div>
        </div>
      </UsersPanel>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ProfileInfoCard label="Email" value={staff.email} settings={settings} />
        <ProfileInfoCard label="Phone" value={staff.phone} settings={settings} />
        <ProfileInfoCard label="NIC Number" value={staff.nicNumber} settings={settings} />
        <ProfileInfoCard
          label="Operational Access"
          value={staff.operationalAccess?.trim() || "No operational access assigned."}
          settings={settings}
        />
      </div>
    </UsersModalFrame>
  );
}

function ProfileInfoCard({
  label,
  value,
  settings,
}: {
  label: string;
  value: string;
  settings: ManagerSettings;
}) {
  return (
    <UsersPanel settings={settings} className="p-4 sm:p-5">
      <div className={getUsersFieldLabelClasses(settings.scheme)}>{label}</div>
      <div
        className={cn(
          "mt-3 text-[15px] font-semibold leading-7",
          getManagerStrongTextClasses(settings.scheme),
        )}
      >
        {value}
      </div>
    </UsersPanel>
  );
}
