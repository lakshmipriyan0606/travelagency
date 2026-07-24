"use client";

import { useState } from "react";
import { AdminUser } from "@/features/admin/auth/types";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminShellProps {
  user: AdminUser;
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <AdminHeader 
          user={user} 
          onMobileToggle={() => setIsMobileMenuOpen(true)} 
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
