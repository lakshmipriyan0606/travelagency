import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdminProviders from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel Agency Admin",
  description: "Travel Agency Admin Portal — Manage packages, bookings, blogs, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AdminProviders>
          {children}
        </AdminProviders>
      </body>
    </html>
  );
}
