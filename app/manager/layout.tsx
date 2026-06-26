import { cookies } from "next/headers";
import { DEFAULT_MANAGER_SETTINGS, MANAGER_STORAGE_KEY } from "@/components/manager/managerConfig";
import { parseManagerSettingsValue } from "@/components/manager/managerTheme";
import { ManagerThemeProvider } from "@/components/manager/useManagerSettings";

export default async function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialSettings =
    parseManagerSettingsValue(
      cookieStore.get(MANAGER_STORAGE_KEY)?.value,
      DEFAULT_MANAGER_SETTINGS,
    ) ?? DEFAULT_MANAGER_SETTINGS;

  return (
    <ManagerThemeProvider initialSettings={initialSettings}>
      {children}
    </ManagerThemeProvider>
  );
}
