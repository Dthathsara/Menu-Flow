"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
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
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [previewSrc, setPreviewSrc] = useState(profile.imageSrc);
  const previewObjectUrlRef = useRef<string | null>(null);
  const fileInputId = useId();
  const isBlobPreview = previewSrc.startsWith("blob:");

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setName(profile.name);
      setLocation(profile.location);
      setPreviewSrc(profile.imageSrc);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
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
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = nextUrl;
    setPreviewSrc(nextUrl);
  }

  function handleSave() {
    onSave({
      name,
      location,
      imageSrc: previewSrc,
    });
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 px-6 py-8 backdrop-blur-md"
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
          "w-full max-w-[810px] overflow-hidden rounded-[24px] border",
          getManagerModalSurfaceClasses(settings.scheme),
        )}
      >
        <div className="flex max-h-[calc(100vh-80px)] flex-col overflow-hidden rounded-[24px]">
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
            <div className="relative h-[160px] overflow-hidden rounded-[22px] border border-blue-400/20">
              <Image
                src={previewSrc}
                alt={name}
                fill
                sizes="(max-width: 820px) 100vw, 760px"
                className="object-cover"
                unoptimized={isBlobPreview}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="settings-restaurant-name" className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Restaurant Name
                </label>
                <input
                  id="settings-restaurant-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={cn(getManagerTextInputClasses(settings.scheme), "h-10 rounded-[14px]")}
                />
              </div>
              <div>
                <label htmlFor="settings-restaurant-location" className={cn("mb-2 block", getManagerLabelClasses(settings.scheme))}>
                  Location
                </label>
                <input
                  id="settings-restaurant-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
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
                    ? "border-blue-400/30 bg-slate-950/30 hover:border-blue-400/50 hover:bg-white/[0.03]"
                    : "border-blue-300/70 bg-slate-50/70 hover:border-blue-400 hover:bg-white",
                )}
              >
                <span className={cn(getSettingsGhostButtonClasses(settings.scheme), "w-fit")}>
                  <UploadIcon className="size-4" />
                  Upload Image
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-[15px] font-semibold", settings.scheme === "dark" ? "text-slate-100" : "text-slate-900")}>
                    Choose a banner image
                  </span>
                  <span className={cn("mt-1 block text-[14px] leading-6", settings.scheme === "dark" ? "text-slate-400" : "text-slate-500")}>
                    Drag and drop an image here, or click to browse. Max 2MB.
                  </span>
                </span>
              </label>
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)}
              />
            </div>
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
              className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-5 text-[14px]")}
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
