"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Building2,
  LucideIcon,
  Crown,
} from "lucide-react";
import { cn } from "@travelagency/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface EnterpriseSidebarProps {
  appName: string;
  appLogoSubtitle?: string;
  navItems: NavItem[];
  userProfile?: {
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
  };
  onLogout?: () => void;
}

export function EnterpriseSidebar({
  appName,
  appLogoSubtitle = "ENTERPRISE",
  navItems,
  userProfile = {
    name: "Admin User",
    email: "admin@travelagency.com",
    role: "System Administrator",
  },
  onLogout,
}: EnterpriseSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-screen sticky top-0 z-30 bg-[#0A0A0C] border-r border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.8)] select-none shrink-0"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-[76px] px-5 border-b border-white/[0.08] bg-[#0A0A0C]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#F8B400] text-black font-bold shadow-[0_0_15px_rgba(248,180,0,0.4)] shrink-0">
            <Building2 className="h-5 w-5 text-black" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-[16px] font-black text-white leading-tight truncate tracking-tight uppercase">
                {appName}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#F8B400] uppercase mt-0.5">
                {appLogoSubtitle}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3.5 h-11 px-3.5 rounded-xl transition-all duration-150 group text-[14px]",
                isActive
                  ? "bg-[#F8B400] text-black font-bold shadow-[0_4px_20px_rgba(248,180,0,0.35)]"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white font-medium"
              )}
            >
              <Icon
                className={cn(
                  "h-[20px] w-[20px] shrink-0 transition-colors",
                  isActive ? "text-black" : "text-zinc-400 group-hover:text-white"
                )}
              />

              {!isCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-bold rounded-full",
                    isActive
                      ? "bg-black/20 text-black"
                      : "bg-[#F8B400]/20 text-[#F8B400]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Card & Controls */}
      <div className="p-3 border-t border-white/[0.08] bg-[#070708] flex flex-col gap-2.5 shrink-0">
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-[#141417] border border-white/[0.08] flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <Crown className="h-4 w-4 text-[#F8B400]" />
              <span className="text-[13px] font-bold text-white">Upgrade Plan</span>
            </div>
            <button className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/10 text-white hover:bg-white/20 transition cursor-pointer">
              Pro
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {onLogout ? (
            <button
              onClick={onLogout}
              className={cn(
                "flex items-center gap-2 h-9 px-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-[13px] font-semibold flex-1 justify-start cursor-pointer border border-transparent hover:border-red-500/20",
                isCollapsed && "justify-center px-0 w-9 h-9"
              )}
              title="Logout"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          ) : (
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-2 h-9 px-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors text-[13px] font-medium flex-1",
                isCollapsed && "justify-center px-0 w-9 h-9"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#141417] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors shrink-0 cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
