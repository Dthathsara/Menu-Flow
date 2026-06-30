"use client";

<<<<<<< HEAD
import { useState } from "react";
=======
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  createQrCode,
  deleteQrCode,
  fetchQrCodes,
  fetchQrSections,
  fetchQrTableNumbers,
} from "@/lib/manager-qr-api";
>>>>>>> Dulnith
import type { ManagerSettings } from "../managerTypes";
import { getManagerPageSectionClasses } from "../managerUtils";
import { GenerateQrHero } from "./GenerateQrHero";
import { GenerateQrModal } from "./GenerateQrModal";
import { INITIAL_QR_CODES, createQrCodeRecord } from "./qr-data";
import { QrLibrarySection } from "./QrLibrarySection";
import { downloadQrSvg } from "./qr-renderer";
import type { GenerateQrFormValues, QrCodeRecord } from "./types";

interface GenerateQrPageProps {
  settings: ManagerSettings;
}

const ALL_SECTIONS_LABEL = "All Sections";

function getQrErrorMessage(error: unknown, fallback: string) {
  const message = getApiErrorMessage(error, fallback);

  if (axios.isAxiosError(error) && !error.response) {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  if (axios.isAxiosError(error) && error.response?.status === 409) {
    return "A QR code already exists for this table and section.";
  }

  if (message === "Unable to connect to the server. Please check your internet connection.") {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  return message;
}

function slugifyFilePart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "table"
  );
}

function getDistinctSections(items: readonly QrCodeRecord[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.section.trim())
        .filter((section) => section.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function GenerateQrPage({ settings }: GenerateQrPageProps) {
<<<<<<< HEAD
  const [items, setItems] = useState<QrCodeRecord[]>(INITIAL_QR_CODES);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    if (!normalizedSearch) {
      return true;
    }

    return [item.tableNumber, item.section, item.branch].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );
=======
  const [items, setItems] = useState<QrCodeRecord[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [tableNumbers, setTableNumbers] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedSection, setSelectedSection] = useState(ALL_SECTIONS_LABEL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadQrData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    setDeleteErrorMessage("");

    const [qrResult, sectionResult, tableNumberResult] = await Promise.allSettled([
      fetchQrCodes(),
      fetchQrSections(),
      fetchQrTableNumbers(),
    ]);

    const nextItems = qrResult.status === "fulfilled" ? qrResult.value : [];
    const nextSections =
      sectionResult.status === "fulfilled" && sectionResult.value.length
        ? sectionResult.value
        : getDistinctSections(nextItems);

    setItems(nextItems);
    setSections(nextSections);
    setTableNumbers(
      tableNumberResult.status === "fulfilled" && tableNumberResult.value.length
        ? tableNumberResult.value
        : getDistinctTableNumbers(nextItems),
    );
    setSelectedSection((current) =>
      current !== ALL_SECTIONS_LABEL && !nextSections.includes(current)
        ? ALL_SECTIONS_LABEL
        : current,
    );

    if (qrResult.status === "rejected") {
      setErrorMessage(getQrErrorMessage(qrResult.reason, "Unable to load QR codes."));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadQrData();
  }, [loadQrData]);

  const sectionOptions = useMemo(
    () => [ALL_SECTIONS_LABEL, ...sections],
    [sections],
  );

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      [item.tableNumber, item.section, item.customerUrl].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    const matchesSection =
      selectedSection === ALL_SECTIONS_LABEL || item.section === selectedSection;

    return matchesSearch && matchesSection;
>>>>>>> Dulnith
  });

  async function handleDownloadRecord(item: QrCodeRecord) {
    await downloadQrSvg(
      item.qrValue,
      `QR code for table ${item.tableNumber}`,
<<<<<<< HEAD
      `menuflow-${item.tableNumber.toLowerCase()}-qr.svg`,
=======
      `menuflow-table-${slugifyFilePart(item.tableNumber)}-${slugifyFilePart(item.section)}-qr.svg`,
>>>>>>> Dulnith
    );
  }

  function handleDownloadAll() {
    items.forEach((item, index) => {
      window.setTimeout(() => {
        void handleDownloadRecord(item);
      }, index * 140);
    });
  }

<<<<<<< HEAD
  function handleGenerate(values: GenerateQrFormValues) {
    const nextItem = createQrCodeRecord(values);
    setItems((current) => [nextItem, ...current]);
=======
  async function handleGenerate(values: GenerateQrFormValues) {
    const normalizedTableNumber = normalizeTableNumberInput(values.tableNumber);

    if (!normalizedTableNumber) {
      setModalErrorMessage("Please enter a valid table number.");
      return;
    }

    if (!values.section.trim()) {
      setModalErrorMessage("Table number and section are required.");
      return;
    }

    setIsGenerating(true);
    setModalErrorMessage("");

    try {
      const nextItem = await createQrCode({
        ...values,
        tableNumber: normalizedTableNumber,
      });

      if (!nextItem) {
        setModalErrorMessage("Unable to generate QR code.");
        return;
      }

      setItems((current) => [nextItem, ...current]);
      setSections((current) =>
        current.includes(nextItem.section)
          ? current
          : [...current, nextItem.section].sort((a, b) => a.localeCompare(b)),
      );
      setTableNumbers((current) =>
        current.includes(nextItem.tableNumber)
          ? current
          : [...current, nextItem.tableNumber].sort((a, b) => a.localeCompare(b)),
      );
      setIsModalOpen(false);
    } catch (error) {
      setModalErrorMessage(getQrErrorMessage(error, "Unable to generate QR code."));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(item: QrCodeRecord) {
    setDeletingId(item.id);
    setDeleteErrorMessage("");

    try {
      await deleteQrCode(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      setDeleteErrorMessage(getQrErrorMessage(error, "Unable to delete QR code."));
    } finally {
      setDeletingId("");
    }
>>>>>>> Dulnith
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

        <QrLibrarySection
          settings={settings}
          items={filteredItems}
<<<<<<< HEAD
          searchValue={searchValue}
          onSearchChange={setSearchValue}
=======
          totalItemCount={items.length}
          searchValue={searchValue}
          sectionValue={selectedSection}
          sectionOptions={sectionOptions}
          isLoading={isLoading}
          errorMessage={errorMessage || deleteErrorMessage}
          onSearchChange={setSearchValue}
          onSectionChange={setSelectedSection}
          onRetry={loadQrData}
>>>>>>> Dulnith
          onDownload={(item) => {
            void handleDownloadRecord(item);
          }}
          onDelete={(item) => {
            setItems((current) => current.filter((entry) => entry.id !== item.id));
          }}
          deletingId={deletingId}
        />
      </section>

      {isModalOpen ? (
        <GenerateQrModal
          settings={settings}
<<<<<<< HEAD
          onClose={() => setIsModalOpen(false)}
=======
          sectionSuggestions={sections}
          tableNumberSuggestions={tableNumbers}
          isSubmitting={isGenerating}
          errorMessage={modalErrorMessage}
          onClose={() => {
            if (isGenerating) {
              return;
            }

            setIsModalOpen(false);
            setModalErrorMessage("");
          }}
>>>>>>> Dulnith
          onSubmit={handleGenerate}
        />
      ) : null}
    </>
  );
}
<<<<<<< HEAD
=======

function getDistinctTableNumbers(items: readonly QrCodeRecord[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.tableNumber.trim())
        .filter((tableNumber) => tableNumber.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function normalizeTableNumberInput(input: string): string {
  const match = input.match(/\d+/);

  if (!match) {
    return "";
  }

  return `T - ${match[0].padStart(2, "0")}`;
}
>>>>>>> Dulnith
