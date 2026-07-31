"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminUser } from "@/features/auth/types";
import { adminNavigation } from "@/features/navigation";
import {
  EnterpriseSidebar,
  EnterpriseHeader,
  SignOutConfirmDialog,
  type HeaderNotification,
} from "@travelagency/ui";
import { clearBrowserCookie } from "@travelagency/utils";
import { AUTH_COOKIES } from "@travelagency/constants";
import { logoutAction } from "@/features/auth/actions";
import { logoutAPI } from "@/api/auth.api";
import { showToast } from "@/lib/toast";
import { ROUTES } from "@/lib/routes";
import { useB2CEnterpriseHeaderState } from "@/hooks/useEnterpriseHeaderState";

interface AdminShellProps {
  user: AdminUser;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    () => new Set()
  );
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const performLogout = async () => {
    setSigningOut(true);
    try {
      await logoutAPI().catch(() => undefined);
      await logoutAction().catch(() => undefined);
    } finally {
      clearBrowserCookie(AUTH_COOKIES.ACCESS_TOKEN);
      clearBrowserCookie(AUTH_COOKIES.REFRESH_TOKEN);
      showToast({ type: "success", content: "Logged out successfully" });
      window.location.href = ROUTES.login;
    }
  };

  const handleSessionExpired = () => {
    showToast({ type: "error", content: "Your session has expired. Please sign in again." });
    router.push(ROUTES.login);
  };

  const navItems = adminNavigation.flatMap((item) => {
    if (item.children) {
      return item.children.map((child) => ({
        label: child.title,
        href: child.href,
        icon: child.icon,
      }));
    }
    return [
      {
        label: item.title,
        href: item.href,
        icon: item.icon,
      },
    ];
  });

  const activeHref = useMemo(() => {
    const hrefs = navItems.map((n) => n.href);
    const candidates = hrefs.filter(
      (href) =>
        href &&
        href !== "#" &&
        (pathname === href || pathname.startsWith(`${href}/`))
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((best, href) => (href.length > best.length ? href : best));
  }, [pathname, navItems]);

  const activeItem = navItems.find((n) => n.href === activeHref);
  const currentTitle = activeItem ? activeItem.label : "B2C Admin Panel";

  const headerState = useB2CEnterpriseHeaderState(searchValue, navItems);
  const notifications = headerState.notifications.map((item) => ({
    ...item,
    isRead: readNotificationIds.has(item.id),
  }));

  const handleNotificationClick = (item: HeaderNotification) => {
    setReadNotificationIds((prev) => new Set(prev).add(item.id));
    if (item.href) router.push(item.href);
  };

  const handleMarkAllRead = () => {
    setReadNotificationIds(new Set(notifications.map((item) => item.id)));
  };

  const handleSearchSubmit = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
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
        appLogoSubtitle="B2C ADMIN PORTAL"
        navItems={navItems}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <EnterpriseHeader
          pageTitle={currentTitle}
          breadcrumbs={[
            { label: "B2C Admin", href: "/b2c/admin/dashboard" },
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
          onSessionExpired={handleSessionExpired}
          onLogout={() => setSignOutOpen(true)}
        />

        <main className="flex-1 overflow-y-auto ent-scrollbar p-8 space-y-8 max-w-[1440px] w-full mx-auto">
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
