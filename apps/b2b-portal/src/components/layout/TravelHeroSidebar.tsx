"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PRIMARY_NAV,
  type NavLinkItem,
} from "@/features/dashboard/config/dashboard-ui.config";
import { cn } from "@travelagency/utils";

export interface TravelHeroSidebarProps {
  agencyName: string;
  partnerTier: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavItem({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: NavLinkItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  if (item.comingSoon) {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-xl px-3 h-10 text-zinc-500 cursor-not-allowed",
          collapsed && "justify-center px-0"
        )}
        title={collapsed ? item.label : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
          {!collapsed && <span className="text-[13px] font-medium truncate">{item.label}</span>}
        </div>
        {!collapsed && (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md shrink-0">
            Soon
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 h-10 rounded-xl px-3 text-[13px] font-medium transition-all duration-200",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-[#F8B400] text-black font-bold shadow-[0_4px_20px_rgba(248,180,0,0.35)]"
          : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-black" : "")} aria-hidden />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function TravelHeroSidebar({
  agencyName,
  partnerTier,
  collapsed,
  onToggleCollapse,
  onLogout,
  mobileOpen = false,
  onMobileClose,
}: TravelHeroSidebarProps) {
  const pathname = usePathname();
  const tierLabel = partnerTier.charAt(0).toUpperCase() + partnerTier.slice(1) + " Partner";

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 h-[72px] px-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#F8B400] shadow-[0_0_15px_rgba(248,180,0,0.4)] shrink-0">
          <Plane className="h-5 w-5 text-black" aria-hidden />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-base font-bold text-white tracking-tight leading-none">TravelHero</p>
            <p className="text-[10px] font-bold tracking-widest text-[#F8B400] uppercase mt-1">
              B2B Portal
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
        {(() => {
          const hrefs = PRIMARY_NAV.map((i) => i.href);
          const candidates = hrefs.filter(
            (href) =>
              href &&
              href !== "#" &&
              (pathname === href || pathname.startsWith(`${href}/`))
          );
          const activeHref =
            candidates.length === 0
              ? null
              : candidates.reduce((best, href) => (href.length > best.length ? href : best));

          return PRIMARY_NAV.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              isActive={activeHref !== null && item.href === activeHref}
              collapsed={collapsed}
              onNavigate={onMobileClose}
            />
          ));
        })()}
      </nav>

      {/* User card + logout */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0A0A0C] shrink-0 space-y-2">
        <div
          className={cn(
            "p-3 rounded-xl bg-[#141417] border border-white/[0.08]",
            collapsed && "flex justify-center p-2"
          )}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#F8B400]/20 border border-[#F8B400]/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[#F8B400]">
                  {agencyName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-white truncate">{agencyName}</p>
                <p className="text-[11px] text-zinc-500 truncate">{tierLabel}</p>
              </div>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-lg bg-[#F8B400]/20 border border-[#F8B400]/30 flex items-center justify-center">
              <span className="text-sm font-bold text-[#F8B400]">
                {agencyName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className={cn(
                "flex items-center gap-2 h-9 px-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-[12px] font-bold transition-colors flex-1",
                collapsed && "justify-center px-0"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center h-9 w-9 rounded-xl bg-[#141417] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen sticky top-0 z-30 bg-[#0A0A0C] border-r border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.6)] shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={onMobileClose}
              aria-hidden
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-[#0A0A0C] border-r border-white/[0.08] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
