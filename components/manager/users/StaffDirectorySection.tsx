"use client";

import {
  cn,
  getManagerBodyTextClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { FilterDropdown } from "../orders/FilterDropdown";
import { formatStaffCountLabel } from "./helpers";
import {
  STAFF_ROLE_FILTER_OPTIONS,
  STAFF_STATUS_FILTER_OPTIONS,
} from "./staff-data";
import { StaffTable } from "./StaffTable";
import {
  UsersSearchField,
  UsersSectionBadge,
  UsersSurfaceCard,
} from "./shared";
import type { StaffRecord, StaffRoleFilter, StaffStatusFilter } from "./types";

interface StaffDirectorySectionProps {
  settings: ManagerSettings;
  staffRecords: StaffRecord[];
  query: string;
  roleFilter: StaffRoleFilter;
  statusFilter: StaffStatusFilter;
  onQueryChange: (value: string) => void;
  onRoleFilterChange: (value: StaffRoleFilter) => void;
  onStatusFilterChange: (value: StaffStatusFilter) => void;
  onView: (staff: StaffRecord) => void;
  onEdit: (staff: StaffRecord) => void;
  onDelete: (staff: StaffRecord) => void;
}

export function StaffDirectorySection({
  settings,
  staffRecords,
  query,
  roleFilter,
  statusFilter,
  onQueryChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onView,
  onEdit,
  onDelete,
}: StaffDirectorySectionProps) {
  return (
    <UsersSurfaceCard settings={settings} className="overflow-hidden" interactive>
      <div className="border-b border-black/5 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className={getManagerSectionTitleClasses()}>Staff Directory</h3>
            <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
              Search, filter, create, edit, review, and remove restaurant staff profiles
              from one dashboard.
            </p>
          </div>
          <UsersSectionBadge
            settings={settings}
            className="self-start"
          >
            {formatStaffCountLabel(staffRecords.length)}
          </UsersSectionBadge>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_280px_280px_auto] xl:items-center">
          <UsersSearchField
            settings={settings}
            value={query}
            onChange={onQueryChange}
            placeholder="Search by name, email, or phone"
          />

          <FilterDropdown
            label="Role filter"
            settings={settings}
            options={STAFF_ROLE_FILTER_OPTIONS}
            value={roleFilter}
            onChange={onRoleFilterChange}
          />

          <FilterDropdown
            label="Status filter"
            settings={settings}
            options={STAFF_STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={onStatusFilterChange}
          />

          <div className={cn("font-medium", getManagerBodyTextClasses(settings.scheme))}>
            {staffRecords.length} result{staffRecords.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <StaffTable
        settings={settings}
        staffRecords={staffRecords}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </UsersSurfaceCard>
  );
}
