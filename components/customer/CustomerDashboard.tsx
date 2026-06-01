"use client";

import { useCallback, useEffect, useState } from "react";
import { BottomTabBar } from "@/components/customer/BottomTabBar";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { ContactPanel } from "@/components/customer/ContactPanel";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { ItemDetailsModal } from "@/components/customer/ItemDetailsModal";
import { OrderConfirmModal } from "@/components/customer/OrderConfirmModal";
import { OrdersPanel } from "@/components/customer/OrdersPanel";
import { RemoveConfirmModal } from "@/components/customer/RemoveConfirmModal";
import { SubcategorySection } from "@/components/customer/SubcategorySection";
import { formatPrice, getSectionKey } from "@/components/customer/customerUtils";
import {
  CustomerMenuApiError,
  fetchCustomerMenuData,
} from "@/lib/customer-menu-api";
import type {
  CartItem,
  CustomerMenuData,
  MenuCategory,
  MenuItem,
  ServingSize,
  TabId,
} from "@/types/customer";

interface ModalState {
  categoryId: string;
  subcategoryId: string;
  itemId: string;
  editKey?: string;
  crust?: string;
  initialServing?: ServingSize;
  initialQuantity?: number;
}

interface OrderConfirmationState {
  item: MenuItem;
  serving: ServingSize;
  quantity: number;
  crust?: string;
  editKey?: string;
}

function buildExpandedState(categories: MenuCategory[]) {
  return Object.fromEntries(
    categories.flatMap((category) =>
      category.subcategories.map((subcategory) => [
        getSectionKey(category.id, subcategory.id),
        true,
      ]),
    ),
  ) as Record<string, boolean>;
}

function getMenuSlugFromLocation() {
  if (typeof window === "undefined") {
    return "";
  }

  const params = new URLSearchParams(window.location.search);

  return (
    params.get("slug") ??
    params.get("menu") ??
    params.get("restaurant") ??
    ""
  );
}

function getTenantIdFromLocation() {
  if (typeof window === "undefined") {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const queryTenantId = (params.get("tenantId") ?? params.get("tenant") ?? "").trim();

  if (queryTenantId) {
    return queryTenantId;
  }

  return getStoredTenantId();
}

function getQueryTenantIdFromLocation() {
  if (typeof window === "undefined") {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  return (params.get("tenantId") ?? params.get("tenant") ?? "").trim();
}

function getStoredTenantId() {
  if (typeof window === "undefined") {
    return "";
  }

  const storedUser = window.localStorage.getItem("user");

  if (!storedUser) {
    return "";
  }

  try {
    const user = JSON.parse(storedUser) as { tenantId?: unknown };

    if (typeof user.tenantId === "string") {
      return user.tenantId.trim();
    }

    if (typeof user.tenantId === "number") {
      return String(user.tenantId);
    }
  } catch {
    return "";
  }

  return "";
}

function getCustomerMenuErrorMessage(error: unknown) {
  if (error instanceof CustomerMenuApiError) {
    return error.message;
  }

  return "Unable to load menu. Please try again.";
}

function mergeExpandedState(
  current: Record<string, boolean>,
  categories: MenuCategory[],
) {
  return {
    ...buildExpandedState(categories),
    ...Object.fromEntries(
      Object.entries(current).filter(([key]) =>
        categories.some((category) =>
          category.subcategories.some(
            (subcategory) => getSectionKey(category.id, subcategory.id) === key,
          ),
        ),
      ),
    ),
  };
}

function StatusMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f3f0eb] px-4 pb-28 pt-4 text-[#7a2a24] sm:px-6 sm:pb-32 sm:pt-6 md:px-8 lg:px-6 xl:px-8 2xl:px-10">
      <div className="mx-auto w-full max-w-[1680px]">
        <section className="rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] p-6 text-center shadow-[0_18px_48px_rgba(108,79,55,0.08)]">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
            Menu
          </p>
          <h1 className="mt-3 text-2xl font-black text-[#7a2a24]">
            {message}
          </h1>
        </section>
      </div>
    </div>
  );
}

export function CustomerDashboard() {
  const [data, setData] = useState<CustomerMenuData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("menu");
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    {},
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [orderConfirmation, setOrderConfirmation] =
    useState<OrderConfirmationState | null>(null);
  const [removeConfirmation, setRemoveConfirmation] = useState<CartItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMenuData = useCallback(async (showLoading: boolean) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const nextData = await fetchCustomerMenuData({
        slug: getMenuSlugFromLocation(),
        tenantId: getTenantIdFromLocation(),
      });

      setData(nextData);
      setErrorMessage("");
      setActiveCategoryId((currentCategoryId) =>
        nextData.categories.some((category) => category.id === currentCategoryId)
          ? currentCategoryId
          : nextData.categories[0]?.id ?? "",
      );
      setExpandedSections((current) =>
        mergeExpandedState(current, nextData.categories),
      );
    } catch (error) {
      if (showLoading) {
        setErrorMessage(getCustomerMenuErrorMessage(error));
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchMenu = (showLoading = false) => {
      if (!active) {
        return;
      }

      void loadMenuData(showLoading);
    };

    fetchMenu(true);

    const intervalId = window.setInterval(() => fetchMenu(false), 5000);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchMenu(false);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadMenuData]);

  if (isLoading && !data) {
    return <StatusMessage message="Loading menu..." />;
  }

  if (!data) {
    return (
      <StatusMessage
        message={errorMessage || "Unable to load menu. Please try again."}
      />
    );
  }

  const firstCategory = data.categories[0];

  if (!firstCategory) {
    return <StatusMessage message="No menu items are available right now." />;
  }

  const activeCategory =
    data.categories.find((category) => category.id === activeCategoryId) ??
    firstCategory;

  const modalCategory = modalState
    ? data.categories.find((category) => category.id === modalState.categoryId) ??
      null
    : null;
  const modalSubcategory = modalCategory
    ? modalCategory.subcategories.find(
        (subcategory) => subcategory.id === modalState?.subcategoryId,
      ) ?? null
    : null;
  const modalItems = modalSubcategory?.items ?? [];
  const activeModalItem =
    modalItems.find((item) => item.id === modalState?.itemId) ?? null;

  const orderCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const orderSubtotal = cartItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const orderTenantId =
    getQueryTenantIdFromLocation() ||
    data.restaurant.id ||
    "";
  const activeCategoryItemCount = activeCategory.subcategories.reduce(
    (count, subcategory) => count + subcategory.items.length,
    0,
  );

  function findItemLocation(itemId: string) {
    if (!data) {
      return null;
    }

    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        const foundItem = subcategory.items.find((entry) => entry.id === itemId);

        if (foundItem) {
          return {
            categoryId: category.id,
            subcategoryId: subcategory.id,
          };
        }
      }
    }

    return null;
  }

  function handleCategoryChange(categoryId: string) {
    setActiveCategoryId(categoryId);
    setActiveTab("menu");
  }

  function toggleSection(categoryId: string, subcategoryId: string) {
    const key = getSectionKey(categoryId, subcategoryId);

    setExpandedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function openItemModal(categoryId: string, subcategoryId: string, itemId: string) {
    setModalState({ categoryId, subcategoryId, itemId });
  }

  function moveModalSelection(direction: -1 | 1) {
    if (!modalState || modalItems.length < 2 || !activeModalItem) {
      return;
    }

    const currentIndex = modalItems.findIndex((item) => item.id === activeModalItem.id);
    const nextIndex = (currentIndex + direction + modalItems.length) % modalItems.length;
    const nextItem = modalItems[nextIndex];

    setModalState({
      ...modalState,
      itemId: nextItem.id,
    });
  }

  function addToOrder(
    item: MenuItem,
    serving: ServingSize,
    quantity: number,
    crust?: string,
    editKey?: string,
  ) {
    setOrderConfirmation({
      item,
      serving,
      quantity,
      crust,
      editKey,
    });
  }

  function confirmAddToOrder() {
    if (!orderConfirmation) {
      return;
    }

    const { item, serving, quantity, crust, editKey } = orderConfirmation;
    const unitPrice = item.servingPrices[serving] ?? 0;
    const key = `${item.id}:${serving}:${crust ?? "default"}`;

    setCartItems((current) => {
      if (editKey) {
        const itemBeingEdited = current.find((entry) => entry.key === editKey);
        const remainingItems = current.filter((entry) => entry.key !== editKey);
        const matchingItem = remainingItems.find((entry) => entry.key === key);

        if (matchingItem) {
          return remainingItems.map((entry) =>
            entry.key === key
              ? {
                  ...entry,
                  quantity: entry.quantity + quantity,
                }
              : entry,
          );
        }

        return [
          ...remainingItems,
          {
            key,
            itemId: item.id,
            name: item.name,
            categoryName: item.categoryName,
            subCategoryName: item.subCategoryName,
            crust: crust ?? itemBeingEdited?.crust,
            serving,
            quantity,
            unitPrice,
            prepTime: item.prepTime,
            image: item.image,
          },
        ];
      }

      const existingItem = current.find((entry) => entry.key === key);

      if (existingItem) {
        return current.map((entry) =>
          entry.key === key
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry,
        );
      }

      return [
        ...current,
        {
          key,
          itemId: item.id,
          name: item.name,
          categoryName: item.categoryName,
          subCategoryName: item.subCategoryName,
          crust,
          serving,
          quantity,
          unitPrice,
          prepTime: item.prepTime,
          image: item.image,
        },
      ];
    });

    setOrderConfirmation(null);
    setModalState(null);
  }

  function cancelAddToOrder() {
    setOrderConfirmation(null);
  }

  function requestRemoveCartItem(item: CartItem) {
    setRemoveConfirmation(item);
  }

  function confirmRemoveCartItem() {
    if (!removeConfirmation) {
      return;
    }

    const key = removeConfirmation.key;
    setCartItems((current) => current.filter((item) => item.key !== key));
    setRemoveConfirmation(null);
  }

  function cancelRemoveCartItem() {
    setRemoveConfirmation(null);
  }

  function handleQuickAdd(item: MenuItem, serving: ServingSize) {
    addToOrder(item, serving, 1);
  }

  function handleEditItem(item: CartItem) {
    const location = findItemLocation(item.itemId);

    if (!location) {
      window.alert("This item is no longer available on the menu.");
      return;
    }

    setModalState({
      ...location,
      itemId: item.itemId,
      editKey: item.key,
      crust: item.crust,
      initialServing: item.serving,
      initialQuantity: item.quantity,
    });
  }

  return (
    <div className="min-h-screen bg-[#f3f0eb] px-4 pb-28 pt-4 text-[#7a2a24] sm:px-6 sm:pb-32 sm:pt-6 md:px-8 lg:px-6 xl:px-8 2xl:px-10">
      <div className="mx-auto w-full max-w-[1680px] space-y-4">
        <CustomerHeader restaurant={data.restaurant} />

        {activeTab === "menu" ? (
          <section className="rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] p-4 shadow-[0_18px_48px_rgba(108,79,55,0.08)] sm:p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
                  Menu
                </p>
                <h1 className="mt-2 text-2xl font-black text-[#7a2a24] sm:text-3xl">
                  Explore today&apos;s customer menu
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#8e7364] lg:max-w-4xl">
                  Switch categories, collapse sections, and open any dish to view
                  servings and add it to your order.
                </p>
              </div>
              <div className="hidden rounded-[1.3rem] bg-[#f3ecdf] px-4 py-3 text-right text-sm text-[#816557] sm:block">
                <div className="font-bold text-[#2b8a38]">
                  {activeCategory.accentLabel}
                </div>
                <div>{activeCategoryItemCount} dishes</div>
              </div>
            </div>

            <div className="mt-5 w-full">
              <CategoryTabs
                categories={data.categories}
                activeCategoryId={activeCategory.id}
                onSelect={handleCategoryChange}
              />
            </div>

            <div className="mt-5 2xl:grid 2xl:grid-cols-[minmax(0,3fr)_minmax(340px,1fr)] 2xl:gap-6">
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
                  <div className="hidden rounded-[1.6rem] bg-[#fcf7f1] p-4 lg:col-start-2 lg:block lg:p-5 2xl:hidden">
                    <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#3d9238]">
                      Current cart
                    </div>
                    <div className="mt-2 text-3xl font-black text-[#2b8a38]">
                      {formatPrice(orderSubtotal)}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#7a6050]">
                      {orderCount === 0
                        ? "No selections yet."
                        : `${orderCount} portion${orderCount === 1 ? "" : "s"} currently added.`}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="mt-4 w-full rounded-[1.1rem] border border-[#d8cab8] bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7a2a24] transition hover:bg-[#fffdfa]"
                    >
                      View Orders
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {activeCategory.subcategories.map((subcategory) => {
                    const sectionKey = getSectionKey(
                      activeCategory.id,
                      subcategory.id,
                    );

                    return (
                      <SubcategorySection
                        key={subcategory.id}
                        name={subcategory.name}
                        description={subcategory.description}
                        expanded={expandedSections[sectionKey]}
                        items={subcategory.items}
                        onToggle={() =>
                          toggleSection(activeCategory.id, subcategory.id)
                        }
                        onSelectItem={(itemId) =>
                          openItemModal(activeCategory.id, subcategory.id, itemId)
                        }
                        onQuickAdd={handleQuickAdd}
                      />
                    );
                  })}
                </div>
              </div>

              <aside className="mt-5 hidden 2xl:block">
                <div className="sticky top-6 space-y-4">
                  <div className="rounded-[1.6rem] bg-[#f4ede3] p-5">
                    <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#3d9238]">
                      {activeCategory.name}
                    </div>
                    <div className="mt-2 text-3xl font-black text-[#7a2a24]">
                      {activeCategoryItemCount}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#7a6050]">
                      dishes across {activeCategory.subcategories.length} open
                      sections.
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] bg-[#fcf7f1] p-5">
                    <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#3d9238]">
                      Section count
                    </div>
                    <div className="mt-2 text-3xl font-black text-[#7a2a24]">
                      {activeCategory.subcategories.length}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#7a6050]">
                      All subcategories open by default and can still be
                      collapsed manually.
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] bg-[#6c2a20] p-5 text-[#fff7f2]">
                    <div className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#f1d2c2]">
                      Current cart
                    </div>
                    <div className="mt-2 text-3xl font-black">
                      {formatPrice(orderSubtotal)}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#f9e4db]">
                      {orderCount === 0
                        ? "No selections yet."
                        : `${orderCount} portion${orderCount === 1 ? "" : "s"} currently added.`}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="mt-4 w-full rounded-[1.1rem] bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#7a2a24] transition hover:bg-[#fff2eb]"
                    >
                      View Orders
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {activeTab === "orders" ? (
          <OrdersPanel
            items={cartItems}
            subtotal={orderSubtotal}
            restaurant={data.restaurant}
            tenantId={orderTenantId?.trim() ?? ""}
            onOrderSuccess={() => setCartItems([])}
            onEdit={handleEditItem}
            onRemove={requestRemoveCartItem}
          />
        ) : null}

        {activeTab === "contact" ? (
          <ContactPanel restaurant={data.restaurant} contact={data.contact} />
        ) : null}
      </div>

      <BottomTabBar
        activeTab={activeTab}
        orderCount={orderCount}
        onChange={setActiveTab}
      />

      <ItemDetailsModal
        item={activeModalItem}
        itemsInSection={modalItems}
        isOpen={modalState !== null}
        initialServing={modalState?.initialServing}
        initialQuantity={modalState?.initialQuantity}
        submitLabel={modalState?.editKey ? "Update Order" : "Add To Order"}
        onClose={() => setModalState(null)}
        onPrevious={() => moveModalSelection(-1)}
        onNext={() => moveModalSelection(1)}
        onAddToOrder={(item, serving, quantity) =>
          addToOrder(
            item,
            serving,
            quantity,
            modalState?.crust,
            modalState?.editKey,
          )
        }
      />

      <OrderConfirmModal
        item={orderConfirmation?.item}
        serving={orderConfirmation?.serving}
        price={
          orderConfirmation
            ? orderConfirmation.item.servingPrices[orderConfirmation.serving] ?? 0
            : 0
        }
        isOpen={orderConfirmation !== null}
        onCancel={cancelAddToOrder}
        onConfirm={confirmAddToOrder}
      />

      <RemoveConfirmModal
        item={removeConfirmation}
        isOpen={removeConfirmation !== null}
        onCancel={cancelRemoveCartItem}
        onConfirm={confirmRemoveCartItem}
      />
    </div>
  );
}
