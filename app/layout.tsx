import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "LITHOS CRM",
  description: "Wholesale slab CRM with Leads, Clients, and Inventory",
  applicationName: "LITHOS CRM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LITHOS CRM",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-dvh flex-col overscroll-none bg-slate-950 text-slate-100">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
