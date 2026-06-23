"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { ErrorMessage } from "@/components/common/ui/ErrorMessage";
import {
  updateRestaurantProfile,
  uploadRestaurantImage,
} from "@/lib/users-api";
import { RestaurantProfileImage } from "../RestaurantProfileImage";
import { UploadIcon, XIcon } from "../icons";
import {
  cn,
  getManagerIconButtonClasses,
  getManagerLabelClasses,
  getManagerModalSurfaceClasses,
  getManagerModalTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSectionSubtitleClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { RestaurantProfile } from "./settings.types";
import { getSettingsGhostButtonClasses } from "./settings.helpers";

interface EditRestaurantProfileModalProps {
  open: boolean;
  settings: ManagerSettings;
  profile: RestaurantProfile;
  onClose: () => void;
  onSave: (profile: RestaurantProfile) => void;
}

export function EditRestaurantProfileModal({
  open,
  settings,
  profile,
  onClose,
  onSave,
}: EditRestaurantProfileModalProps) {
  const hotelNameId = useId();
  const businessEmailId = useId();
  const businessTypeId = useId();
  const businessLocationId = useId();
  const businessAddressId = useId();
  const kitchenOpenTimeId = useId();
  const kitchenCloseTimeId = useId();
  const taxRateId = useId();
  const serviceChargeRateId = useId();
  const discountRateId = useId();
  const [form, setForm] = useState<RestaurantProfile>(profile);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);
  const previewObjectUrlRef = useRef<string | null>(null);
  const fileInputId = useId();

  useEffect(() => {
    if (!open) {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }

      setSelectedImageFile(null);
      return;
    }

    setForm(profile);
    setSelectedImageFile(null);
    setStatusMessage("");
    setStatusType("success");
  }, [open, profile]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  if (!open) {
    return null;
  }

  function handleSelectFile(file: File | null) {
    if (!file) {
      setSelectedImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSelectedImageFile(null);
      setStatusType("error");
      setStatusMessage("Please select a valid image file.");
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = nextUrl;
    setSelectedImageFile(file);
    setStatusMessage("");
    setStatusType("success");
    setForm((current) => ({ ...current, restaurantImageUrl: nextUrl }));
  }

  async function handleSave() {
    setIsSaving(true);
    setStatusMessage("");
    setStatusType("success");

    try {
      const savedProfile = await updateRestaurantProfile(form);
      const nextProfile = selectedImageFile
        ? await uploadRestaurantImage(selectedImageFile)
        : savedProfile;

      onSave(nextProfile);
      setForm(nextProfile);
      setSelectedImageFile(null);
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
      setStatusType("success");
      setStatusMessage("Restaurant profile updated successfully.");
    } catch {
      setStatusType("error");
      setStatusMessage("Unable to save restaurant profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/65 px-6 py-8 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-restaurant-profile-title"
        className={cn(
          "w-full max-w-202.5 overflow-hidden rounded-3xl border",
          getManagerModalSurfaceClasses(settings.scheme),
        )}
      >
        <div className="flex max-h-[calc(100vh-80px)] flex-col overflow-hidden rounded-3xl">
          <div
            className={cn(
              "flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5",
              settings.scheme === "dark"
                ? "border-white/10 bg-slate-900/72"
                : "border-slate-200 bg-slate-50/85",
            )}
          >
            <div className="min-w-0">
              <h2 id="edit-restaurant-profile-title" className={getManagerModalTitleClasses()}>
                Edit Restaurant Profile
              </h2>
              <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
                Update the restaurant details shown in sidebar, customer QR page, and receipts.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={getManagerIconButtonClasses(settings.scheme, true)}
              aria-label="Close Edit Restaurant Profile"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className={cn("min-h-0 overflow-y-auto px-6 py-6", settings.scheme === "dark" ? "bg-slate-950/98" : "bg-white/98")}>
            <div className="relative h-40 overflow-hidden rounded-[22px] border border-blue-400/20">
              <RestaurantProfileImage
                src={form.restaurantImageUrl}
                alt={form.hotelName || "Restaurant profile image"}
                className="h-full w-full"
                eager
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/18 via-transparent to-transparent" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={hotelNameId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Business / Hotel name
                </label>
                <input
                  id={hotelNameId}
                  value={form.hotelName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, hotelName: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={businessEmailId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Business email
                </label>
                <input
                  id={businessEmailId}
                  type="email"
                  value={form.businessEmail}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, businessEmail: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={businessTypeId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Business type
                </label>
                <input
                  id={businessTypeId}
                  value={form.businessType}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, businessType: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={businessLocationId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Location
                </label>
                <input
                  id={businessLocationId}
                  value={form.businessLocation}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, businessLocation: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor={businessAddressId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                Address
              </label>
              <input
                id={businessAddressId}
                value={form.businessAddress}
                onChange={(event) =>
                  setForm((current) => ({ ...current, businessAddress: event.target.value }))
                }
                className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={kitchenOpenTimeId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Kitchen open time
                </label>
                <input
                  id={kitchenOpenTimeId}
                  value={form.kitchenOpenTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, kitchenOpenTime: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={kitchenCloseTimeId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Kitchen close time
                </label>
                <input
                  id={kitchenCloseTimeId}
                  value={form.kitchenCloseTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, kitchenCloseTime: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor={taxRateId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Tax percentage
                </label>
                <input
                  id={taxRateId}
                  type="number"
                  value={form.taxRate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, taxRate: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={serviceChargeRateId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Service charge percentage
                </label>
                <input
                  id={serviceChargeRateId}
                  type="number"
                  value={form.serviceChargeRate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, serviceChargeRate: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={discountRateId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Discount percentage
                </label>
                <input
                  id={discountRateId}
                  type="number"
                  value={form.discountRate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, discountRate: event.target.value }))
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className={cn("mb-2", getManagerLabelClasses(settings.scheme))}>Upload Image</div>
              <label
                htmlFor={fileInputId}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-[20px] border border-dashed px-4 py-4 transition-all duration-200 ease-out sm:flex-row sm:items-center",
                  settings.scheme === "dark"
                    ? "border-blue-400/30 bg-slate-950/30 hover:border-blue-400/50 hover:bg-white/3"
                    : "border-blue-300/70 bg-slate-50/70 hover:border-blue-400 hover:bg-white",
                )}
              >
                <span className={cn(getSettingsGhostButtonClasses(settings.scheme), "w-fit")}>
                  <UploadIcon className="size-4" />
                  Choose Image
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-[15px] font-semibold", settings.scheme === "dark" ? "text-slate-100" : "text-slate-900")}>
                    Choose a restaurant image
                  </span>
                  <span className={cn("mt-1 block text-[14px] leading-6", settings.scheme === "dark" ? "text-slate-400" : "text-slate-500")}>
                    Click to browse an image file. The preview updates immediately.
                  </span>
                </span>
              </label>
              <input
                id={fileInputId}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)}
              />
            </div>

            {isSaving ? (
              <p className={cn("mt-4 text-sm", getManagerLabelClasses(settings.scheme))}>
                Uploading restaurant image and saving profile...
              </p>
            ) : null}

            {statusType === "error" ? (
              <div className="mt-4">
                <ErrorMessage message={statusMessage} />
              </div>
            ) : statusMessage ? (
              <p className="mt-4 text-sm text-emerald-400">{statusMessage}</p>
            ) : null}
          </div>

          <div
            className={cn(
              "flex shrink-0 justify-end gap-3 border-t px-6 py-5",
              settings.scheme === "dark"
                ? "border-white/10 bg-slate-900/72"
                : "border-slate-200 bg-slate-50/85",
            )}
          >
            <button type="button" onClick={onClose} className={getSettingsGhostButtonClasses(settings.scheme)}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-5 text-[14px]")}
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
