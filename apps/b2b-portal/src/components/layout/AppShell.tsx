"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, User } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { EnterpriseSidebar, EnterpriseHeader } from "@travelagency/ui";

interface AppShellProps {
  children: React.ReactNode;
  user?: { name: string; email: string };
  agencyStatus?: string;
  onLogout?: () => void;
}

export default function AppShell({
  children,
  user = { name: "Agent Partner", email: "partner@travelagency.com" },
  onLogout,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = () => {
    if (onLogout) return onLogout();
    document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.location.href = ROUTES.login;
  };

  const navItems = [
    {
      label: "Agency Dashboard",
      href: ROUTES.dashboard,
      icon: LayoutDashboard,
    },
    {
      label: "Quotes Management",
      href: ROUTES.quotes,
      icon: FileText,
    },
    {
      label: "Agency Profile",
      href: ROUTES.profile,
      icon: User,
    },
  ];

  const getPageTitle = () => {
    if (pathname.startsWith(ROUTES.quotes)) return "Quotes Management";
    if (pathname.startsWith(ROUTES.profile)) return "Agency Profile";
    return "Agency Dashboard";
  };

  return (
    <div className="flex h-screen w-full bg-[#090909] overflow-hidden text-white">
      {/* Shared Unified Enterprise Sidebar */}
      <EnterpriseSidebar
        appName="B2B Portal"
        appLogoSubtitle="Travel Partner Suite"
        navItems={navItems}
        userProfile={{
          name: user.name,
          email: user.email,
          role: "Authorized Agency Partner",
        }}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Shared Unified Enterprise Header */}
        <EnterpriseHeader
          pageTitle={getPageTitle()}
          breadcrumbs={[
            { label: "B2B Portal", href: ROUTES.dashboard },
            { label: getPageTitle() },
          ]}
          userProfile={{
            name: user.name,
          }}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
