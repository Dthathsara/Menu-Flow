"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cn,
  getManagerPageSectionClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerSecondaryButtonClasses,
  getMutedTextClasses,
} from "@/components/manager/managerUtils";
import { useManagerSettings } from "@/components/manager/useManagerSettings";
import { WaiterEmptyState } from "@/components/waiter/WaiterEmptyState";
import { WaiterLoading } from "@/components/waiter/WaiterLoading";
import { WaiterStatusBadge } from "@/components/waiter/WaiterStatusBadge";
import { WaiterSurface } from "@/components/waiter/waiter-utils";
import { fetchChefAvailableTables } from "@/lib/chef-api";
import { getApiErrorMessage } from "@/lib/error-handler";
import type { ChefTable } from "./types";

function logChefPageError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

export function ChefTables() {
  const { settings } = useManagerSettings();
  const [tables, setTables] = useState<ChefTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const loadingRef = useRef(false);

  const loadTables = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setErrorMessage("");

    try {
      setTables(await fetchChefAvailableTables());
    } catch (error) {
      logChefPageError(error);
      setTables([]);
      setErrorMessage(getApiErrorMessage(error, "Unable to load available tables. Please try again."));
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTables();
  }, [loadTables]);

  return (
    <section className={getManagerPageSectionClasses()}>
      <WaiterSurface settings={settings}>
        <span className="inline-flex rounded-full border border-blue-400/24 bg-blue-500/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">
          Chef workspace
        </span>
        <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Tables</h2>
        <p className={getManagerPageSubtitleClasses(settings.scheme)}>
          Available tables for the restaurant connected to your chef account.
        </p>
      </WaiterSurface>

      <div className="flex justify-end">
        <button type="button" onClick={() => void loadTables()} className={cn(getManagerSecondaryButtonClasses(settings.scheme), "h-11 rounded-[14px] px-4 text-sm")}>
          Refresh
        </button>
      </div>

      {isLoading ? <WaiterLoading settings={settings} /> : null}

      {errorMessage ? (
        <WaiterEmptyState settings={settings} title="Tables unavailable" message={errorMessage} />
      ) : tables.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table, index) => (
            <WaiterSurface key={table.id || `${table.name}-${index}`} settings={settings} className="h-full p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{table.name}</p>
                  <p className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
                    {table.seats} seats
                  </p>
                </div>
                <WaiterStatusBadge status={table.status} settings={settings} />
              </div>
              <p className={cn("mt-5 text-sm", getMutedTextClasses(settings.scheme))}>
                {table.section ? `Section: ${table.section}` : "Available for incoming guests"}
              </p>
            </WaiterSurface>
          ))}
        </div>
      ) : (
        <WaiterEmptyState settings={settings} title="No available tables" message="There are no available restaurant tables to show right now." />
      )}
    </section>
  );
}
