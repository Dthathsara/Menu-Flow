"use client";

import { useState } from "react";
import type { ManagerSettings } from "../managerTypes";
import { DeleteMenuItemDialog } from "./DeleteMenuItemDialog";
import { ManageMenuTable } from "./ManageMenuTable";
import { ManageMenuToolbar } from "./ManageMenuToolbar";
import { MenuItemModal } from "./MenuItemModal";
import { INITIAL_MENU_ITEMS } from "./mockData";
import { FILTER_CATEGORIES, MENU_CATEGORIES } from "./types";
import type { MenuItemFormValues, MenuFilterCategory, MenuItemRecord } from "./types";

interface ManageMenuPageProps {
  settings: ManagerSettings;
}

function createMenuItemFromValues(
  values: MenuItemFormValues,
  currentItem?: MenuItemRecord | null,
) {
  const id =
    currentItem?.id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `menu-${Date.now()}`);

  return {
    id,
    name: values.name.trim(),
    category: values.category,
    description: values.description.trim(),
    prices: {
      small: Number(values.smallPrice),
      medium: Number(values.mediumPrice),
      large: Number(values.largePrice),
    },
    image: values.image || currentItem?.image || INITIAL_MENU_ITEMS[0].image,
    available: values.available,
    prepTime: Number(values.prepTime),
    sku: values.sku.trim() || `SKU-${id.slice(-4).toUpperCase()}`,
  } satisfies MenuItemRecord;
}

export function ManageMenuPage({ settings }: ManageMenuPageProps) {
  const [items, setItems] = useState<MenuItemRecord[]>(INITIAL_MENU_ITEMS);
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState<MenuFilterCategory>("All Categories");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemRecord | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<MenuItemRecord | null>(null);

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch);
    const matchesCategory = category === "All Categories" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  function openAddModal() {
    setSelectedItem(null);
    setModalMode("add");
  }

  function openEditModal(item: MenuItemRecord) {
    setSelectedItem(item);
    setModalMode("edit");
  }

  function handleSaveItem(values: MenuItemFormValues) {
    const nextItem = createMenuItemFromValues(values, selectedItem);

    setItems((current) =>
      modalMode === "edit"
        ? current.map((item) => (item.id === nextItem.id ? nextItem : item))
        : [nextItem, ...current],
    );

    setModalMode(null);
    setSelectedItem(null);
  }

  return (
    <>
      <section className="relative z-0 space-y-6">
        <ManageMenuToolbar
          settings={settings}
          onAddItem={openAddModal}
        />

        <ManageMenuTable
          items={filteredItems}
          settings={settings}
          searchValue={searchValue}
          category={category}
          categories={FILTER_CATEGORIES}
          resultCount={filteredItems.length}
          onSearchChange={setSearchValue}
          onCategoryChange={setCategory}
          onEdit={openEditModal}
          onRemove={setItemPendingDelete}
        />
      </section>

      {modalMode ? (
        <MenuItemModal
          key={`${modalMode}-${selectedItem?.id ?? "new"}`}
          mode={modalMode}
          settings={settings}
          categories={MENU_CATEGORIES}
          item={selectedItem}
          onClose={() => {
            setModalMode(null);
            setSelectedItem(null);
          }}
          onSave={handleSaveItem}
        />
      ) : null}

      <DeleteMenuItemDialog
        open={Boolean(itemPendingDelete)}
        settings={settings}
        itemName={itemPendingDelete?.name}
        onClose={() => setItemPendingDelete(null)}
        onConfirm={() => {
          if (!itemPendingDelete) {
            return;
          }

          setItems((current) => current.filter((item) => item.id !== itemPendingDelete.id));
          setItemPendingDelete(null);
        }}
      />
    </>
  );
}
