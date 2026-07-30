"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminUser } from "@/features/auth/types";
import { adminNavigation } from "@/features/navigation";
import { EnterpriseSidebar, EnterpriseHeader } from "@travelagency/ui";
import { logoutAction } from "@/features/auth/actions";
import { showToast } from "@/lib/toast";

interface AdminShellProps {
  user: AdminUser;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = async () => {
    try {
      await logoutAction();
      showToast({ type: "success", content: "Logged out successfully" });
      router.push("/b2c/admin/login");
    } catch {
      showToast({ type: "error", content: "Logout failed." });
    }
  };

  // Flat mapping for navigation items
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

  return (
    <div className="flex h-screen w-full ent-ambient-bg overflow-hidden text-[var(--ent-text-main,#F4F4F5)]" data-admin-portal>
      {/* Shared Unified Enterprise Sidebar */}
      <EnterpriseSidebar
        appName="TravelHero"
        appLogoSubtitle="B2C ADMIN PORTAL"
        navItems={navItems}
        userProfile={{
          name: user.name,
          email: user.email || `${user.username || 'admin'}@travelagency.com`,
          role: user.role,
        }}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Shared Unified Enterprise Header */}
        <EnterpriseHeader
          pageTitle={currentTitle}
          breadcrumbs={[
            { label: "B2C Admin", href: "/b2c/admin/dashboard" },
            { label: currentTitle },
          ]}
          userProfile={{
            name: user.name,
          }}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto ent-scrollbar p-8 space-y-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
