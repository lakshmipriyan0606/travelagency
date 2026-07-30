"use client";

import { Bell, ChevronDown, Menu, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";

export interface TravelHeroHeaderProps {
  pageTitle?: string;
  agencyName: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  notificationCount?: number;
  onMenuClick?: () => void;
}

export function TravelHeroHeader({
  pageTitle = "Dashboard",
  agencyName,
  searchValue,
  onSearchChange,
  notificationCount = 3,
  onMenuClick,
}: TravelHeroHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center gap-4 h-auto sm:h-[72px] px-4 sm:px-6 lg:px-8 py-4 sm:py-0 bg-[#0A0A0C] border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)] shrink-0">
      {/* Left: menu + title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl border border-white/[0.08] bg-[#141416] text-zinc-400 hover:text-white transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-white">{pageTitle}</h1>
      </div>

      {/* Center: search */}
      <div className="flex-1 max-w-xl mx-auto w-full">
        <SearchInput value={searchValue} onChange={onSearchChange} />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
        <Badge variant="success" className="hidden sm:inline-flex gap-1">
          <Plus className="h-3 w-3" aria-hidden />
          Active
        </Badge>

        <button
          type="button"
          className="relative flex items-center justify-center h-10 w-10 rounded-xl border border-white/[0.08] bg-[#141416] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label={`Notifications, ${notificationCount} unread`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#0A0A0C]">
              {notificationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-xl border border-white/[0.08] bg-[#141416] hover:bg-white/[0.04] transition-colors"
          aria-label="User menu"
          aria-haspopup="true"
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#F8B400] to-[#E8A800] text-black font-extrabold text-sm">
            {agencyName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:block text-sm font-semibold text-white max-w-[120px] truncate">
            {agencyName}
          </span>
          <ChevronDown className="hidden md:block h-4 w-4 text-zinc-500" aria-hidden />
        </button>
      </div>
    </header>
  );
}
