"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { TravelHeroSidebar } from "./TravelHeroSidebar";
import { TravelHeroHeader } from "./TravelHeroHeader";

export interface AppShellProps {
  children: React.ReactNode;
  agencyName?: string;
  partnerTier?: string;
  notificationCount?: number;
  onLogout?: () => void;
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith(ROUTES.quotes)) return "Quote Request Portal";
  if (pathname.startsWith(ROUTES.profile)) return "Agency Profile";
  return "Dashboard";
}

export default function AppShell({
  children,
  agencyName = "Apex Travel Agency",
  partnerTier = "standard",
  notificationCount = 3,
  onLogout,
}: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = () => {
    if (onLogout) return onLogout();
    document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.location.href = ROUTES.login;
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0E14] overflow-hidden text-white">
      <TravelHeroSidebar
        agencyName={agencyName}
        partnerTier={partnerTier}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TravelHeroHeader
          pageTitle={getPageTitle(pathname)}
          agencyName={agencyName}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          notificationCount={notificationCount}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
