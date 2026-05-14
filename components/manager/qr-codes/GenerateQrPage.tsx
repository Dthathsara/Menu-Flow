"use client";

import { useState } from "react";
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

export function GenerateQrPage({ settings }: GenerateQrPageProps) {
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
  });

  async function handleDownloadRecord(item: QrCodeRecord) {
    await downloadQrSvg(
      item.qrValue,
      `QR code for table ${item.tableNumber}`,
      `menuflow-${item.tableNumber.toLowerCase()}-qr.svg`,
    );
  }

  function handleDownloadAll() {
    items.forEach((item, index) => {
      window.setTimeout(() => {
        void handleDownloadRecord(item);
      }, index * 140);
    });
  }

  function handleGenerate(values: GenerateQrFormValues) {
    const nextItem = createQrCodeRecord(values);
    setItems((current) => [nextItem, ...current]);
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
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onDownload={(item) => {
            void handleDownloadRecord(item);
          }}
          onDelete={(item) => {
            setItems((current) => current.filter((entry) => entry.id !== item.id));
          }}
        />
      </section>

      {isModalOpen ? (
        <GenerateQrModal
          settings={settings}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleGenerate}
        />
      ) : null}
    </>
  );
}
