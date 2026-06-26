"use client";

import {
  cn,
  getManagerBodyTextClasses,
  getManagerControlShellClasses,
  getManagerPanelShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
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
  isLoading: boolean;
  errorMessage: string;
  totalStaffCount: number;
  onRetry: () => void;
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
  isLoading,
  errorMessage,
  totalStaffCount,
  onRetry,
}: StaffDirectorySectionProps) {
  const hasActiveFilters =
    query.trim().length > 0 ||
    roleFilter !== "All Roles" ||
    statusFilter !== "All Statuses";

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
            placeholder="Search by name, email, phone, NIC, or address"
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

      {errorMessage ? (
        <div className={cn("m-5 px-5 py-10 text-center", getManagerPanelShellClasses(settings.scheme))}>
          <div className={cn("text-[1.05rem] font-semibold", getManagerStrongTextClasses(settings.scheme))}>
            {errorMessage}
          </div>
          <button
            type="button"
            onClick={onRetry}
            className={cn("mt-4 rounded-[12px] px-4 py-2 text-[14px] font-semibold", getManagerControlShellClasses(settings.scheme))}
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className={cn("m-5 px-5 py-14 text-center", getManagerPanelShellClasses(settings.scheme))}>
          <div className={cn("text-[1.05rem] font-semibold", getManagerStrongTextClasses(settings.scheme))}>
            Loading staff members...
          </div>
          <p className={cn("mt-2 text-[14px]", getMutedTextClasses(settings.scheme))}>
            Fetching the latest restaurant staff directory.
          </p>
        </div>
      ) : (
        <StaffTable
          settings={settings}
          staffRecords={staffRecords}
          hasActiveFilters={hasActiveFilters}
          totalStaffCount={totalStaffCount}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </UsersSurfaceCard>
  );
}
