"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getB2BAgencies,
  getAdminQuotes,
  approveB2BAgency,
  suspendB2BAgency,
  reactivateB2BAgency,
  B2BAgency,
  AdminQuoteRequest,
} from "@/api/b2bAdmin.api";
import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { showToast } from "@/lib/toast";
import {
  Building2,
  CheckCircle2,
  ShieldAlert,
  Clock,
  XCircle,
  ArrowRight,
  RotateCcw,
  Check,
  Percent,
  ChevronRight,
  FileText,
  Users,
  TrendingUp,
  Eye,
  Send,
  AlertCircle,
  Package,
} from "lucide-react";
import {
  StatCard,
  SectionHeader,
  PanelCard,
  DashboardPageHeader,
  LoadingSpinner,
  EmptyState,
} from "@/components/dashboard";

function getBusinessTypeLabel(type: string) {
  switch (type) {
    case "travel_agency":   return "Travel Agency";
    case "tour_operator":   return "Tour Operator";
    case "dmc":             return "DMC";
    case "freelance_agent": return "Freelance Agent";
    default:                return type;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AgencyBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    active:    "admin-badge-success",
    pending:   "admin-badge-warning",
    suspended: "admin-badge-danger",
    rejected:  "admin-badge-muted",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${m[status] ?? m.rejected}`}>
      {status}
    </span>
  );
}

function QuoteBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  const m: Record<string, string> = {
    draft:                "admin-badge-muted",
    submitted:            "admin-badge-info",
    under_review:         "bg-emerald-500/15 text-emerald-300",
    vendor_sourcing:      "bg-purple-500/15 text-purple-300",
    quotation_preparation:"bg-orange-500/15 text-orange-300",
    quotation_ready:      "admin-badge-success",
    revision_requested:   "bg-red-500/15 text-red-300",
    quotation_updated:    "bg-teal-500/15 text-teal-300",
    accepted:             "admin-badge-success",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider capitalize ${m[status] ?? m.draft}`}>
      {label}
    </span>
  );
}

export default function B2BDashboardClient() {
  const queryClient = useQueryClient();
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: agencies = [], isLoading: isAgenciesLoading, refetch } = useQuery<B2BAgency[]>({
    queryKey: ["b2bAgencies"],
    queryFn: getB2BAgencies,
  });

  const { data: quotes = [], isLoading: isQuotesLoading } = useQuery<AdminQuoteRequest[]>({
    queryKey: ["adminQuotes"],
    queryFn: () => getAdminQuotes({ pageSize: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: approveB2BAgency,
    onSuccess: () => { showToast({ type: "success", content: "Agency approved!" }); queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] }); },
    onError: (e: any) => showToast({ type: "error", content: e?.message || "Failed to approve." }),
  });
  const suspendMutation = useMutation({
    mutationFn: suspendB2BAgency,
    onSuccess: () => { showToast({ type: "success", content: "Agency suspended." }); queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] }); },
    onError: (e: any) => showToast({ type: "error", content: e?.message || "Failed to suspend." }),
  });
  const reactivateMutation = useMutation({
    mutationFn: reactivateB2BAgency,
    onSuccess: () => { showToast({ type: "success", content: "Agency reactivated!" }); queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] }); },
    onError: (e: any) => showToast({ type: "error", content: e?.message || "Failed to reactivate." }),
  });

  const total     = agencies.length;
  const active    = agencies.filter((a) => a.status === "active").length;
  const pending   = agencies.filter((a) => a.status === "pending").length;
  const suspended = agencies.filter((a) => a.status === "suspended").length;
  const rejected  = agencies.filter((a) => a.status === "rejected").length;

  const totalQuotes     = quotes.length;
  const newQuotes       = quotes.filter((q) => q.status === "submitted").length;
  const underReview     = quotes.filter((q) => ["under_review", "vendor_sourcing", "quotation_preparation"].includes(q.status)).length;
  const quotesReady     = quotes.filter((q) => q.status === "quotation_ready").length;
  const revisionNeeded  = quotes.filter((q) => q.status === "revision_requested").length;
  const accepted        = quotes.filter((q) => q.status === "accepted").length;

  const filteredAgencies = agencyFilter === "all"
    ? agencies
    : agencies.filter((a) => a.status === agencyFilter);

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        icon={Building2}
        title="B2B Admin Dashboard"
        subtitle="All agencies, quote requests & custom packages at a glance."
        lastRefresh={lastRefresh}
        isRefreshing={isAgenciesLoading}
        onRefresh={handleRefresh}
      />

      {/* Agency Overview */}
      <div>
        <SectionHeader icon={Building2} title="Agency Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total Agencies" value={total}     icon={Building2}    accent="#f8b400" sub="All partners" onClick={() => setAgencyFilter("all")} />
          <StatCard label="Active"         value={active}    icon={CheckCircle2} accent="#22c55e" sub="Live accounts" onClick={() => setAgencyFilter("active")} />
          <StatCard label="Pending"        value={pending}   icon={Clock}        accent="#f8b400" sub="Awaiting review" onClick={() => setAgencyFilter("pending")} />
          <StatCard label="Suspended"      value={suspended} icon={ShieldAlert}  accent="#ef4444" sub="Blocked" onClick={() => setAgencyFilter("suspended")} />
          <StatCard label="Rejected"       value={rejected}  icon={XCircle}      accent="#a1a1aa" sub="Declined" onClick={() => setAgencyFilter("rejected")} />
        </div>
      </div>

      {/* Quote Request Overview */}
      <div>
        <SectionHeader icon={FileText} title="Quote Request Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Quotes"    value={totalQuotes}    icon={FileText}    accent="#6366f1" sub="All requests" />
          <StatCard label="New / Submitted" value={newQuotes}      icon={Send}        accent="#3b82f6" sub="Need review" />
          <StatCard label="In Progress"     value={underReview}    icon={Eye}         accent="#8b5cf6" sub="Active work" />
          <StatCard label="Ready"           value={quotesReady}    icon={CheckCircle2} accent="#22c55e" sub="Awaiting agency" />
          <StatCard label="Revision Needed" value={revisionNeeded} icon={AlertCircle} accent="#f8b400" sub="Agency feedback" />
          <StatCard label="Accepted"        value={accepted}       icon={TrendingUp}  accent="#059669" sub="Closed" />
        </div>
      </div>

      {/* Agency Status Distribution */}
      {total > 0 && (
        <div className="admin-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Agency Status Distribution</p>
            <p className="text-xs text-zinc-500">{total} total</p>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-white/[0.04]">
            {[
              { count: active,    color: "#22c55e", label: "Active" },
              { count: pending,   color: "#f8b400", label: "Pending" },
              { count: suspended, color: "#ef4444", label: "Suspended" },
              { count: rejected,  color: "#a1a1aa", label: "Rejected" },
            ].filter((s) => s.count > 0).map((s) => (
              <div key={s.label}
                title={`${s.label}: ${s.count}`}
                style={{ width: `${(s.count / total) * 100}%`, background: s.color, minWidth: "4px" }}
                className="rounded-sm transition-all duration-500"
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { count: active, color: "#22c55e", label: "Active" },
              { count: pending, color: "#f8b400", label: "Pending" },
              { count: suspended, color: "#ef4444", label: "Suspended" },
              { count: rejected, color: "#a1a1aa", label: "Rejected" },
            ].filter((s) => s.count > 0).map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs font-semibold text-zinc-400">{s.label} <strong className="text-zinc-100">({s.count})</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PanelCard
          icon={FileText}
          title="Recent Quote Requests"
          viewAllHref={ROUTES.b2b.agencyDetails}
        >
          {isQuotesLoading && <LoadingSpinner className="py-10" />}
          {!isQuotesLoading && recentQuotes.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No quote requests yet"
              description="Quote requests from partner agencies will appear here"
            />
          )}
          {!isQuotesLoading && recentQuotes.length > 0 && (
            <div className="divide-y divide-white/[0.06] -mx-6 -my-6">
              {recentQuotes.map((q) => (
                <Link
                  key={q._id}
                  href={ROUTES.b2b.agencyDetail({ agencyId: q.agencyId, section: 'quotes', quoteId: q._id })}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Building2 size={13} className="text-[#F8B400]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-zinc-100 truncate group-hover:text-[#F8B400] transition-colors">
                      {q.agencyName ?? 'Agency'}
                      {q.agencyTradeName && q.agencyTradeName !== q.agencyName && (
                        <span className="text-zinc-500 font-semibold"> · {q.agencyTradeName}</span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-400 font-medium truncate">
                      {q.destination} · {q.reference}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                      {q.adults}A {q.children > 0 ? `${q.children}C` : ''} · {formatDate(q.travelStart)} – {formatDate(q.travelEnd)}
                    </p>
                  </div>
                  <QuoteBadge status={q.status} />
                  <ChevronRight size={14} className="text-zinc-600 group-hover:text-[#F8B400] shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </PanelCard>

        <div className="space-y-4">
          <PanelCard
            icon={Clock}
            iconClassName="text-[#F8B400]"
            title="Pending Approvals"
            badge={pending > 0 ? (
              <span className="admin-badge-warning text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                {pending} waiting
              </span>
            ) : undefined}
          >
            {isAgenciesLoading ? (
              <LoadingSpinner size="sm" className="py-8" />
            ) : agencies.filter((a) => a.status === "pending").length === 0 ? (
              <div className="flex items-center gap-3 px-1 py-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </div>
                <p className="text-sm text-zinc-400 font-medium">All caught up! No pending applications.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06] -mx-6 -my-6">
                {agencies.filter((a) => a.status === "pending").slice(0, 5).map((agency) => (
                  <div key={agency._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F8B400]/10 border border-[#F8B400]/20 flex items-center justify-center shrink-0">
                      <Building2 size={13} className="text-[#F8B400]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-zinc-100 truncate">{agency.companyName}</p>
                      <p className="text-xs text-zinc-500 font-medium truncate">
                        {getBusinessTypeLabel(agency.businessType)} · {agency.country}
                      </p>
                    </div>
                    <button
                      onClick={() => approveMutation.mutate(agency._id)}
                      disabled={approveMutation.isPending}
                      className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <Check size={10} /> Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>

          <div className="admin-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-[#F8B400]" />
              <h2 className="font-black text-zinc-100 text-sm">Quote Pipeline Summary</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "New Submissions",   count: newQuotes,      color: "bg-blue-500",    bg: "bg-blue-500/10" },
                { label: "In Progress",        count: underReview,    color: "bg-purple-500",  bg: "bg-purple-500/10" },
                { label: "Quotation Ready",    count: quotesReady,    color: "bg-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Revision Requested", count: revisionNeeded, color: "bg-[#F8B400]",   bg: "bg-[#F8B400]/10" },
                { label: "Accepted",           count: accepted,       color: "bg-green-500",   bg: "bg-green-500/10" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${row.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${row.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-zinc-400">{row.label}</span>
                      <span className="text-xs font-black text-zinc-100">{row.count}</span>
                    </div>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${row.color} rounded-full transition-all duration-500`}
                        style={{ width: totalQuotes > 0 ? `${(row.count / totalQuotes) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {totalQuotes === 0 && (
                <p className="text-xs text-zinc-500 text-center py-2">No quote data available yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Agency List */}
      <PanelCard icon={Users} title="All Partner Agencies">
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/[0.06] flex-wrap -mx-6 -mt-6 mb-0">
          <p className="text-xs text-zinc-500 font-medium">Click row for quick action · Arrow for full profile</p>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "pending", "active", "suspended", "rejected"] as const).map((s) => {
              const count = s === "all" ? total : agencies.filter((a) => a.status === s).length;
              return (
                <button key={s} onClick={() => setAgencyFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    agencyFilter === s
                      ? "bg-[#F8B400] text-[#0c0c0f] shadow-sm"
                      : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200"
                  }`}
                >
                  {s} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {isAgenciesLoading && <LoadingSpinner size="lg" className="py-14" />}

        {!isAgenciesLoading && filteredAgencies.length === 0 && (
          <EmptyState
            icon={Building2}
            title={`No agencies with status: ${agencyFilter}`}
            action={
              <button onClick={() => setAgencyFilter("all")} className="mt-2 text-xs text-[#F8B400] font-bold hover:underline">
                Show all
              </button>
            }
            className="py-14"
          />
        )}

        {!isAgenciesLoading && filteredAgencies.length > 0 && (
          <>
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[2fr_1.2fr_1fr_80px_100px_36px] gap-3 px-5 py-2.5 bg-white/[0.03] border-b border-white/[0.06] text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span>Agency</span>
                  <span>Type · Country</span>
                  <span>Commission</span>
                  <span>Registered</span>
                  <span>Status</span>
                  <span />
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {filteredAgencies.slice(0, 12).map((agency) => (
                    <div key={agency._id} className="grid grid-cols-[2fr_1.2fr_1fr_80px_100px_36px] gap-3 px-5 py-3.5 items-center hover:bg-white/[0.03] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-zinc-100 truncate">{agency.companyName}</p>
                        {agency.tradeName && <p className="text-xs text-zinc-500 truncate">DBA: {agency.tradeName}</p>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-300 truncate">{getBusinessTypeLabel(agency.businessType)}</p>
                        <p className="text-xs text-zinc-500 truncate">{agency.country}</p>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs font-black text-[#F8B400] bg-[#F8B400]/10 px-2 py-0.5 rounded-lg">
                          <Percent size={9} />{agency.commissionRate ?? 0}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium">{formatDate(agency.createdAt)}</p>
                      <div className="flex items-center gap-1.5">
                        <AgencyBadge status={agency.status} />
                      </div>
                      <div className="flex items-center gap-1">
                        {agency.status === "pending" && (
                          <button onClick={() => approveMutation.mutate(agency._id)} disabled={approveMutation.isPending}
                            className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 flex items-center justify-center transition-colors disabled:opacity-50" title="Approve">
                            <Check size={11} />
                          </button>
                        )}
                    {agency.status === "active" && (
                      <button onClick={() => suspendMutation.mutate(agency._id)} disabled={suspendMutation.isPending}
                        className="w-7 h-7 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50" title="Suspend">
                        <ShieldAlert size={11} />
                      </button>
                    )}
                    {(agency.status === "suspended" || agency.status === "rejected") && (
                      <button onClick={() => reactivateMutation.mutate(agency._id)} disabled={reactivateMutation.isPending}
                        className="w-7 h-7 rounded-lg bg-[#F8B400]/10 hover:bg-[#F8B400]/20 text-[#F8B400] flex items-center justify-center transition-colors disabled:opacity-50" title="Reactivate">
                        <RotateCcw size={11} />
                      </button>
                    )}
                    <Link href={ROUTES.b2b.agencyDetails}
                      className="w-7 h-7 rounded-lg border border-white/[0.1] hover:bg-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors">
                      <ChevronRight size={12} />
                    </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-white/[0.06] bg-white/[0.02] -mx-4 sm:-mx-6 -mb-6">
              <p className="text-xs text-zinc-500 font-semibold">
                Showing {Math.min(filteredAgencies.length, 12)} of {filteredAgencies.length} agencies
              </p>
              <Link href={ROUTES.b2b.agencyDetails}
                className="flex items-center gap-1 text-xs font-bold text-[#F8B400] hover:underline">
                Full Details <ArrowRight size={11} />
              </Link>
            </div>
          </>
        )}
      </PanelCard>
    </div>
  );
}
