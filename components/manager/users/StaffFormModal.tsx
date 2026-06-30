"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { FilterDropdown } from "../orders/FilterDropdown";
import {
  DEFAULT_STAFF_FORM_VALUES,
  STAFF_STATUS_OPTIONS,
} from "./staff-data";
import {
  UsersActionButton,
  UsersFieldLabel,
  UsersModalFrame,
  UsersPanel,
  UsersTextArea,
  UsersTextInput,
} from "./shared";
import type { StaffFormValues, StaffRecord } from "./types";

interface StaffFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  settings: ManagerSettings;
  staff?: StaffRecord | null;
  roleSuggestions: readonly string[];
  isSaving: boolean;
  errorMessage: string;
  onClose: () => void;
  onSave: (values: StaffFormValues) => void | Promise<void>;
}

function createFormValues(staff?: StaffRecord | null): StaffFormValues {
  if (!staff) {
    return DEFAULT_STAFF_FORM_VALUES;
  }

  return {
    fullName: staff.fullName,
    role: staff.role,
    operationalAccess: staff.operationalAccess ?? "",
    email: staff.email,
    phone: staff.phone,
    nicNumber: staff.nicNumber,
    address: staff.address,
    status: staff.status,
    password: "",
  };
}

export function StaffFormModal({
  open,
  mode,
  settings,
  staff,
  roleSuggestions,
  isSaving,
  errorMessage,
  onClose,
  onSave,
}: StaffFormModalProps) {
  const [values, setValues] = useState<StaffFormValues>(() => createFormValues(staff));
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleFieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!roleDropdownOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (!roleFieldRef.current?.contains(target)) {
        setRoleDropdownOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [roleDropdownOpen]);

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
          <UsersActionButton
            type="button"
            settings={settings}
            onClick={onClose}
            className="h-10 px-5"
            disabled={isSaving}
          >
            Cancel
          </UsersActionButton>
          <UsersActionButton
            type="submit"
            form="staff-form"
            tone="primary"
            settings={settings}
            className="h-10 px-5"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Staff Member"}
          </UsersActionButton>
        </>
      }
    >
      <form
        id="staff-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSaving) {
            void onSave(values);
          }
        }}
        className="grid gap-5"
      >
        {errorMessage ? (
          <UsersPanel
            settings={settings}
            className={cn(
              "border-rose-400/30 bg-rose-500/10 p-4 text-[14px] font-semibold",
              settings.scheme === "dark" ? "text-rose-200" : "text-rose-700",
            )}
          >
            {errorMessage}
          </UsersPanel>
        ) : null}

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

          <div ref={roleFieldRef} className="relative space-y-2">
            <UsersFieldLabel settings={settings} htmlFor="staff-role">
              Role
            </UsersFieldLabel>
            <UsersTextInput
              id="staff-role"
              settings={settings}
              value={values.role}
              onChange={(event) =>
                setValues((current) => ({ ...current, role: event.target.value }))
              }
              onFocus={() => setRoleDropdownOpen(true)}
              onClick={() => setRoleDropdownOpen(true)}
              placeholder="Enter staff role"
              autoComplete="off"
              required
            />
            {roleDropdownOpen && roleSuggestions.length ? (
              <div
                className={cn(
                  "absolute left-0 right-0 top-full z-[145] mt-2 max-h-56 overflow-y-auto rounded-[18px] border p-1.5 shadow-2xl",
                  settings.scheme === "dark"
                    ? "border-[#1f2a44] bg-[#0B1A2B] shadow-[0_24px_52px_rgba(2,6,23,0.42)]"
                    : "border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]",
                )}
              >
                {roleSuggestions.map((role, index) => (
                  <button
                    key={`${role}-${index}`}
                    type="button"
                    onClick={() => {
                      setValues((current) => ({ ...current, role }));
                      setRoleDropdownOpen(false);
                    }}
                    className={cn(
                      "flex w-full rounded-[12px] px-3.5 py-3 text-left text-[14px] font-semibold transition-colors",
                      settings.scheme === "dark"
                        ? "text-slate-100 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                        : "text-slate-800 hover:bg-slate-100 focus:bg-slate-100",
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <UsersFieldLabel settings={settings}>Status</UsersFieldLabel>
            <FilterDropdown
              label="Staff status"
              settings={settings}
              options={STAFF_STATUS_OPTIONS}
              value={values.status}
              onChange={(status) => setValues((current) => ({ ...current, status }))}
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

          <div className="space-y-2">
            <UsersFieldLabel settings={settings} htmlFor="staff-password">
              Login Password
            </UsersFieldLabel>
            <UsersTextInput
              id="staff-password"
              type="password"
              settings={settings}
              value={values.password ?? ""}
              onChange={(event) =>
                setValues((current) => ({ ...current, password: event.target.value }))
              }
              placeholder={
                mode === "edit"
                  ? "Leave blank to keep current password"
                  : "Optional login password"
              }
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <UsersFieldLabel settings={settings} htmlFor="staff-operational-access">
              Operational Access
            </UsersFieldLabel>
            <UsersTextInput
              id="staff-operational-access"
              settings={settings}
              value={values.operationalAccess}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  operationalAccess: event.target.value,
                }))
              }
              placeholder="Enter operational access"
            />
          </div>
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
