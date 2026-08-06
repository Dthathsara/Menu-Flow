"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ErrorMessage } from "@/components/common/ui/ErrorMessage";
import {
  fetchRestaurantProfile,
  getRestaurantProfileSaveErrorMessage,
  updateRestaurantProfile,
  uploadRestaurantImage,
  validateRestaurantImageFile,
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
  const restaurantNameId = useId();
  const businessEmailId = useId();
  const phoneId = useId();
  const websiteId = useId();
  const descriptionId = useId();
  const businessTypeId = useId();
  const locationId = useId();
  const addressId = useId();
  const openingTimeId = useId();
  const closingTimeId = useId();
  const taxPercentageId = useId();
  const serviceChargePercentageId = useId();
  const discountPercentageId = useId();
  const [form, setForm] = useState<RestaurantProfile>(profile);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const previewObjectUrlRef = useRef<string | null>(null);
  const selectedImageSignatureRef = useRef("");
  const submitInFlightRef = useRef(false);
  const fileInputId = useId();
  const isSaving = saveState === "saving";

  useEffect(() => {
    if (!open) {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }

      setSelectedImageFile(null);
      selectedImageSignatureRef.current = "";
      return;
    }

    setForm(profile);
    setSelectedImageFile(null);
    selectedImageSignatureRef.current = "";
    setStatusMessage("");
    setStatusType("success");
    setSaveState("idle");
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
      selectedImageSignatureRef.current = "";
      return;
    }

    const validationMessage = validateRestaurantImageFile(file);

    if (validationMessage) {
      setSelectedImageFile(null);
      selectedImageSignatureRef.current = "";
      setStatusType("error");
      setStatusMessage(validationMessage);
      return;
    }

    const nextSignature = getFileSignature(file);

    if (selectedImageSignatureRef.current === nextSignature) {
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = nextUrl;
    setSelectedImageFile(file);
    selectedImageSignatureRef.current = nextSignature;
    setStatusMessage("");
    setStatusType("success");
    setSaveState("idle");
    setForm((current) => ({ ...current, restaurantImageUrl: nextUrl }));
  }

  function updateForm(nextProfile: RestaurantProfile) {
    setSaveState("idle");
    setForm(nextProfile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving || submitInFlightRef.current) {
      return;
    }

    submitInFlightRef.current = true;
    setSaveState("saving");
    setStatusMessage("");
    setStatusType("success");

    try {
      const profileForDetails = selectedImageFile
        ? { ...form, restaurantImageUrl: profile.restaurantImageUrl }
        : form;
      let nextProfile = await updateRestaurantProfile(profileForDetails, profile);
      let imageUploadFailed = false;
      let imageUploadErrorMessage = "";

      if (selectedImageFile) {
        try {
          nextProfile = await uploadRestaurantImage(selectedImageFile);
        } catch (error) {
          imageUploadFailed = true;
          imageUploadErrorMessage = getRestaurantProfileSaveErrorMessage(error);
        }
      }

      try {
        nextProfile = await fetchRestaurantProfile();
      } catch {
        // Keep the successful PATCH response visible if the refresh request fails.
      }

      onSave(nextProfile);
      setForm(nextProfile);

      if (!imageUploadFailed) {
        setSelectedImageFile(null);
        selectedImageSignatureRef.current = "";
        if (previewObjectUrlRef.current) {
          URL.revokeObjectURL(previewObjectUrlRef.current);
          previewObjectUrlRef.current = null;
        }
      }

      if (imageUploadFailed) {
        setSaveState("idle");
        setStatusType("error");
        setStatusMessage(
          `Profile details were saved, but the image upload failed. ${imageUploadErrorMessage}`,
        );
        return;
      }

      setSaveState("saved");
      setStatusType("success");
      setStatusMessage("Restaurant profile updated successfully.");
      window.setTimeout(() => {
        setSaveState((current) => (current === "saved" ? "idle" : current));
      }, 1800);
    } catch (error) {
      setSaveState("idle");
      setStatusType("error");
      setStatusMessage(getRestaurantProfileSaveErrorMessage(error));
    } finally {
      submitInFlightRef.current = false;
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
        <form
          className="flex max-h-[calc(100vh-80px)] flex-col overflow-hidden rounded-3xl"
          noValidate
          onSubmit={handleSubmit}
        >
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
                alt={form.restaurantName || "Restaurant profile image"}
                className="h-full w-full"
                eager
                highPriority
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/18 via-transparent to-transparent" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={restaurantNameId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Restaurant name
                </label>
                <input
                  id={restaurantNameId}
                  value={form.restaurantName}
                  onChange={(event) =>
                    updateForm({ ...form, restaurantName: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={businessEmailId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Email
                </label>
                <input
                  id={businessEmailId}
                  type="email"
                  value={form.businessEmail ?? ""}
                  onChange={(event) =>
                    updateForm({ ...form, businessEmail: event.target.value })
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
                  value={form.businessType ?? ""}
                  onChange={(event) =>
                    updateForm({ ...form, businessType: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={locationId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Location
                </label>
                <input
                  id={locationId}
                  value={form.location}
                  onChange={(event) =>
                    updateForm({ ...form, location: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={phoneId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Phone
                </label>
                <input
                  id={phoneId}
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateForm({ ...form, phone: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={websiteId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Website
                </label>
                <input
                  id={websiteId}
                  type="url"
                  value={form.website}
                  onChange={(event) =>
                    updateForm({ ...form, website: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor={addressId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                Address
              </label>
              <input
                id={addressId}
                value={form.address}
                onChange={(event) =>
                  updateForm({ ...form, address: event.target.value })
                }
                className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
              />
            </div>

            <div className="mt-4">
              <label htmlFor={descriptionId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                Description
              </label>
              <textarea
                id={descriptionId}
                value={form.description}
                onChange={(event) =>
                  updateForm({ ...form, description: event.target.value })
                }
                className={cn(getManagerTextInputClasses(settings.scheme, { multiline: true }), "rounded-[14px]")}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={openingTimeId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Opening time
                </label>
                <input
                  id={openingTimeId}
                  value={form.openingTime}
                  onChange={(event) =>
                    updateForm({ ...form, openingTime: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={closingTimeId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Closing time
                </label>
                <input
                  id={closingTimeId}
                  value={form.closingTime}
                  onChange={(event) =>
                    updateForm({ ...form, closingTime: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor={taxPercentageId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Tax percentage
                </label>
                <input
                  id={taxPercentageId}
                  type="number"
                  value={form.taxPercentage}
                  onChange={(event) =>
                    updateForm({ ...form, taxPercentage: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={serviceChargePercentageId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Service charge percentage
                </label>
                <input
                  id={serviceChargePercentageId}
                  type="number"
                  value={form.serviceChargePercentage}
                  onChange={(event) =>
                    updateForm({ ...form, serviceChargePercentage: event.target.value })
                  }
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor={discountPercentageId} className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Discount percentage
                </label>
                <input
                  id={discountPercentageId}
                  type="number"
                  value={form.discountPercentage}
                  onChange={(event) =>
                    updateForm({ ...form, discountPercentage: event.target.value })
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
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="sr-only"
                onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)}
              />
            </div>

            {isSaving ? (
              <p className={cn("mt-4 text-sm", getManagerLabelClasses(settings.scheme))}>
                Saving restaurant profile...
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
              type="submit"
              disabled={isSaving}
              className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-5 text-[14px]")}
            >
              {saveState === "saving"
                ? "Saving..."
                : saveState === "saved"
                  ? "Saved successfully"
                  : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function getFileSignature(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}
