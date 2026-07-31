"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { TravelHeroSidebar } from "./TravelHeroSidebar";
import { TravelHeroHeader } from "./TravelHeroHeader";
import { SignOutConfirmDialog } from "@travelagency/ui";
import { clearBrowserCookie, readBrowserCookie } from "@travelagency/utils";
import { logoutAgent } from "@/api/auth.api";
import type { AgencyStatus } from "./AgencyStatusBadge";

export interface AppShellProps {
  children: React.ReactNode;
  agencyName?: string;
  partnerTier?: string;
  agencyStatus?: AgencyStatus;
  onLogout?: () => void;
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith(ROUTES.quotes)) return "Quote Request Portal";
  if (pathname.startsWith(ROUTES.profile)) return "Agency Profile";
  return "Dashboard";
}

function clearPortalCookies() {
  clearBrowserCookie("b2b_portal_access_token");
  clearBrowserCookie("b2b_portal_refresh_token");
  clearBrowserCookie("agency_status");
}

export default function AppShell({
  children,
  agencyName = "Apex Travel Agency",
  partnerTier = "standard",
  agencyStatus,
  onLogout,
}: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [cookieStatus, setCookieStatus] = useState<AgencyStatus | null>(null);

  useEffect(() => {
    setCookieStatus(readBrowserCookie("agency_status"));
  }, []);

  const resolvedAgencyStatus = agencyStatus ?? cookieStatus ?? "active";

  const performLogout = async () => {
    setSigningOut(true);
    try {
      const refresh = readBrowserCookie("b2b_portal_refresh_token");
      await logoutAgent(refresh).catch(() => undefined);
      await onLogout?.();
    } finally {
      clearPortalCookies();
      window.location.href = ROUTES.login;
    }
  };

  const handleSessionExpired = () => {
    clearPortalCookies();
    window.location.href = ROUTES.login;
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0E14] overflow-hidden text-white">
      <TravelHeroSidebar
        agencyName={agencyName}
        partnerTier={partnerTier}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onLogout={() => setSignOutOpen(true)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TravelHeroHeader
          pageTitle={getPageTitle(pathname)}
          agencyName={agencyName}
          agencyStatus={resolvedAgencyStatus}
          onMenuClick={() => setMobileMenuOpen(true)}
          onLogout={() => setSignOutOpen(true)}
          sessionCookieName="b2b_portal_access_token"
          onSessionExpired={handleSessionExpired}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <SignOutConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        onConfirm={performLogout}
        confirming={signingOut}
      />
    </div>
  );
}
