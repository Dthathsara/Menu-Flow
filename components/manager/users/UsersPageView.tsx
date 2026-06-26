"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getManagerPageSectionClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { SessionExpiredError } from "@/lib/auth-session";
import {
  createStaffMember,
  deleteStaffMember,
  fetchStaffMembers,
  fetchStaffRoles,
  fetchStaffSummary,
  updateStaffMember,
} from "@/lib/manager-staff-api";
import {
  filterStaffRecords,
  getStaffSummaryCounts,
  getStaffSummaryCards,
} from "./helpers";
import {
  DEFAULT_STAFF_FILTERS,
  DEFAULT_STAFF_ROLE_SUGGESTIONS,
} from "./staff-data";
import { DeleteStaffModal } from "./DeleteStaffModal";
import { StaffDirectorySection } from "./StaffDirectorySection";
import { StaffFormModal } from "./StaffFormModal";
import { StaffProfileModal } from "./StaffProfileModal";
import { UsersHero } from "./UsersHero";
import type {
  StaffFilters,
  StaffFormValues,
  StaffRecord,
  StaffSummaryCounts,
} from "./types";

interface UsersPageViewProps {
  settings: ManagerSettings;
}

export function UsersPageView({ settings }: UsersPageViewProps) {
  const [staffRecords, setStaffRecords] = useState<StaffRecord[]>([]);
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_STAFF_FILTERS);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [activeStaff, setActiveStaff] = useState<StaffRecord | null>(null);
  const [profileStaff, setProfileStaff] = useState<StaffRecord | null>(null);
  const [staffPendingDelete, setStaffPendingDelete] = useState<StaffRecord | null>(null);
  const [summaryCounts, setSummaryCounts] = useState<StaffSummaryCounts>(
    getStaffSummaryCounts([]),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>(
    DEFAULT_STAFF_ROLE_SUGGESTIONS,
  );

  const summaryCards = useMemo(
    () => getStaffSummaryCards(staffRecords, summaryCounts),
    [staffRecords, summaryCounts],
  );
  const filteredRecords = useMemo(
    () => filterStaffRecords(staffRecords, filters),
    [staffRecords, filters],
  );

  const refreshSummary = useCallback(async (records: StaffRecord[]) => {
    setSummaryCounts(getStaffSummaryCounts(records));

    try {
      setSummaryCounts(await fetchStaffSummary());
    } catch {
      setSummaryCounts(getStaffSummaryCounts(records));
    }
  }, []);

  const loadStaffData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const [staffResult, summaryResult, rolesResult] = await Promise.allSettled([
      fetchStaffMembers(),
      fetchStaffSummary(),
      fetchStaffRoles(),
    ]);

    if (staffResult.status === "fulfilled") {
      setStaffRecords(staffResult.value);
      setSummaryCounts(
        summaryResult.status === "fulfilled"
          ? summaryResult.value
          : getStaffSummaryCounts(staffResult.value),
      );
      const loadedRoles = staffResult.value
        .map((staff) => staff.role.trim())
        .filter(Boolean);
      const endpointRoles = rolesResult.status === "fulfilled" ? rolesResult.value : [];
      setRoleSuggestions(mergeRoleSuggestions(endpointRoles, loadedRoles));
    } else {
      setStaffRecords([]);
      setSummaryCounts(getStaffSummaryCounts([]));
      setErrorMessage(getUsersApiErrorMessage(staffResult.reason, "Unable to load staff members."));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  function openAddModal() {
    setActiveStaff(null);
    setModalErrorMessage("");
    setFormMode("add");
  }

  function openEditModal(staff: StaffRecord) {
    setActiveStaff(staff);
    setProfileStaff(null);
    setModalErrorMessage("");
    setFormMode("edit");
  }

  async function handleSaveStaff(values: StaffFormValues) {
    const validationError = validateStaffForm(values);

    if (validationError) {
      setModalErrorMessage(validationError);
      return;
    }

    setIsSaving(true);
    setModalErrorMessage("");
    setErrorMessage("");

    try {
      const savedStaff =
        formMode === "edit" && activeStaff
          ? await updateStaffMember(activeStaff.id, values)
          : await createStaffMember(values);
      const nextRecords =
        formMode === "edit" && activeStaff
          ? staffRecords.map((staff) => (staff.id === activeStaff.id ? savedStaff : staff))
          : [savedStaff, ...staffRecords];

      setStaffRecords(nextRecords);
      setSummaryCounts(getStaffSummaryCounts(nextRecords));
      setRoleSuggestions((current) => mergeRoleSuggestions(current, [savedStaff.role]));
      setProfileStaff((current) => (current?.id === savedStaff.id ? savedStaff : current));
      setFormMode(null);
      setActiveStaff(null);
      void refreshSummary(nextRecords);
    } catch (error) {
      setModalErrorMessage(getUsersApiErrorMessage(error, "Unable to save staff member."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteStaff() {
    if (!staffPendingDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const deletedId = staffPendingDelete.id;
      await deleteStaffMember(deletedId);
      const nextRecords = staffRecords.filter((staff) => staff.id !== deletedId);

      setStaffRecords(nextRecords);
      setSummaryCounts(getStaffSummaryCounts(nextRecords));
      setStaffPendingDelete(null);
      setProfileStaff((current) => (current?.id === deletedId ? null : current));
      void refreshSummary(nextRecords);
    } catch (error) {
      setErrorMessage(getUsersApiErrorMessage(error, "Unable to delete staff member."));
    } finally {
      setIsDeleting(false);
    }
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
          isLoading={isLoading}
          errorMessage={errorMessage}
          totalStaffCount={staffRecords.length}
          onRetry={loadStaffData}
        />
      </section>

      {formMode ? (
        <StaffFormModal
          key={`${formMode}-${activeStaff?.id ?? "new"}`}
          open
          mode={formMode}
          settings={settings}
          staff={activeStaff}
          roleSuggestions={roleSuggestions}
          isSaving={isSaving}
          errorMessage={modalErrorMessage}
          onClose={() => {
            if (isSaving) {
              return;
            }

            setFormMode(null);
            setActiveStaff(null);
            setModalErrorMessage("");
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
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setStaffPendingDelete(null);
          }
        }}
        onConfirm={handleDeleteStaff}
      />
    </>
  );
}

function getUsersApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof SessionExpiredError) {
    return "Your session has expired. Please log in again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function validateStaffForm(values: StaffFormValues) {
  if (!values.fullName.trim()) {
    return "Full name is required.";
  }

  if (!values.role.trim()) {
    return "Role is required.";
  }

  if (!values.email.trim()) {
    return "Email is required.";
  }

  if (!values.phone.trim()) {
    return "Phone number is required.";
  }

  if (!values.nicNumber.trim()) {
    return "NIC number is required.";
  }

  if (!values.address.trim()) {
    return "Address is required.";
  }

  return "";
}

function mergeRoleSuggestions(...groups: readonly string[][]) {
  return Array.from(
    new Set(
      [...DEFAULT_STAFF_ROLE_SUGGESTIONS, ...groups.flat()]
        .map((role) => role.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}
