"use client";

import { useMemo, useState } from "react";
import { getManagerPageSectionClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import {
  createStaffRecord,
  filterStaffRecords,
  getStaffSummaryCards,
} from "./helpers";
import {
  DEFAULT_STAFF_FILTERS,
  INITIAL_STAFF_RECORDS,
} from "./staff-data";
import { DeleteStaffModal } from "./DeleteStaffModal";
import { StaffDirectorySection } from "./StaffDirectorySection";
import { StaffFormModal } from "./StaffFormModal";
import { StaffProfileModal } from "./StaffProfileModal";
import { UsersHero } from "./UsersHero";
import type { StaffFilters, StaffFormValues, StaffRecord } from "./types";

interface UsersPageViewProps {
  settings: ManagerSettings;
}

export function UsersPageView({ settings }: UsersPageViewProps) {
  const [staffRecords, setStaffRecords] = useState<StaffRecord[]>(INITIAL_STAFF_RECORDS);
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_STAFF_FILTERS);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [activeStaff, setActiveStaff] = useState<StaffRecord | null>(null);
  const [profileStaff, setProfileStaff] = useState<StaffRecord | null>(null);
  const [staffPendingDelete, setStaffPendingDelete] = useState<StaffRecord | null>(null);

  const summaryCards = useMemo(() => getStaffSummaryCards(staffRecords), [staffRecords]);
  const filteredRecords = useMemo(
    () => filterStaffRecords(staffRecords, filters),
    [staffRecords, filters],
  );

  function openAddModal() {
    setActiveStaff(null);
    setFormMode("add");
  }

  function openEditModal(staff: StaffRecord) {
    setActiveStaff(staff);
    setProfileStaff(null);
    setFormMode("edit");
  }

  function handleSaveStaff(values: StaffFormValues) {
    const nextRecord = createStaffRecord(values, activeStaff);

    setStaffRecords((current) =>
      formMode === "edit"
        ? current.map((staff) => (staff.id === nextRecord.id ? nextRecord : staff))
        : [nextRecord, ...current],
    );

    setFormMode(null);
    setActiveStaff(null);
  }

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <UsersHero settings={settings} summaryCards={summaryCards} onAddStaff={openAddModal} />

        <StaffDirectorySection
          settings={settings}
          staffRecords={filteredRecords}
          query={filters.query}
          roleFilter={filters.role}
          statusFilter={filters.status}
          onQueryChange={(query) => setFilters((current) => ({ ...current, query }))}
          onRoleFilterChange={(role) => setFilters((current) => ({ ...current, role }))}
          onStatusFilterChange={(status) => setFilters((current) => ({ ...current, status }))}
          onView={setProfileStaff}
          onEdit={openEditModal}
          onDelete={setStaffPendingDelete}
        />
      </section>

      {formMode ? (
        <StaffFormModal
          key={`${formMode}-${activeStaff?.id ?? "new"}`}
          open
          mode={formMode}
          settings={settings}
          staff={activeStaff}
          onClose={() => {
            setFormMode(null);
            setActiveStaff(null);
          }}
          onSave={handleSaveStaff}
        />
      ) : null}

      <StaffProfileModal
        open={Boolean(profileStaff)}
        settings={settings}
        staff={profileStaff}
        onClose={() => setProfileStaff(null)}
        onEdit={openEditModal}
      />

      <DeleteStaffModal
        open={Boolean(staffPendingDelete)}
        settings={settings}
        staff={staffPendingDelete}
        onClose={() => setStaffPendingDelete(null)}
        onConfirm={() => {
          if (!staffPendingDelete) {
            return;
          }

          setStaffRecords((current) =>
            current.filter((staff) => staff.id !== staffPendingDelete.id),
          );
          setStaffPendingDelete(null);
          setProfileStaff((current) =>
            current?.id === staffPendingDelete.id ? null : current,
          );
        }}
      />
    </>
  );
}
