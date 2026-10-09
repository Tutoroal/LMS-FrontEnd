import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LMS Citra Negara",
  description: "Satu Sistem Untuk Semua",
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