"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, ChevronLeft, ChevronRight, X } from "lucide-react";
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
          {!collapsed && (
            <span className="text-[13px] font-medium truncate">{item.label}</span>
          )}
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
      <Icon
        className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-black" : "")}
        aria-hidden
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function TravelHeroSidebar({
  agencyName,
  partnerTier,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: TravelHeroSidebarProps) {
  const pathname = usePathname();
  const tierLabel =
    partnerTier.charAt(0).toUpperCase() + partnerTier.slice(1) + " Partner";

  React.useEffect(() => {
    onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onMobileClose]);

  const renderContent = (
    isCollapsed: boolean,
    opts?: { showDesktopCollapse?: boolean; showMobileClose?: boolean; onNavigate?: () => void }
  ) => {
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
        : candidates.reduce((best, href) =>
            href.length > best.length ? href : best
          );

    return (
      <>
        <div
          className={cn(
            "flex border-b border-white/[0.08] shrink-0",
            isCollapsed
              ? "flex-col items-center gap-2 py-4 px-2"
              : "items-center justify-between h-[72px] px-4"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 min-w-0",
              isCollapsed && "justify-center"
            )}
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#F8B400] shadow-[0_0_15px_rgba(248,180,0,0.4)] shrink-0">
              <Plane className="h-5 w-5 text-black" aria-hidden />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-base font-bold text-white tracking-tight leading-none">
                  TravelHero
                </p>
                <p className="text-[10px] font-bold tracking-widest text-[#F8B400] uppercase mt-1">
                  B2B Portal
                </p>
              </div>
            )}
          </div>

          {opts?.showDesktopCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center h-9 w-9 rounded-xl bg-[#141417] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}

          {opts?.showMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#141417] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
          aria-label="Main navigation"
        >
          {PRIMARY_NAV.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              isActive={activeHref !== null && item.href === activeHref}
              collapsed={isCollapsed}
              onNavigate={opts?.onNavigate}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.08] bg-[#0A0A0C] shrink-0">
          <div
            className={cn(
              "p-3 rounded-xl bg-[#141417] border border-white/[0.08]",
              isCollapsed && "flex justify-center p-2"
            )}
          >
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#F8B400]/20 border border-[#F8B400]/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#F8B400]">
                    {agencyName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-white truncate">
                    {agencyName}
                  </p>
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
        </div>
      </>
    );
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen sticky top-0 z-30 bg-[#0A0A0C] border-r border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.6)] shrink-0"
      >
        {renderContent(collapsed, { showDesktopCollapse: true })}
      </motion.aside>

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
              className="fixed inset-y-0 left-0 z-50 w-[min(260px,85vw)] flex flex-col bg-[#0A0A0C] border-r border-white/[0.08] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              id="portal-mobile-nav"
            >
              {/* Always expanded labels in mobile drawer — ignore desktop collapsed */}
              {renderContent(false, {
                showMobileClose: true,
                onNavigate: onMobileClose,
              })}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
