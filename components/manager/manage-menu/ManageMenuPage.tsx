"use client";

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
import { getManagerPageSectionClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { DeleteMenuItemDialog } from "./DeleteMenuItemDialog";
import { ManageMenuTable } from "./ManageMenuTable";
import { ManageMenuToolbar } from "./ManageMenuToolbar";
import { MenuItemModal } from "./MenuItemModal";
import {
  ALL_AVAILABILITY_LABEL,
  ALL_CATEGORIES_LABEL,
} from "./types";
import type {
  MenuAvailabilityFilter,
  MenuFilterCategory,
  MenuItemFormValues,
  MenuItemRecord,
} from "./types";

interface ManageMenuPageProps {
  settings: ManagerSettings;
}

const AVAILABILITY_FILTERS: readonly MenuAvailabilityFilter[] = [
  ALL_AVAILABILITY_LABEL,
  "Available",
  "Unavailable",
];

function getManageMenuErrorMessage(error: unknown, fallback: string) {
  const message = getApiErrorMessage(error, fallback);

  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (
    axios.isAxiosError(error) &&
    error.response?.status === 403
  ) {
    return "Your account is not connected to a restaurant. Please log out and log in again.";
  }

  if (message === "Unable to connect to the server. Please check your internet connection.") {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  if (message === "You do not have permission to perform this action.") {
    return "You do not have permission to manage menu items.";
  }

  if (message === "The requested item was not found.") {
    return "Menu item endpoint was not found. Please check backend routes.";
  }

  return message;
}

function getNumericFieldError(label: string, value: string, minimum: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < minimum) {
    return `${label} must be a valid number ${minimum === 0 ? "0 or greater" : "1 or greater"}.`;
  }

  return "";
}

function validateMenuItemValues(values: MenuItemFormValues) {
  if (!values.name.trim()) {
    return "Food name is required.";
  }

  if (!values.categoryName.trim()) {
    return "Category name is required.";
  }

  return (
    getNumericFieldError("Small price", values.smallPrice, 0) ||
    getNumericFieldError("Medium price", values.mediumPrice, 0) ||
    getNumericFieldError("Large price", values.largePrice, 0) ||
    getNumericFieldError("Preparation time", values.prepTime, 1)
  );
}

function buildOptimisticItem(
  values: MenuItemFormValues,
  currentItem?: MenuItemRecord | null,
) {
  const categoryName = values.categoryName.trim();
  const smallPrice = Number(values.smallPrice);
  const mediumPrice = Number(values.mediumPrice);
  const largePrice = Number(values.largePrice);

  return {
    id: currentItem?.id ?? `pending-${Date.now()}`,
    tenantId: currentItem?.tenantId ?? "",
    name: values.name.trim(),
    categoryName,
    subCategoryName: values.subCategoryName.trim() || null,
    description: values.description.trim(),
    smallPrice,
    mediumPrice,
    largePrice,
    imageUrl: values.image,
    image: values.image,
    available: values.available,
    active: currentItem?.active ?? true,
    sortOrder: currentItem?.sortOrder ?? 0,
    prepTime: Number(values.prepTime),
    createdAt: currentItem?.createdAt ?? "",
    updatedAt: currentItem?.updatedAt ?? "",
    deletedAt: currentItem?.deletedAt ?? null,
  } satisfies MenuItemRecord;
}

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
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState<MenuFilterCategory>(ALL_CATEGORIES_LABEL);
  const [availability, setAvailability] =
    useState<MenuAvailabilityFilter>(ALL_AVAILABILITY_LABEL);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemRecord | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<MenuItemRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categoryErrorMessage, setCategoryErrorMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");

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
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch);
    const matchesCategory =
      category === ALL_CATEGORIES_LABEL || item.categoryName === category;
    const matchesAvailability =
      availability === ALL_AVAILABILITY_LABEL ||
      (availability === "Available" ? item.available : !item.available);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  function openAddModal() {
    setSelectedItem(null);
    setModalErrorMessage("");
    setModalMode("add");
  }

  function openEditModal(item: MenuItemRecord) {
    setSelectedItem(item);
    setModalErrorMessage("");
    setModalMode("edit");
  }

  async function handleSaveItem(values: MenuItemFormValues) {
    const validationError = validateMenuItemValues(values);

    if (validationError) {
      setModalErrorMessage(validationError);
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setModalErrorMessage("");

    try {
      const savedItem =
        modalMode === "edit" && selectedItem
          ? await updateMenuItem(selectedItem.id, values)
          : await createMenuItem(values);
      const nextItem = savedItem ?? buildOptimisticItem(values, selectedItem);

      setItems((current) =>
        modalMode === "edit" && selectedItem
          ? current.map((item) => (item.id === selectedItem.id ? nextItem : item))
          : [nextItem, ...current],
      );
      setModalMode(null);
      setSelectedItem(null);
      await loadMenuData();
    } catch (error) {
      setModalErrorMessage(getManageMenuErrorMessage(error, "Unable to save menu item."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteItem() {
    if (!itemPendingDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const deletedId = itemPendingDelete.id;
      await deleteMenuItem(deletedId);
      setItems((current) => current.filter((item) => item.id !== deletedId));
      setItemPendingDelete(null);
      await loadMenuData();
    } catch (error) {
      setErrorMessage(getManageMenuErrorMessage(error, "Unable to delete menu item."));
    } finally {
      setIsDeleting(false);
    }
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
          categories={categoryOptions}
          availability={availability}
          availabilityOptions={AVAILABILITY_FILTERS}
          resultCount={filteredItems.length}
          totalItemCount={items.length}
          isLoading={isLoading}
          errorMessage={errorMessage}
          categoryErrorMessage={categoryErrorMessage}
          onSearchChange={setSearchValue}
          onCategoryChange={setCategory}
          onAvailabilityChange={setAvailability}
          onRetry={loadMenuData}
          onEdit={openEditModal}
          onRemove={setItemPendingDelete}
        />
      </section>

      {modalMode ? (
        <MenuItemModal
          key={`${modalMode}-${selectedItem?.id ?? "new"}`}
          mode={modalMode}
          settings={settings}
          item={selectedItem}
          categorySuggestions={categories}
          subCategorySuggestions={subCategories}
          menuItems={items}
          isSaving={isSaving}
          errorMessage={modalErrorMessage}
          onClose={() => {
            if (isSaving) {
              return;
            }

            setModalMode(null);
            setSelectedItem(null);
            setModalErrorMessage("");
          }}
          onSave={handleSaveItem}
        />
      ) : null}

      <DeleteMenuItemDialog
        open={Boolean(itemPendingDelete)}
        settings={settings}
        itemName={itemPendingDelete?.name}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setItemPendingDelete(null);
          }
        }}
        onConfirm={handleDeleteItem}
      />
    </>
  );
}
