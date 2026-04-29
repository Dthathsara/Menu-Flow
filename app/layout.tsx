import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalBackground } from "@/components/common/layout";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="relative min-h-full bg-[var(--background)] font-sans text-[var(--text-primary)] antialiased transition-colors duration-300">
        <GlobalBackground />
        <div className="relative z-10 overflow-x-clip">{children}</div>
      </body>
    </html>
  );
}
