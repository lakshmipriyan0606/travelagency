"use client";

import React, { useState } from "react";
import { useQuoteList } from "@/features/quote-request/hooks/useQuotes";
import {
  PlusCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Inbox,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { AppShell } from "@/components/layout";
import { QuoteStatus, BudgetCategory } from "@/features/quote-request/types/quote.types";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AirplaneLoader,
} from "@travelagency/ui";

const BUDGET_LABELS: Record<BudgetCategory, string> = {
  [BudgetCategory.ECONOMY]: "Economy",
  [BudgetCategory.STANDARD]: "Standard",
  [BudgetCategory.PREMIUM]: "Premium",
  [BudgetCategory.LUXURY]: "Luxury",
};

const STATUS_THEMES: Record<
  QuoteStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  [QuoteStatus.DRAFT]: {
    bg: "bg-zinc-500/15 border-zinc-500/30",
    text: "text-zinc-300",
    dot: "bg-zinc-400",
    label: "Draft",
  },
  [QuoteStatus.SUBMITTED]: {
    bg: "bg-blue-500/15 border-blue-500/30",
    text: "text-blue-400",
    dot: "bg-blue-500",
    label: "Submitted",
  },
  [QuoteStatus.UNDER_REVIEW]: {
    bg: "bg-violet-500/15 border-violet-500/30",
    text: "text-violet-400",
    dot: "bg-violet-500",
    label: "Under Review",
  },
  [QuoteStatus.VENDOR_SOURCING]: {
    bg: "bg-sky-500/15 border-sky-500/30",
    text: "text-sky-400",
    dot: "bg-sky-500",
    label: "Sourcing Vendors",
  },
  [QuoteStatus.QUOTATION_PREPARATION]: {
    bg: "bg-indigo-500/15 border-indigo-500/30",
    text: "text-indigo-400",
    dot: "bg-indigo-500",
    label: "Preparing Proposal",
  },
  [QuoteStatus.QUOTATION_READY]: {
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
    label: "Ready",
  },
  [QuoteStatus.REVISION_REQUESTED]: {
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-500",
    label: "Revision Requested",
  },
  [QuoteStatus.QUOTATION_UPDATED]: {
    bg: "bg-teal-500/15 border-teal-500/30",
    text: "text-teal-400",
    dot: "bg-teal-500",
    label: "Proposal Updated",
  },
  [QuoteStatus.ACCEPTED]: {
    bg: "bg-green-500/15 border-green-500/30",
    text: "text-green-400",
    dot: "bg-green-500",
    label: "Accepted",
  },
};

function formatStatusLabel(st: QuoteStatus) {
  return st.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function QuotesListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<QuoteStatus | undefined>(undefined);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useQuoteList(page, pageSize, status);

  const handleStatusChange = (val: string) => {
    setStatus(val === "all" ? undefined : (val as QuoteStatus));
    setPage(1);
  };

  const handleLogout = () => {
    document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.location.href = ROUTES.login;
  };

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6 ent-animate-in">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-start gap-3">
            <span className="ent-gold-bar h-12 mt-0.5 shrink-0" aria-hidden />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--ent-text-main,#F4F4F5)]">
                Quotation Pipeline
              </h1>
              <p className="text-xs text-[var(--ent-text-muted,#A1A1AA)] mt-1">
                Manage, filter, and track custom partner quote request proposals.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="rounded-xl">
            <Link href={ROUTES.quoteNew}>
              <PlusCircle size={16} />
              New Quote Request
            </Link>
          </Button>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--ent-card,#16161b)] border border-[var(--ent-border,#2e2e36)] p-4 rounded-2xl ent-card-shadow">
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ent-text-subtle,#71717A)]">
              Filter by:
            </span>
            <Select value={status ?? "all"} onValueChange={handleStatusChange}>
              <SelectTrigger
                size="sm"
                className="w-[220px] text-xs rounded-xl"
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(QuoteStatus).map((st) => (
                  <SelectItem key={st} value={st}>
                    {formatStatusLabel(st)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="text-xs font-bold self-end sm:self-auto border-[#F8B400]/25 text-[#F8B400] hover:bg-[#F8B400]/10"
          >
            <RefreshCw size={12} /> Refresh Table
          </Button>
        </div>

        {/* Content Board */}
        {isLoading ? (
          <AirplaneLoader size="md" label="Loading quotes…" className="py-12" />
        ) : error ? (
          <div className="bg-[var(--ent-card,#16161b)] border border-[var(--ent-border,#2e2e36)] rounded-3xl p-12 text-center text-[var(--ent-text-main,#F4F4F5)] flex flex-col items-center justify-center min-h-[300px] ent-card-shadow">
            <AlertCircle size={32} className="text-[var(--ent-danger,#EF4444)] mb-3" />
            <h3 className="text-base font-bold">Failed to load pipeline</h3>
            <p className="text-xs text-[var(--ent-text-muted,#A1A1AA)] mt-1">
              Check your connectivity to operations server and try again.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-4 text-xs font-bold">
              Retry
            </Button>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="bg-[var(--ent-card,#16161b)] border border-[var(--ent-border,#2e2e36)] rounded-3xl p-12 text-center text-[var(--ent-text-main,#F4F4F5)] flex flex-col items-center justify-center min-h-[300px] ent-card-shadow">
            <Inbox size={32} className="text-[var(--ent-text-subtle,#71717A)] mb-3" />
            <h3 className="text-base font-bold">No quotes found</h3>
            <p className="text-xs text-[var(--ent-text-muted,#A1A1AA)] mt-1">
              There are no quote requests matches for your filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--ent-card,#16161b)] border border-[var(--ent-border,#2e2e36)] rounded-3xl overflow-hidden ent-card-shadow relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[var(--ent-surface,#101014)] text-[var(--ent-text-subtle,#71717A)] uppercase tracking-widest text-[10px] font-bold">
                    <th className="p-4 font-semibold">Reference</th>
                    <th className="p-4 font-semibold">Destination</th>
                    <th className="p-4 font-semibold">Travel Date</th>
                    <th className="p-4 font-semibold">Guests Count</th>
                    <th className="p-4 font-semibold">Budget Category</th>
                    <th className="p-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {data.data.map((q) => {
                    const theme = STATUS_THEMES[q.status] || STATUS_THEMES[QuoteStatus.DRAFT];
                    return (
                      <tr
                        key={q.id}
                        className="hover:bg-[rgba(248,180,0,0.06)] transition group"
                      >
                        <td className="p-4 font-bold text-[var(--ent-text-main,#F4F4F5)] group-hover:text-[#F8B400] transition-colors">
                          {q.reference}
                        </td>
                        <td className="p-4 text-[var(--ent-text-main,#F4F4F5)] font-medium">
                          {q.destination}
                        </td>
                        <td className="p-4 text-[var(--ent-text-muted,#A1A1AA)]">
                          {new Date(q.travelStart).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-[var(--ent-text-muted,#A1A1AA)]">
                          {q.adults} Adults {q.children > 0 && `, ${q.children} Ch`}
                        </td>
                        <td className="p-4 text-[var(--ent-text-muted,#A1A1AA)] font-medium">
                          {BUDGET_LABELS[q.budgetCategory]}
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${theme.bg} ${theme.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                            {theme.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data.total > pageSize && (
              <div className="p-4 border-t border-white/[0.08] flex justify-between items-center bg-[var(--ent-surface,#101014)]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="text-xs font-bold"
                >
                  <ArrowLeft size={12} /> Previous
                </Button>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--ent-text-subtle,#71717A)]">
                  Page {page} of {Math.ceil(data.total / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.hasMore}
                  className="text-xs font-bold"
                >
                  Next <ArrowRight size={12} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
