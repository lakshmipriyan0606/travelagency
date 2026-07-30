"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminUser } from "@/features/auth/types";
import { Building2, Users } from "lucide-react";
import { b2bAdminLogout } from "@/api/b2bAdmin.api";
import { showToast } from "@/lib/toast";
import { ROUTES } from "@/lib/routes";
import { EnterpriseSidebar, EnterpriseHeader } from "@travelagency/ui";

interface B2BAdminShellProps {
  user: AdminUser;
  children: React.ReactNode;
}

export default function B2BAdminShell({ user, children }: B2BAdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = async () => {
    try {
      await b2bAdminLogout();
      document.cookie = "b2b_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie = "b2b_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      showToast({ type: "success", content: "Logged out successfully" });
      router.push(ROUTES.b2b.login);
    } catch {
      showToast({ type: "error", content: "Logout failed." });
    }
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

  return (
    <div className="flex h-screen w-full bg-[#090909] overflow-hidden text-white">
      {/* Shared Unified Enterprise Sidebar */}
      <EnterpriseSidebar
        appName="B2B Admin"
        appLogoSubtitle="Agency Control Portal"
        navItems={navItems}
        userProfile={{
          name: user.name,
          email: user.email || `${user.username || 'admin'}@travelagency.com`,
          role: user.role,
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Shared Unified Enterprise Header */}
        <EnterpriseHeader
          pageTitle={currentTitle}
          breadcrumbs={[
            { label: "B2B Admin", href: ROUTES.b2b.dashboard },
            { label: currentTitle },
          ]}
          userProfile={{
            name: user.name,
          }}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Dynamic Page Content Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
