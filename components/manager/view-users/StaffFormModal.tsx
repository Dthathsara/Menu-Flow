"use client";

import { useState } from "react";
import type { ManagerSettings } from "../managerTypes";
import { FilterDropdown } from "../view-orders/FilterDropdown";
import { DEFAULT_STAFF_FORM_VALUES, STAFF_ROLE_OPTIONS } from "./staff-data";
import {
  UsersActionButton,
  UsersFieldLabel,
  UsersModalFrame,
  UsersTextArea,
  UsersTextInput,
} from "./shared";
import type { StaffFormValues, StaffRecord } from "./types";

interface StaffFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  settings: ManagerSettings;
  staff?: StaffRecord | null;
  onClose: () => void;
  onSave: (values: StaffFormValues) => void;
}

function createFormValues(staff?: StaffRecord | null): StaffFormValues {
  if (!staff) {
    return DEFAULT_STAFF_FORM_VALUES;
  }

  return {
    fullName: staff.fullName,
    role: staff.role,
    email: staff.email,
    phone: staff.phone,
    nicNumber: staff.nicNumber,
    address: staff.address,
  };
}

export function StaffFormModal({
  open,
  mode,
  settings,
  staff,
  onClose,
  onSave,
}: StaffFormModalProps) {
  const [values, setValues] = useState<StaffFormValues>(() => createFormValues(staff));

  return (
    <UsersModalFrame
      open={open}
      settings={settings}
      title={mode === "add" ? "Add Staff Member" : "Edit Staff Member"}
      subtitle="Create or update a restaurant staff profile with core identity and contact details."
      maxWidthClassName="max-w-[720px]"
      onClose={onClose}
      titleId="staff-form-modal-title"
      footer={
        <>
          <UsersActionButton type="button" settings={settings} onClick={onClose} className="h-10 px-5">
            Cancel
          </UsersActionButton>
          <UsersActionButton
            type="submit"
            form="staff-form"
            tone="primary"
            settings={settings}
            className="h-10 px-5"
          >
            Save Staff Member
          </UsersActionButton>
        </>
      }
    >
      <form
        id="staff-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(values);
        }}
        className="grid gap-5"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <UsersFieldLabel settings={settings} htmlFor="staff-full-name">
              Full Name
            </UsersFieldLabel>
            <UsersTextInput
              id="staff-full-name"
              settings={settings}
              value={values.fullName}
              onChange={(event) =>
                setValues((current) => ({ ...current, fullName: event.target.value }))
              }
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <UsersFieldLabel settings={settings}>Role</UsersFieldLabel>
            <FilterDropdown
              label="Staff role"
              settings={settings}
              options={STAFF_ROLE_OPTIONS}
              value={values.role}
              onChange={(role) => setValues((current) => ({ ...current, role }))}
            />
          </div>

          <div className="space-y-2">
            <UsersFieldLabel settings={settings} htmlFor="staff-email">
              Email
            </UsersFieldLabel>
            <UsersTextInput
              id="staff-email"
              type="email"
              settings={settings}
              value={values.email}
              onChange={(event) =>
                setValues((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <UsersFieldLabel settings={settings} htmlFor="staff-phone">
              Phone
            </UsersFieldLabel>
            <UsersTextInput
              id="staff-phone"
              settings={settings}
              value={values.phone}
              onChange={(event) =>
                setValues((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+94 ..."
              required
            />
          </div>

          <div className="space-y-2">
            <UsersFieldLabel settings={settings} htmlFor="staff-nic-number">
              NIC Number
            </UsersFieldLabel>
            <UsersTextInput
              id="staff-nic-number"
              settings={settings}
              value={values.nicNumber}
              onChange={(event) =>
                setValues((current) => ({ ...current, nicNumber: event.target.value }))
              }
              placeholder="Enter NIC number"
              required
            />
          </div>

          <div className="hidden md:block" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <UsersFieldLabel settings={settings} htmlFor="staff-address">
            Address
          </UsersFieldLabel>
          <UsersTextArea
            id="staff-address"
            settings={settings}
            value={values.address}
            onChange={(event) =>
              setValues((current) => ({ ...current, address: event.target.value }))
            }
            placeholder="Enter staff address"
            required
          />
        </div>
      </form>
    </UsersModalFrame>
  );
}
