import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevOps Control Center",
  robots: { index: false, follow: false },
};

export default function DevopsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
