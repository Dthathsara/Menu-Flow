import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GlobalBackground } from "@/components/common/layout";
import { ManagerThemeInitializer } from "@/components/manager/ManagerThemeInitializer";
import { MANAGER_STORAGE_KEY } from "@/components/manager/managerConfig";
import { getManagerSchemeFromStoredValue } from "@/components/manager/managerTheme";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuFlow | Smarter Digital Menus for Modern Restaurants",
  description:
    "Premium QR menu software for restaurants, cafes, hotels, and food brands.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = getManagerSchemeFromStoredValue(
    cookieStore.get(MANAGER_STORAGE_KEY)?.value,
  );

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-theme={initialTheme}
      suppressHydrationWarning
      className="h-full scroll-smooth"
    >
      <body
        data-theme={initialTheme}
        suppressHydrationWarning
        className="relative min-h-full bg-[var(--background)] font-sans text-[var(--text-primary)] antialiased transition-colors duration-300"
      >
        <ManagerThemeInitializer />
        <GlobalBackground />
        <div className="relative z-10 overflow-x-clip">{children}</div>
      </body>
    </html>
  );
}
