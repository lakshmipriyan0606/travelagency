"use client";

import React, { useState } from "react";
import { useQuoteList } from "@/features/quote-request/hooks/useQuotes";
import { 
  PlusCircle, RefreshCw,
  ArrowLeft, ArrowRight, Inbox,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { AppShell } from "@/components/layout";
import { QuoteStatus, BudgetCategory } from "@/features/quote-request/types/quote.types";
import { Button, Skeleton } from "@travelagency/ui";

const BUDGET_LABELS: Record<BudgetCategory, string> = {
  [BudgetCategory.ECONOMY]: "Economy",
  [BudgetCategory.STANDARD]: "Standard",
  [BudgetCategory.PREMIUM]: "Premium",
  [BudgetCategory.LUXURY]: "Luxury",
};

const STATUS_THEMES: Record<QuoteStatus, { bg: string; text: string; dot: string; label: string }> = {
  [QuoteStatus.DRAFT]: { bg: "bg-neutral-900 border-neutral-800", text: "text-neutral-400", dot: "bg-neutral-500", label: "Draft" },
  [QuoteStatus.SUBMITTED]: { bg: "bg-blue-950/20 border-blue-900/30", text: "text-blue-400", dot: "bg-blue-500", label: "Submitted" },
  [QuoteStatus.UNDER_REVIEW]: { bg: "bg-violet-950/20 border-violet-900/30", text: "text-violet-400", dot: "bg-violet-500", label: "Under Review" },
  [QuoteStatus.VENDOR_SOURCING]: { bg: "bg-sky-950/20 border-sky-900/30", text: "text-sky-400", dot: "bg-sky-500", label: "Sourcing Vendors" },
  [QuoteStatus.QUOTATION_PREPARATION]: { bg: "bg-indigo-950/20 border-indigo-900/30", text: "text-indigo-400", dot: "bg-indigo-500", label: "Preparing Proposal" },
  [QuoteStatus.QUOTATION_READY]: { bg: "bg-emerald-950/20 border-emerald-900/30", text: "text-emerald-400", dot: "bg-emerald-500", label: "Ready" },
  [QuoteStatus.REVISION_REQUESTED]: { bg: "bg-yellow-950/20 border-yellow-900/30", text: "text-yellow-400", dot: "bg-yellow-500", label: "Revision Requested" },
  [QuoteStatus.QUOTATION_UPDATED]: { bg: "bg-teal-950/20 border-teal-900/30", text: "text-teal-400", dot: "bg-teal-500", label: "Proposal Updated" },
  [QuoteStatus.ACCEPTED]: { bg: "bg-green-950/20 border-green-900/30", text: "text-green-400", dot: "bg-green-500", label: "Accepted" },
};

export default function QuotesListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<QuoteStatus | undefined>(undefined);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useQuoteList(page, pageSize, status);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val ? (val as QuoteStatus) : undefined);
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Quotation Pipeline</h1>
            <p className="text-xs text-text-secondary mt-1">Manage, filter, and track custom partner quote request proposals.</p>
          </div>
          <Link href={ROUTES.quoteNew}>
            <Button className="bg-primary-accent hover:bg-amber-400 text-neutral-950 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition shadow-md shadow-primary-accent/15">
              <PlusCircle size={16} />
              New Quote Request
            </Button>
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface border border-border p-4 rounded-2xl">
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Filter by:</span>
            <select
              value={status || ""}
              onChange={handleStatusChange}
              className="bg-white border border-neutral-200 text-xs px-3 py-2 rounded-xl outline-none text-text-primary focus:border-neutral-400 transition"
            >
              <option value="">All Statuses</option>
              {Object.values(QuoteStatus).map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => refetch()} className="text-xs font-bold text-text-secondary hover:text-text-primary flex items-center gap-1.5 self-end sm:self-auto">
            <RefreshCw size={12} /> Refresh Table
          </Button>
        </div>

        {/* Content Board */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-neutral-200 rounded-xl" />
            <Skeleton className="h-12 w-full bg-neutral-200 rounded-xl" />
            <Skeleton className="h-12 w-full bg-neutral-200 rounded-xl" />
          </div>
        ) : error ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-primary flex flex-col items-center justify-center min-h-[300px]">
            <AlertCircle size={32} className="text-red-500 mb-3" />
            <h3 className="text-base font-bold">Failed to load pipeline</h3>
            <p className="text-xs text-text-secondary mt-1">Check your connectivity to operations server and try again.</p>
            <Button onClick={() => refetch()} className="mt-4 bg-neutral-100 border border-neutral-200 text-text-primary text-xs font-bold py-2 px-4 rounded-xl">Retry</Button>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-primary flex flex-col items-center justify-center min-h-[300px]">
            <Inbox size={32} className="text-text-muted mb-3" />
            <h3 className="text-base font-bold">No quotes found</h3>
            <p className="text-xs text-text-secondary mt-1">There are no quote requests matches for your filter criteria.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-neutral-900/10 text-text-secondary uppercase tracking-widest text-[10px] font-bold">
                    <th className="p-4 font-semibold">Reference</th>
                    <th className="p-4 font-semibold">Destination</th>
                    <th className="p-4 font-semibold">Travel Date</th>
                    <th className="p-4 font-semibold">Guests Count</th>
                    <th className="p-4 font-semibold">Budget Category</th>
                    <th className="p-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.data.map((q) => {
                    const theme = STATUS_THEMES[q.status] || STATUS_THEMES[QuoteStatus.DRAFT];
                    return (
                      <tr key={q.id} className="hover:bg-neutral-50 transition group">
                        <td className="p-4 font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                          {q.reference}
                        </td>
                        <td className="p-4 text-text-primary font-medium">{q.destination}</td>
                        <td className="p-4 text-text-secondary">
                          {new Date(q.travelStart).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="p-4 text-text-secondary">
                          {q.adults} Adults {q.children > 0 && `, ${q.children} Ch`}
                        </td>
                        <td className="p-4 text-text-secondary font-medium">
                          {BUDGET_LABELS[q.budgetCategory]}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${theme.bg} ${theme.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
                            {theme.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {data.total > pageSize && (
              <div className="p-4 border-t border-border flex justify-between items-center bg-neutral-900/10">
                <Button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="bg-neutral-950 border border-neutral-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs hover:bg-neutral-800 disabled:opacity-50 transition"
                >
                  <ArrowLeft size={12} className="inline mr-1" /> Previous
                </Button>
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                  Page {page} of {Math.ceil(data.total / pageSize)}
                </span>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.hasMore}
                  className="bg-neutral-950 border border-neutral-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs hover:bg-neutral-800 disabled:opacity-50 transition"
                >
                  Next <ArrowRight size={12} className="inline ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
