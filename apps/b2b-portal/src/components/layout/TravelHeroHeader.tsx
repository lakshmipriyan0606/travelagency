"use client";

import { Suspense } from "react";
import { Menu } from "lucide-react";
import { SessionTimer } from "@travelagency/ui";
import { AgencyStatusBadge, type AgencyStatus } from "./AgencyStatusBadge";
import { UserMenu } from "./UserMenu";
import { HeaderGlobalSearch } from "./HeaderGlobalSearch";
import { NotificationBell } from "./NotificationBell";
import { SearchInput } from "@/components/ui/SearchInput";

export interface TravelHeroHeaderProps {
  pageTitle?: string;
  agencyName: string;
  agencyStatus?: AgencyStatus;
  onMenuClick?: () => void;
  onLogout?: () => void;
  sessionCookieName?: string;
  sessionExpiresAt?: number | null;
  onSessionExpired?: () => void;
}

function SearchFallback() {
  return <SearchInput value="" onChange={() => undefined} showClear={false} />;
}

export function TravelHeroHeader({
  pageTitle = "Dashboard",
  agencyName,
  agencyStatus = "active",
  onMenuClick,
  onLogout,
  sessionCookieName,
  sessionExpiresAt,
  onSessionExpired,
}: TravelHeroHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center gap-4 h-auto sm:h-[72px] px-4 sm:px-6 lg:px-8 py-4 sm:py-0 bg-[#0A0A0C] border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)] shrink-0">
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

      <div className="flex-1 max-w-xl mx-auto w-full">
        <Suspense fallback={<SearchFallback />}>
          <HeaderGlobalSearch />
        </Suspense>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
        {(sessionExpiresAt != null || sessionCookieName) && (
          <SessionTimer
            expiresAt={sessionExpiresAt}
            cookieName={sessionCookieName}
            onExpired={onSessionExpired}
          />
        )}

        <AgencyStatusBadge status={agencyStatus} />
        <NotificationBell />
        <UserMenu agencyName={agencyName} onLogout={onLogout} />
      </div>
    </header>
  );
}
