"use client";

import Link from "next/link";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@travelagency/ui";
import { Badge } from "@/components/ui/Badge";
import { DashboardCard } from "@/components/cards/DashboardCard";
import { GlobeIllustration } from "@/components/common/GlobeIllustration";
import { ROUTES } from "@/lib/routes";

export interface DashboardHeroProps {
  agencyName: string;
  partnerTier: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHero({
  agencyName,
  partnerTier,
  onRefresh,
  isRefreshing,
}: DashboardHeroProps) {
  const tierLabel = partnerTier.charAt(0).toUpperCase() + partnerTier.slice(1) + " Partner";

  return (
    <DashboardCard padding="lg" className="relative overflow-hidden min-h-[180px] bg-[#141417] border border-white/[0.08]">
      {/* Decorative globe — left side, behind welcome copy only */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[min(42%,280px)] hidden sm:block">
        <GlobeIllustration variant="left" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3 max-w-2xl sm:pl-44 lg:max-w-xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#F8B400]/15 text-[#F8B400] border border-[#F8B400]/30 rounded-full">
              {tierLabel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Welcome, {agencyName}
          </h1>
          <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
            Manage your custom quotation pipeline, submit corporate inquiries, and review pricing proposals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
            className="rounded-xl border-white/[0.1] bg-[#1C1C20] hover:bg-[#222226] text-white font-bold h-10 px-4 text-xs"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
            ) : (
              <RefreshCw className="h-4 w-4 text-zinc-300" />
            )}
            Refresh
          </Button>
          <Link href={ROUTES.quoteNew}>
            <Button
              size="sm"
              className="rounded-full h-10 px-5 font-extrabold bg-[#F8B400] hover:bg-[#E8A800] text-black text-xs shadow-[0_4px_20px_rgba(248,180,0,0.35)]"
            >
              <Plus className="h-4 w-4" />
              New Quote Request
            </Button>
          </Link>
        </div>
      </div>
    </DashboardCard>
  );
}
