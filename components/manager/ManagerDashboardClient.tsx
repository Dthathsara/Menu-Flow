"use client";

import dynamic from "next/dynamic";

export const ManagerDashboardClient = dynamic(
  () =>
    import("./ManagerDashboard").then((module) => module.ManagerDashboard),
  {
    ssr: false,
  },
);
