import {
  cn,
  getManagerStrongTextClasses,
  getManagerTableCellPaddingClasses,
  getManagerTableRowClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { formatLastActiveLabel, getUsersMutedTextClasses } from "./helpers";
import {
  StaffInitialAvatar,
  StaffRoleBadge,
  StaffStatusBadge,
  UsersActionButton,
} from "./shared";
import type { StaffRecord } from "./types";

interface StaffRowProps {
  settings: ManagerSettings;
  staff: StaffRecord;
  onView: (staff: StaffRecord) => void;
  onEdit: (staff: StaffRecord) => void;
  onDelete: (staff: StaffRecord) => void;
}

export function StaffRow({ settings, staff, onView, onEdit, onDelete }: StaffRowProps) {
  return (
    <tr
      className={cn(
        getManagerTableRowClasses(settings.scheme),
      )}
    >
      <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
        <div className="flex items-start gap-3">
          <StaffInitialAvatar staff={staff} className="size-10 shrink-0 text-[17px]" />
          <div className="min-w-0">
            <div
              className={cn(
                "truncate text-[15px] font-semibold",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              {staff.fullName}
            </div>
            <div
              className={cn(
                "mt-1 truncate text-[13px] leading-5",
                getUsersMutedTextClasses(settings.scheme),
              )}
            >
              {staff.address}
            </div>
          </div>
        </div>
      </td>
      <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
        <StaffRoleBadge role={staff.role} settings={settings} />
      </td>
      <td className={cn(getManagerTableCellPaddingClasses(), "align-top whitespace-nowrap text-[14px] font-medium")}>
        {staff.email}
      </td>
      <td className={cn(getManagerTableCellPaddingClasses(), "align-top whitespace-nowrap text-[14px] font-medium")}>
        {staff.phone}
      </td>
      <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
        <StaffStatusBadge status={staff.status} settings={settings} />
      </td>
      <td className={cn(getManagerTableCellPaddingClasses(), "align-top whitespace-nowrap text-[14px] font-medium")}>
        {formatLastActiveLabel(staff.lastActive)}
      </td>
      <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
        <div className="flex items-center gap-2">
          <UsersActionButton type="button" settings={settings} onClick={() => onView(staff)}>
            View
          </UsersActionButton>
          <UsersActionButton type="button" settings={settings} onClick={() => onEdit(staff)}>
            Edit
          </UsersActionButton>
          <UsersActionButton type="button" settings={settings} onClick={() => onDelete(staff)}>
            Delete
          </UsersActionButton>
        </div>
      </td>
    </tr>
  );
}
