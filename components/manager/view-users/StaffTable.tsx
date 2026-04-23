import {
  cn,
  getManagerCardShellClasses,
  getManagerStrongTextClasses,
  getManagerTableHeadSurfaceClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { formatLastActiveLabel, getUsersFieldLabelClasses, getUsersMutedTextClasses } from "./helpers";
import {
  StaffInitialAvatar,
  StaffRoleBadge,
  StaffStatusBadge,
  UsersActionButton,
  UsersEmptyState,
} from "./shared";
import { StaffRow } from "./StaffRow";
import type { StaffRecord } from "./types";

interface StaffTableProps {
  settings: ManagerSettings;
  staffRecords: StaffRecord[];
  onView: (staff: StaffRecord) => void;
  onEdit: (staff: StaffRecord) => void;
  onDelete: (staff: StaffRecord) => void;
}

export function StaffTable({
  settings,
  staffRecords,
  onView,
  onEdit,
  onDelete,
}: StaffTableProps) {
  if (!staffRecords.length) {
    return (
      <UsersEmptyState
        settings={settings}
        title="No staff members match the current filters."
        description="Try broadening the search or clearing filters to see more staff records."
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr
                className={cn(
                  getManagerTableHeadSurfaceClasses(settings.scheme),
                  getManagerTableHeaderClasses(settings.scheme),
                )}
              >
                <th className={getManagerTableHeaderPaddingClasses()}>User</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Role</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Email</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Phone</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Status</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Last Active</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffRecords.map((staff) => (
                <StaffRow
                  key={staff.id}
                  settings={settings}
                  staff={staff}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {staffRecords.map((staff) => (
          <article
            key={staff.id}
            className={cn(
              "p-4",
              getManagerCardShellClasses(settings.scheme, { interactive: false }),
            )}
          >
            <div className="flex items-start gap-3">
              <StaffInitialAvatar staff={staff} className="size-12 shrink-0 text-[18px]" />
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-[16px] font-semibold", getManagerStrongTextClasses(settings.scheme))}>
                  {staff.fullName}
                </div>
                <div className={cn("mt-1 text-[14px] leading-6", getUsersMutedTextClasses(settings.scheme))}>
                  {staff.address}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileMeta label="Role" value={<StaffRoleBadge role={staff.role} settings={settings} />} settings={settings} />
              <MobileMeta label="Status" value={<StaffStatusBadge status={staff.status} settings={settings} />} settings={settings} />
              <MobileMeta label="Email" value={staff.email} settings={settings} />
              <MobileMeta label="Phone" value={staff.phone} settings={settings} />
              <MobileMeta label="NIC Number" value={staff.nicNumber} settings={settings} />
              <MobileMeta label="Last Active" value={formatLastActiveLabel(staff.lastActive)} settings={settings} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
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
          </article>
        ))}
      </div>
    </>
  );
}

function MobileMeta({
  label,
  value,
  settings,
}: {
  label: string;
  value: React.ReactNode;
  settings: ManagerSettings;
}) {
  return (
    <div className="space-y-1.5">
      <div className={getUsersFieldLabelClasses(settings.scheme)}>{label}</div>
      <div className="text-[14px] font-medium">{value}</div>
    </div>
  );
}
