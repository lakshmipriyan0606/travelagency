"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminUser } from "@/features/auth/types";
import { Building2, LogOut, Menu, X, Globe, User } from "lucide-react";
import { b2bAdminLogout } from "@/api/b2bAdmin.api";
import { showToast } from "@/lib/toast";

interface B2BAdminShellProps {
  user: AdminUser;
  children: React.ReactNode;
}

export default function B2BAdminShell({ user, children }: B2BAdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await b2bAdminLogout();
      // Clear access and refresh token cookies manually
      document.cookie = "b2b_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie = "b2b_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      showToast({ type: "success", content: "Logged out successfully" });
      router.push("/b2b/admin/login");
    } catch {
      showToast({ type: "error", content: "Logout failed." });
    }
  };

  const menuItems = [
    {
      title: "Agencies Dashboard",
      href: "/b2b/admin/dashboard",
      icon: Building2,
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-neutral-900 text-white w-64 border-r border-neutral-800">
      <div className="p-6 border-b border-neutral-800">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          <Globe className="text-primary" /> B2B Admin Panel
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-primary text-neutral-950 shadow-lg shadow-primary/20"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-neutral-950 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full bg-neutral-50 text-neutral-800">
        {/* Header */}
        <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-neutral-800 hidden sm:block">
              Welcome back, {user.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-neutral-800">{user.name}</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{user.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 sm:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
