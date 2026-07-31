"use client";

import * as React from "react";
import { Bell, Search, HelpCircle, Plus, LogOut, Loader2, ExternalLink } from "lucide-react";
import { Button } from "./button";
import { SessionTimer } from "./session-timer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface HeaderSearchResult {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
}

export interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  timestamp?: string;
  href?: string;
  isRead?: boolean;
}

export interface HeaderHelpItem {
  label: string;
  description?: string;
  href: string;
  external?: boolean;
}

export interface EnterpriseHeaderProps {
  pageTitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  onSearchSubmit?: (query: string) => void;
  searchResults?: HeaderSearchResult[];
  isSearchLoading?: boolean;
  onSearchResultClick?: (result: HeaderSearchResult) => void;
  notifications?: HeaderNotification[];
  onNotificationClick?: (notification: HeaderNotification) => void;
  onMarkAllNotificationsRead?: () => void;
  helpItems?: HeaderHelpItem[];
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  userProfile?: {
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  actions?: React.ReactNode;
  sessionExpiresAt?: number | null;
  sessionCookieName?: string;
  onSessionExpired?: () => void;
  onLogout?: () => void;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function EnterpriseHeader({
  pageTitle = "Dashboard",
  breadcrumbs = [{ label: "Enterprise", href: "#" }, { label: "Overview" }],
  onSearchChange,
  searchValue = "",
  onSearchSubmit,
  searchResults = [],
  isSearchLoading = false,
  onSearchResultClick,
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsRead,
  helpItems = [],
  onPrimaryAction,
  primaryActionLabel = "+ Action",
  userProfile = { name: "Ops Admin", role: "ADMINISTRATOR" },
  actions,
  sessionExpiresAt,
  sessionCookieName,
  onSessionExpired,
  onLogout,
}: EnterpriseHeaderProps) {
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const showSearchDropdown =
    searchFocused && searchValue.trim().length >= 2 && (isSearchLoading || searchResults.length > 0);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = searchValue.trim();
      if (q) onSearchSubmit?.(q);
      setSearchFocused(false);
    }
    if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-[72px] px-8 bg-[#07070a]/90 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.55)] shrink-0 select-none">
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
          <span className="sr-only">{pageTitle}</span>
        </div>

        <div className="relative w-64 md:w-72 hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search operations, bookings..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search operations"
            aria-expanded={showSearchDropdown}
            aria-haspopup="listbox"
            className="h-10 w-full pl-10 pr-4 rounded-xl border border-white/[0.08] bg-[#101014] text-[14px] text-white placeholder:text-zinc-500 focus:bg-[#16161b] focus:border-[#F8B400] focus:ring-[3px] focus:ring-[#F8B400]/22 outline-none transition-all duration-200"
          />

          {showSearchDropdown && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-white/[0.08] bg-[#121216] shadow-[0_12px_40px_rgba(0,0,0,0.55)] overflow-hidden"
            >
              {isSearchLoading ? (
                <div className="flex items-center gap-2 px-4 py-3 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching…
                </div>
              ) : (
                <>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      role="option"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onSearchResultClick?.(result);
                        setSearchFocused(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-0"
                    >
                      <p className="text-sm font-semibold text-white truncate">{result.label}</p>
                      {result.sublabel && (
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{result.sublabel}</p>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSearchSubmit?.(searchValue.trim());
                      setSearchFocused(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#F8B400] hover:bg-[#F8B400]/10"
                  >
                    View all results for &ldquo;{searchValue.trim()}&rdquo;
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {(sessionExpiresAt != null || sessionCookieName) && (
          <SessionTimer
            expiresAt={sessionExpiresAt}
            cookieName={sessionCookieName}
            onExpired={onSessionExpired}
          />
        )}

        {actions}

        {onPrimaryAction && (
          <Button
            onClick={onPrimaryAction}
            className="h-10 px-4 rounded-full bg-[#F8B400] text-black font-bold hover:bg-[#E8A800] shadow-[0_4px_16px_rgba(248,180,0,0.35)] text-[14px]"
          >
            {primaryActionLabel}
          </Button>
        )}

        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative flex items-center justify-center h-10 w-10 rounded-xl border border-white/[0.08] bg-[#141416] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#F8B400] text-[10px] font-bold text-black ring-2 ring-[#0A0A0C]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-80 p-0 bg-[#121216] border-white/[0.08] text-white rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
              <p className="text-sm font-bold">Notifications</p>
              {unreadCount > 0 && onMarkAllNotificationsRead && (
                <button
                  type="button"
                  onClick={onMarkAllNotificationsRead}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#F8B400] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-zinc-400 text-center">You&apos;re all caught up.</p>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNotificationClick?.(item);
                      if (item.href) setNotificationsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors ${
                      item.isRead ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                      {!item.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#F8B400]" aria-hidden />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.message}</p>
                    {item.timestamp && (
                      <p className="text-[10px] text-zinc-500 mt-1.5">{formatRelativeTime(item.timestamp)}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={helpOpen} onOpenChange={setHelpOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-white/[0.08] bg-[#141416] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label="Help and support"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-72 p-0 bg-[#121216] border-white/[0.08] text-white rounded-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/[0.08]">
              <p className="text-sm font-bold">Help &amp; Support</p>
              <p className="text-xs text-zinc-400 mt-1">Quick links for operations assistance.</p>
            </div>
            <div className="py-1">
              {(helpItems.length > 0 ? helpItems : [
                {
                  label: "Email support",
                  description: "Reach the operations desk",
                  href: "mailto:support@travelhero.com",
                  external: true,
                },
              ]).map((item) => (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => setHelpOpen(false)}
                  className="flex items-start gap-2 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  {item.external && <ExternalLink className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />}
                </a>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 pl-3 border-l border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#F8B400]/50"
              aria-label="Open account menu"
            >
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
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-[#121216] border-white/[0.08] text-white"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">{userProfile.name}</span>
                <span className="text-xs text-zinc-400 uppercase tracking-wide">
                  {userProfile.role || "Administrator"}
                </span>
              </div>
            </DropdownMenuLabel>
            {onLogout && (
              <>
                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
