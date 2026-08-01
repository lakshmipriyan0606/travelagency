"use client";

import React, { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AirplaneLoader } from "@travelagency/ui";
import { AppShell } from "@/components/layout";
import { DashboardHero } from "@/components/sections/DashboardHero";
import { KpiGrid } from "@/components/sections/KpiGrid";
import { QuotationPipeline } from "@/components/sections/QuotationPipeline";
import { OperationsFeed } from "@/components/sections/OperationsFeed";
import { RevenueChart } from "@/components/sections/RevenueChart";
import { DestinationsChart } from "@/components/sections/DestinationsChart";
import { ConversionChart } from "@/components/sections/ConversionChart";
import { DashboardFooter } from "@/components/common/DashboardFooter";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboard";
import { DASHBOARD_QUERY_KEYS } from "@/features/dashboard/config/dashboard.config";
import { QUOTE_QUERY_KEYS } from "@/features/quote-request/config/quote.config";
import type {
  PipelineRow,
  PipelineStatusLabel,
  OperationsFeedItem,
} from "@/features/dashboard/config/dashboard-ui.config";
import { QuoteStatus, BudgetCategory } from "@/features/quote-request/types/quote.types";
import type { QuoteListItem } from "@/features/quote-request/types/quote.types";
import type { ActivityEntry } from "@/features/dashboard/types/dashboard.types";

/** Same agency-facing labels as Quote Portal list (STATUS_THEMES). */
const STATUS_MAP: Record<QuoteStatus, PipelineStatusLabel> = {
  [QuoteStatus.DRAFT]: "Draft",
  [QuoteStatus.SUBMITTED]: "Pending",
  [QuoteStatus.UNDER_REVIEW]: "Approved",
  [QuoteStatus.VENDOR_SOURCING]: "Sourcing Vendors",
  [QuoteStatus.QUOTATION_PREPARATION]: "Preparing Proposal",
  [QuoteStatus.QUOTATION_READY]: "Ready",
  [QuoteStatus.REVISION_REQUESTED]: "Needs Changes",
  [QuoteStatus.QUOTATION_UPDATED]: "Proposal Updated",
  [QuoteStatus.ACCEPTED]: "Accepted",
};

const BUDGET_LABELS: Record<BudgetCategory, string> = {
  [BudgetCategory.ECONOMY]: "Economy",
  [BudgetCategory.STANDARD]: "Standard",
  [BudgetCategory.PREMIUM]: "Premium",
  [BudgetCategory.LUXURY]: "Luxury",
};

const ACTIVITY_ICON_STYLES: Record<string, { iconColor: string; iconBg: string }> = {
  quote_submitted: { iconColor: "text-blue-400", iconBg: "bg-blue-500/15" },
  quote_under_review: { iconColor: "text-violet-400", iconBg: "bg-violet-500/15" },
  quote_quotation_ready: { iconColor: "text-emerald-400", iconBg: "bg-emerald-500/15" },
  quote_accepted: { iconColor: "text-green-400", iconBg: "bg-green-500/15" },
  quote_revision_requested: { iconColor: "text-orange-400", iconBg: "bg-orange-500/15" },
};

const EMPTY_KPIS = {
  openRequests: 0,
  submittedToday: 0,
  quotesReady: 0,
  acceptedQuotes: 0,
  pendingRevisions: 0,
};

const DEST_COLORS = ["#F8B400", "#3B82F6", "#10B981", "#8B5CF6", "#F97316"];

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function mapQuotesToPipeline(quotes: readonly QuoteListItem[]): PipelineRow[] {
  return quotes.slice(0, 5).map((q) => ({
    id: q.id || (q as { _id?: string })._id || q.reference,
    quoteId: q.reference,
    customer: q.contactPerson?.name || "—",
    destination: q.destination || "—",
    amount: q.budgetCategory ? BUDGET_LABELS[q.budgetCategory] || q.budgetCategory : "—",
    status: STATUS_MAP[q.status] ?? "Draft",
  }));
}

function mapActivityToFeed(items: readonly ActivityEntry[]): OperationsFeedItem[] {
  return items.map((item) => {
    const style = ACTIVITY_ICON_STYLES[item.type] ?? {
      iconColor: "text-zinc-400",
      iconBg: "bg-zinc-500/15",
    };
    return {
      id: item.id,
      title: item.title,
      description: item.quoteReference
        ? `${item.quoteReference} · ${item.description}`
        : item.description,
      timeAgo: formatRelativeTime(item.timestamp),
      iconColor: style.iconColor,
      iconBg: style.iconBg,
    };
  });
}

export default function DashboardClient() {
  const queryClient = useQueryClient();
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const { data, isLoading, isError, isFetching, refetch } = useDashboardSummary();

  const handleRefresh = useCallback(async () => {
    setIsManualRefresh(true);
    try {
      // Invalidate summary (KPIs/charts/pipeline/feed) and quote lists together.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: QUOTE_QUERY_KEYS.all }),
      ]);
    } finally {
      setIsManualRefresh(false);
    }
  }, [queryClient]);

  if (isLoading) {
    return (
      <AirplaneLoader
        size="lg"
        label="Loading dashboard…"
        fullPage
        className="min-h-screen bg-[#0B0E14]"
      />
    );
  }

  if (isError && !data) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white font-bold">Could not load dashboard</p>
        <p className="text-zinc-500 text-sm text-center">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-10 px-5 rounded-xl bg-[#F8B400] text-black text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const agencyName = data?.agency?.agencyName || "Partner Agency";
  const partnerTier = data?.agency?.partnerTier ?? "standard";
  const kpis = data?.kpis ?? EMPTY_KPIS;
  const pipelineRows = mapQuotesToPipeline(data?.recentQuotes ?? []);
  const feedItems = mapActivityToFeed(data?.recentActivity ?? []);
  const destinationData = (data?.destinationStats ?? []).map((d, i) => ({
    name: d.name,
    value: d.percent,
    count: d.count,
    color: DEST_COLORS[i % DEST_COLORS.length],
  }));
  const monthlyVolume = data?.monthlyQuoteVolume ?? [];
  const conversionRate = data?.conversionRate ?? 0;
  const totalQuotes = data?.totalQuotes ?? 0;

  return (
    <AppShell
      agencyName={agencyName}
      partnerTier={partnerTier}
      agencyStatus={data?.agency?.status}
    >
      <div className="space-y-6">
        <DashboardHero
          agencyName={agencyName}
          partnerTier={partnerTier}
          onRefresh={handleRefresh}
          isRefreshing={isManualRefresh || isFetching}
        />

        <KpiGrid kpis={kpis} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <QuotationPipeline rows={pipelineRows} />
          </div>
          <OperationsFeed items={feedItems} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <RevenueChart data={monthlyVolume} />
          <DestinationsChart data={destinationData} totalRequests={totalQuotes} />
          <ConversionChart rate={conversionRate} />
        </div>

        <DashboardFooter />
      </div>
    </AppShell>
  );
}
