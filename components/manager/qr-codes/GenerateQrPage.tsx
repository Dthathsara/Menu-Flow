"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  createManagerQrCode,
  deleteManagerQrCode,
  fetchManagerQrCodes,
  fetchManagerQrSections,
} from "@/lib/manager-qr-api";
import type { ManagerSettings } from "../managerTypes";
import { cn, getManagerPageSectionClasses, getManagerSecondaryButtonClasses } from "../managerUtils";
import { GenerateQrHero } from "./GenerateQrHero";
import { GenerateQrModal } from "./GenerateQrModal";
import { QrLibrarySection } from "./QrLibrarySection";
import { downloadQrSvg } from "./qr-renderer";
import type { GenerateQrFormValues, QrCodeRecord } from "./types";

interface GenerateQrPageProps {
  settings: ManagerSettings;
}

export function GenerateQrPage({ settings }: GenerateQrPageProps) {
  const [items, setItems] = useState<QrCodeRecord[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  const loadQrData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    setDeleteErrorMessage("");

    const [qrResult, sectionResult] = await Promise.allSettled([
      fetchManagerQrCodes(),
      fetchManagerQrSections(),
    ]);

    if (qrResult.status === "fulfilled") {
      setItems(qrResult.value);
    } else {
      setErrorMessage(getQrErrorMessage(qrResult.reason, "Unable to load QR codes."));
    }

    if (sectionResult.status === "fulfilled") {
      setSections(sectionResult.value);
    } else if (qrResult.status === "fulfilled") {
      setSections(getSectionsFromItems(qrResult.value));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadQrData();
  }, [loadQrData]);

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [item.tableNumber, item.section, item.customerUrl].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      const matchesSection =
        selectedSection === "All Sections" || item.section === selectedSection;

      return matchesSearch && matchesSection;
    });
  }, [items, normalizedSearch, selectedSection]);

  const sectionOptions = useMemo(
    () => mergeSections(sections, getSectionsFromItems(items)),
    [items, sections],
  );

  useEffect(() => {
    if (
      selectedSection !== "All Sections" &&
      !sectionOptions.includes(selectedSection)
    ) {
      setSelectedSection("All Sections");
    }
  }, [sectionOptions, selectedSection]);

  function getQrFileName(item: QrCodeRecord) {
    const table = slugifyFilePart(item.tableNumber || "table");
    const section = slugifyFilePart(item.section || "section");

    return `menuflow-table-${table}-${section}-qr.svg`;
  }

  async function handleDownloadRecord(item: QrCodeRecord) {
    await downloadQrSvg(
      item.customerUrl,
      `QR code for table ${item.tableNumber}`,
      getQrFileName(item),
    );
  }

  function handleDownloadAll() {
    items.forEach((item, index) => {
      window.setTimeout(() => {
        void handleDownloadRecord(item);
      }, index * 140);
    });
  }

  async function handleGenerate(values: GenerateQrFormValues) {
    const tableNumber = values.tableNumber.trim();
    const section = values.section.trim();

    if (!tableNumber || !section) {
      setModalErrorMessage("Table number and section are required.");
      return false;
    }

    setIsGenerating(true);
    setModalErrorMessage("");

    try {
      const nextItem = await createManagerQrCode({ tableNumber, section });

      if (!nextItem) {
        setModalErrorMessage("Unable to generate QR code. Please try again.");
        return false;
      }

      setItems((current) => [nextItem, ...current.filter((item) => item.id !== nextItem.id)]);
      setSections((current) => mergeSections(current, [nextItem.section]));
      setDeleteErrorMessage("");
      return true;
    } catch (error) {
      setModalErrorMessage(getQrErrorMessage(error, "Unable to generate QR code."));
      return false;
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(item: QrCodeRecord) {
    setDeleteErrorMessage("");

    try {
      await deleteManagerQrCode(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      setDeleteErrorMessage(getQrErrorMessage(error, "Unable to delete QR code."));
    }
  }

  return (
    <>
      <section
        className={getManagerPageSectionClasses()}
        data-manager-scheme={settings.scheme}
      >
        <GenerateQrHero
          settings={settings}
          onDownloadAll={handleDownloadAll}
          onGenerate={() => setIsModalOpen(true)}
        />

        {errorMessage ? (
          <div className="mt-4 rounded-[18px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-200">
            <div>{errorMessage}</div>
            <button
              type="button"
              onClick={() => void loadQrData()}
              className={cn(
                getManagerSecondaryButtonClasses(settings.scheme),
                "mt-3 h-10 rounded-[12px] px-4 text-[13px]",
              )}
            >
              Retry
            </button>
          </div>
        ) : null}

        {deleteErrorMessage ? (
          <div className="mt-4 rounded-[18px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-200">
            {deleteErrorMessage}
          </div>
        ) : null}

        <QrLibrarySection
          settings={settings}
          items={filteredItems}
          isLoading={isLoading}
          searchValue={searchValue}
          selectedSection={selectedSection}
          sections={sectionOptions}
          onSearchChange={setSearchValue}
          onSectionChange={setSelectedSection}
          onDownload={(item) => {
            void handleDownloadRecord(item);
          }}
          onDelete={(item) => {
            void handleDelete(item);
          }}
        />
      </section>

      {isModalOpen ? (
        <GenerateQrModal
          settings={settings}
          onClose={() => setIsModalOpen(false)}
          isSubmitting={isGenerating}
          errorMessage={modalErrorMessage}
          sections={sectionOptions}
          onSubmit={handleGenerate}
        />
      ) : null}
    </>
  );
}

function getSectionsFromItems(items: readonly QrCodeRecord[]) {
  return items.map((item) => item.section.trim()).filter(Boolean);
}

function mergeSections(...sectionLists: readonly string[][]) {
  const sectionMap = new Map<string, string>();

  for (const section of sectionLists.flat()) {
    const trimmedSection = section.trim();

    if (trimmedSection) {
      sectionMap.set(trimmedSection.toLowerCase(), trimmedSection);
    }
  }

  return Array.from(sectionMap.values()).sort((a, b) => a.localeCompare(b));
}

function slugifyFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getQrErrorMessage(error: unknown, fallback: string) {
  const message = getApiErrorMessage(error, fallback);

  if (!axios.isAxiosError(error)) {
    return message;
  }

  if (!error.response) {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  if (error.response.status === 409) {
    return message || "A QR code already exists for this table and section.";
  }

  return message;
}
