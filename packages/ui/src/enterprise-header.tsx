"use client";

import * as React from "react";
import { Bell, Search, HelpCircle, Plus } from "lucide-react";
import { Button } from "./button";

export interface EnterpriseHeaderProps {
  pageTitle?: string;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userProfile?: {
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  actions?: React.ReactNode;
}

export function EnterpriseHeader({
  pageTitle = "Dashboard",
  onSearchChange,
  searchValue = "",
  onPrimaryAction,
  primaryActionLabel = "+ New Booking",
  activeTab = "Dashboard",
  onTabChange,
  userProfile = { name: "Ops Admin", role: "ENTERPRISE ACCESS" },
  actions,
}: EnterpriseHeaderProps) {
  const tabs = ["Dashboard", "Inventory", "Analytics", "Settings"];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-[76px] px-6 bg-[#0A0A0C] border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)] shrink-0 select-none">
      {/* Left: Global Search Input */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative w-64 md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search operations, bookings,..."
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="h-10 w-full pl-10 pr-4 rounded-xl border border-white/[0.08] bg-[#141416] text-[13px] text-white placeholder:text-zinc-500 focus:bg-[#18181A] focus:border-[#F8B400] focus:ring-2 focus:ring-[#F8B400]/30 outline-none transition-all duration-150 shadow-inner"
          />
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-6 h-full">
        {tabs.map((tab) => {
          const isActive = (activeTab || pageTitle).toLowerCase() === tab.toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => onTabChange && onTabChange(tab)}
              className={`relative h-full flex items-center px-1 text-[14px] font-bold transition-colors cursor-pointer ${
                isActive ? "text-[#F8B400]" : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F8B400] rounded-t-full shadow-[0_0_8px_#F8B400]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Actions, New Booking, Notifications, User */}
      <div className="flex items-center gap-3 shrink-0">
        {actions}

        {/* Primary Action Button */}
        {onPrimaryAction && (
          <Button
            onClick={onPrimaryAction}
            className="h-10 px-5 rounded-full bg-[#F8B400] text-black font-bold hover:bg-[#FFD54A] shadow-[0_4px_16px_rgba(248,180,0,0.35)] text-[13px]"
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
            <span className="text-[13px] font-bold text-white leading-tight">
              {userProfile.name}
            </span>
            <span className="text-[9px] font-extrabold tracking-widest text-[#F8B400] uppercase mt-0.5">
              {userProfile.role || "ENTERPRISE ACCESS"}
            </span>
          </div>
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#F8B400] to-[#E8A800] text-black font-black text-base shadow-[0_0_12px_rgba(248,180,0,0.3)] shrink-0">
            {userProfile.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
