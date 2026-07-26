"use client";

import { Menu, User, LogOut } from "lucide-react";
import { AdminUser } from "@/features/auth/types";
import { logoutAction } from "@/features/auth/actions";

interface AdminHeaderProps {
  user: AdminUser;
  onMobileToggle: () => void;
}

export function AdminHeader({ user, onMobileToggle }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onMobileToggle}
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:block text-sm text-gray-500">
          Welcome back, <span className="font-semibold text-gray-900">{user.name || 'Admin'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <User size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{user.role}</span>
        </div>
        
        <form action={logoutAction}>
          <button 
            type="submit"
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
