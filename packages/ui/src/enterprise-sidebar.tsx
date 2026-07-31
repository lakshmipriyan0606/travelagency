"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  LucideIcon,
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
}

/** Prefer the longest matching href so /activities/new does not also activate /activities. */
function resolveActiveHref(pathname: string, hrefs: readonly string[]): string | null {
  const candidates = hrefs.filter((href) => {
    if (!href || href === "#" || href === "/") return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  if (candidates.length === 0) return null;
  return candidates.reduce((best, href) => (href.length > best.length ? href : best));
}

export function EnterpriseSidebar({
  appName,
  appLogoSubtitle = "ENTERPRISE",
  navItems,
}: EnterpriseSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const activeHref = React.useMemo(
    () => resolveActiveHref(pathname, navItems.map((item) => item.href)),
    [pathname, navItems]
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col h-screen sticky top-0 z-30 bg-[#07070a] border-r border-white/[0.08] shadow-[4px_0_28px_rgba(0,0,0,0.7)] select-none shrink-0"
    >
      {/* Brand Header + collapse toggle */}
      <div
        className={cn(
          "flex border-b border-white/[0.08] bg-[#07070a] shrink-0",
          isCollapsed
            ? "flex-col items-center gap-2 py-4 px-2"
            : "items-center justify-between h-[72px] px-5"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 overflow-hidden min-w-0",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#FFD54A] to-[#F8B400] text-black font-bold shadow-[0_0_18px_rgba(248,180,0,0.45)] shrink-0">
            <Building2 className="h-5 w-5 text-black" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-[16px] font-bold text-white leading-tight truncate tracking-tight uppercase">
                {appName}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#F8B400] uppercase mt-0.5">
                {appLogoSubtitle}
              </span>
            </motion.div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#121216] border border-white/[0.08] text-zinc-400 hover:text-[#F8B400] hover:border-[#F8B400]/30 hover:bg-white/[0.06] transition-colors shrink-0 cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation List — fills remaining height */}
      <nav className="flex-1 min-h-0 overflow-y-auto ent-scrollbar px-3 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeHref !== null && item.href === activeHref;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-4 h-11 rounded-xl transition-colors duration-200 group text-[15px] font-medium overflow-hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8B400]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0C]",
                isCollapsed ? "justify-center px-0" : "px-3.5",
                isActive
                  ? "text-[#0c0c0f] font-bold"
                  : "text-zinc-200 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="ent-sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FFD54A] via-[#F8B400] to-[#E8A800] shadow-[0_4px_20px_rgba(248,180,0,0.35)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {!isActive && !isCollapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 rounded-full bg-[#F8B400] opacity-0 group-hover:h-5 group-hover:opacity-60 transition-all duration-200" />
              )}

              <Icon
                className={cn(
                  "relative z-10 h-[22px] w-[22px] shrink-0 transition-colors",
                  isActive ? "text-[#0c0c0f]" : "text-zinc-400 group-hover:text-[#F8B400]"
                )}
              />

              {!isCollapsed && (
                <span className="relative z-10 truncate flex-1">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  className={cn(
                    "relative z-10 px-2 py-0.5 text-xs font-bold rounded-full",
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
    </motion.aside>
  );
}
