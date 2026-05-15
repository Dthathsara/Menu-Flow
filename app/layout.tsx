import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalBackground } from "@/components/common/layout";
import { ManagerThemeInitializer } from "@/components/manager/ManagerThemeInitializer";
import { MANAGER_STORAGE_KEY } from "@/components/manager/managerConfig";
import { getManagerSchemeFromStoredValue } from "@/components/manager/managerTheme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      data-theme={initialTheme}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
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
