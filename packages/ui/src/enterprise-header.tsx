"use client";

import * as React from "react";
import { Bell, Search, HelpCircle, Plus } from "lucide-react";
import { Button } from "./button";

export interface EnterpriseHeaderProps {
  pageTitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  userProfile?: {
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  actions?: React.ReactNode;
}

export function EnterpriseHeader({
  pageTitle = "Dashboard",
  breadcrumbs = [{ label: "Enterprise", href: "#" }, { label: "Overview" }],
  onSearchChange,
  searchValue = "",
  onPrimaryAction,
  primaryActionLabel = "+ Action",
  userProfile = { name: "Ops Admin", role: "ADMINISTRATOR" },
  actions,
}: EnterpriseHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-[72px] px-8 bg-[#07070a]/90 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.55)] shrink-0 select-none">
      {/* Left: Breadcrumbs & Page Title Context */}
      <div className="flex items-center gap-6 min-w-0">
        <div className="flex flex-col">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-zinc-500">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? "text-white font-bold" : "hover:text-white"}>
                  {item.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Global Search Input */}
        <div className="relative w-64 md:w-72 hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search operations, bookings..."
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="h-10 w-full pl-10 pr-4 rounded-xl border border-white/[0.08] bg-[#101014] text-[14px] text-white placeholder:text-zinc-500 focus:bg-[#16161b] focus:border-[#F8B400] focus:ring-[3px] focus:ring-[#F8B400]/22 outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, User */}
      <div className="flex items-center gap-3 shrink-0">
        {actions}

        {/* Primary Action Button */}
        {onPrimaryAction && (
          <Button
            onClick={onPrimaryAction}
            className="h-10 px-4 rounded-full bg-[#F8B400] text-black font-bold hover:bg-[#E8A800] shadow-[0_4px_16px_rgba(248,180,0,0.35)] text-[14px]"
          >
            {primaryActionLabel}
          </Button>
        )}

        {/* Notifications Icon */}
        <button
          className="relative flex items-center justify-center h-10 w-10 rounded-xl border border-white/[0.08] bg-[#141416] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#F8B400] ring-2 ring-[#0A0A0C]" />
        </button>

        {/* Help Icon */}
        <button
          className="flex items-center justify-center h-10 w-10 rounded-xl border border-white/[0.08] bg-[#141416] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Help & Docs"
        >
          <HelpCircle className="h-4.5 w-4.5" />
        </button>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[14px] font-bold text-white leading-tight">
              {userProfile.name}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#F8B400] uppercase mt-0.5">
              {userProfile.role || "ADMINISTRATOR"}
            </span>
          </div>
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#F8B400] to-[#E8A800] text-black font-extrabold text-sm shadow-[0_0_12px_rgba(248,180,0,0.3)] shrink-0">
            {userProfile.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
