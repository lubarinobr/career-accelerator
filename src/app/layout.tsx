import { Inter } from "next/font/google";

import type { Metadata, Viewport } from "next";

import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SessionWrapper } from "@/components/SessionWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Accelerator",
  description: "Master AWS certifications in 5 minutes a day",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Career Accelerator",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="flex min-h-full flex-col overflow-x-hidden bg-gray-50 text-gray-900">
        <SessionWrapper>
          <main className="flex-1">{children}</main>
        </SessionWrapper>
        <ServiceWorkerRegister />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
