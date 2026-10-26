import "./globals.css";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: "LMS Citra Negara",
  description: "Satu Sistem Untuk Semua",
  icons: { icon: "/branding/logo-smk.png", apple: "/branding/logo-smk.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}