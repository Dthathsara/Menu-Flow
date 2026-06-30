"use client";

<<<<<<< HEAD
import { useState } from "react";
=======
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  createMenuItem,
  deleteMenuItem,
  fetchMenuCategories,
  fetchMenuItems,
  fetchMenuSubCategories,
  updateMenuItem,
} from "@/lib/manager-menu-api";
>>>>>>> Dulnith
import { getManagerPageSectionClasses } from "../managerUtils";
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
<<<<<<< HEAD
    prices: {
      small: Number(values.smallPrice),
      medium: Number(values.mediumPrice),
      large: Number(values.largePrice),
    },
    image: values.image || currentItem?.image || INITIAL_MENU_ITEMS[0].image,
=======
    smallPrice,
    mediumPrice,
    largePrice,
    imageUrl: values.image,
    image: values.image,
>>>>>>> Dulnith
    available: values.available,
    prepTime: Number(values.prepTime),
    sku: values.sku.trim() || `SKU-${id.slice(-4).toUpperCase()}`,
  } satisfies MenuItemRecord;
}

<<<<<<< HEAD
export function ManageMenuPage({ settings }: ManageMenuPageProps) {
  const [items, setItems] = useState<MenuItemRecord[]>(INITIAL_MENU_ITEMS);
=======
function getDistinctCategoryNames(items: readonly MenuItemRecord[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.categoryName.trim())
        .filter((categoryName) => categoryName.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function getDistinctSubCategoryNames(items: readonly MenuItemRecord[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.subCategoryName?.trim() ?? "")
        .filter((subCategoryName) => subCategoryName.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function ManageMenuPage({ settings }: ManageMenuPageProps) {
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
>>>>>>> Dulnith
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState<MenuFilterCategory>("All Categories");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemRecord | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<MenuItemRecord | null>(null);

<<<<<<< HEAD
=======
  const loadMenuData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    setCategoryErrorMessage("");

    const [categoryResult, subCategoryResult, itemResult] = await Promise.allSettled([
      fetchMenuCategories(),
      fetchMenuSubCategories(),
      fetchMenuItems(),
    ]);

    const nextItems = itemResult.status === "fulfilled" ? itemResult.value : [];
    const endpointCategories =
      categoryResult.status === "fulfilled"
        ? categoryResult.value.map((entry) => entry.name.trim()).filter(Boolean)
        : [];
    const nextCategories = endpointCategories.length
      ? endpointCategories
      : getDistinctCategoryNames(nextItems);
    const endpointSubCategories =
      subCategoryResult.status === "fulfilled" ? subCategoryResult.value : [];
    const nextSubCategories = endpointSubCategories.length
      ? endpointSubCategories
      : getDistinctSubCategoryNames(nextItems);

    setCategories(nextCategories);
    setSubCategories(nextSubCategories);
    setCategory((currentCategory) =>
      currentCategory !== ALL_CATEGORIES_LABEL && !nextCategories.includes(currentCategory)
        ? ALL_CATEGORIES_LABEL
        : currentCategory,
    );

    if (categoryResult.status === "rejected" && !nextCategories.length) {
      setCategories(nextCategories);
      setCategory(ALL_CATEGORIES_LABEL);
      setCategoryErrorMessage(
        getManageMenuErrorMessage(categoryResult.reason, "Failed to load categories"),
      );
    }

    if (itemResult.status === "fulfilled") {
      setItems(nextItems);
    } else {
      setErrorMessage(getManageMenuErrorMessage(itemResult.reason, "Failed to load menu items"));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  const categoryOptions = useMemo(
    () => [
      { value: ALL_CATEGORIES_LABEL, label: ALL_CATEGORIES_LABEL },
      ...categories.map((categoryName) => ({ value: categoryName, label: categoryName })),
    ],
    [categories],
  );
>>>>>>> Dulnith
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
      <section className={getManagerPageSectionClasses()}>
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
<<<<<<< HEAD
=======
          categorySuggestions={categories}
          subCategorySuggestions={subCategories}
          menuItems={items}
          isSaving={isSaving}
          errorMessage={modalErrorMessage}
>>>>>>> Dulnith
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
