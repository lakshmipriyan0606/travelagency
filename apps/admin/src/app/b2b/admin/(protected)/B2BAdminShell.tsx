"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminUser } from "@/features/auth/types";
import { Building2, Users } from "lucide-react";
import { b2bAdminLogout } from "@/api/b2bAdmin.api";
import { showToast } from "@/lib/toast";
import { ROUTES } from "@/lib/routes";
import {
  EnterpriseSidebar,
  EnterpriseHeader,
  SignOutConfirmDialog,
  type HeaderNotification,
} from "@travelagency/ui";
import { clearBrowserCookie, readBrowserCookie } from "@travelagency/utils";
import { useB2BEnterpriseHeaderState } from "@/hooks/useEnterpriseHeaderState";

interface B2BAdminShellProps {
  user: AdminUser;
  children: React.ReactNode;
}

function clearB2BAdminCookies() {
  clearBrowserCookie("b2b_access_token");
  clearBrowserCookie("b2b_refresh_token");
  clearBrowserCookie("access_token");
  clearBrowserCookie("refresh_token");
}

export default function B2BAdminShell({ user, children }: B2BAdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    () => new Set()
  );
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const headerState = useB2BEnterpriseHeaderState(searchValue);
  const notifications = headerState.notifications.map((item) => ({
    ...item,
    isRead: readNotificationIds.has(item.id),
  }));

  const performLogout = async () => {
    setSigningOut(true);
    try {
      const refresh = readBrowserCookie("b2b_refresh_token");
      await b2bAdminLogout(refresh).catch(() => undefined);
    } finally {
      clearB2BAdminCookies();
      showToast({ type: "success", content: "Logged out successfully" });
      window.location.href = ROUTES.b2b.login;
    }
  };

  const handleSessionExpired = () => {
    clearB2BAdminCookies();
    showToast({ type: "error", content: "Your session has expired. Please sign in again." });
    router.push(ROUTES.b2b.login);
  };

  const navItems = [
    {
      label: "Agencies Dashboard",
      href: ROUTES.b2b.dashboard,
      icon: Building2,
    },
    {
      label: "Agency Details",
      href: ROUTES.b2b.agencyDetails,
      icon: Users,
    },
  ];

  const pageTitleMap: Record<string, string> = {
    [ROUTES.b2b.dashboard]: "Agencies Dashboard",
    [ROUTES.b2b.agencyDetails]: "Agency Management & Details",
  };

  const currentTitle = pageTitleMap[pathname] || "B2B Admin Overview";

  const handleNotificationClick = (item: HeaderNotification) => {
    setReadNotificationIds((prev) => new Set(prev).add(item.id));
    if (item.href) router.push(item.href);
  };

  const handleMarkAllRead = () => {
    setReadNotificationIds(new Set(notifications.map((item) => item.id)));
  };

  const handleSearchSubmit = () => {
    router.push(headerState.defaultSearchHref);
  };

  const handleSearchResultClick = (result: { href: string }) => {
    router.push(result.href);
    setSearchValue("");
  };

  return (
    <div className="flex h-screen w-full ent-ambient-bg overflow-hidden text-[var(--ent-text-main,#F4F4F5)]" data-admin-portal>
      <EnterpriseSidebar
        appName="TravelHero"
        appLogoSubtitle="B2B PORTAL"
        navItems={navItems}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <EnterpriseHeader
          pageTitle={currentTitle}
          breadcrumbs={[
            { label: "B2B Admin", href: ROUTES.b2b.dashboard },
            { label: currentTitle },
          ]}
          userProfile={{
            name: user.name,
            role: user.role,
          }}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearchSubmit={handleSearchSubmit}
          searchResults={headerState.searchResults}
          isSearchLoading={headerState.isSearchLoading}
          onSearchResultClick={handleSearchResultClick}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllNotificationsRead={handleMarkAllRead}
          helpItems={headerState.helpItems}
          sessionExpiresAt={user.exp}
          sessionCookieName="b2b_access_token"
          onSessionExpired={handleSessionExpired}
          onLogout={() => setSignOutOpen(true)}
        />

        <main className="mx-auto flex w-full max-w-[1440px] min-h-0 flex-1 flex-col overflow-y-auto ent-scrollbar p-6 sm:p-8">
          {children}
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
