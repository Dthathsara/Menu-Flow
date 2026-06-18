"use client";

import Image from "next/image";
import { useId } from "react";
import { getSafeImageSrc } from "@/lib/image-url";
import { ImageIcon, UploadIcon } from "../icons";
import { getManagerBodyTextClasses, getManagerLabelClasses } from "../managerUtils";
import type { Scheme } from "../managerTypes";
interface ImageUploadFieldProps {
  preview: string;
  scheme: Scheme;
  onChange: (file: File | null) => void;
}

export function ImageUploadField({
  preview,
  scheme,
  onChange,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const safePreview = getSafeImageSrc(preview);
  const focusClasses =
    scheme === "dark"
      ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061533]"
      : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]";

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={getManagerLabelClasses(scheme)}>
        Item Image
      </label>

      <label
        htmlFor={inputId}
        className={`group/upload flex cursor-pointer flex-col gap-4 rounded-md border-2 border-dashed p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 ${
          scheme === "dark"
            ? "border-white/10 bg-[#0B1A3A] hover:border-blue-400/55 hover:bg-[#102145]"
            : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/70"
        } ${focusClasses}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className={`relative h-28 w-full overflow-hidden rounded-md border sm:w-36 ${
              scheme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-slate-100"
            }`}
          >
            {preview?.trim() ? (
              <Image
                src={safePreview}
                alt="Menu item preview"
                fill
                unoptimized
                sizes="144px"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full flex-col items-center justify-center gap-2 text-center text-xs ${
                  scheme === "dark" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                <ImageIcon className="size-5" />
                <span>No image selected</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div
              className={`flex items-center gap-2 text-[15px] font-semibold ${
                scheme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white transition-all duration-200 ease-out group-hover/upload:scale-[1.03]">
                <UploadIcon className="size-4" />
              </span>
              Upload a replacement image
            </div>
            <p
              className={`${scheme === "dark" ? "mt-2 text-slate-300" : "mt-2 text-slate-500"} ${getManagerBodyTextClasses(scheme)}`}
            >
              PNG, JPG, JPEG, or WEBP up to 10MB. The existing preview stays until you save a new file.
            </p>
            <div
              className={`mt-3 inline-flex items-center gap-2 text-xs font-medium ${
                scheme === "dark" ? "text-slate-300" : "text-slate-500"
              }`}
            >
              <ImageIcon className="size-4" />
              4:3 or square images work best for table thumbnails.
            </div>
          </div>
        </div>

        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpg,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
