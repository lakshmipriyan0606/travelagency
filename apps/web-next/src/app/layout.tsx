import type { Metadata } from "next";
import { Rubik, Quicksand, Caramel } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers";

const rubik = Rubik({ 
  subsets: ["latin"], 
  variable: "--font-heading" 
});

const quicksand = Quicksand({ 
  subsets: ["latin"], 
  variable: "--font-body" 
});

const caramel = Caramel({ 
  weight: "400",
  subsets: ["latin"], 
  variable: "--font-accent" 
});

export const metadata: Metadata = {
  title: "Travel Agency",
  description: "Your best travel partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={"  "} suppressHydrationWarning>
      <body className={"antialiased"} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
