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
  RefreshCw,
  ChevronRight,
  FileText,
  MapPin,
  Users,
  TrendingUp,
  Eye,
  Send,
  AlertCircle,
  Package,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   Stat Card
═══════════════════════════════════════════════════════════════ */
function StatCard({
  label, value, icon: Icon, accent, sub, onClick,
}: {
  label: string; value: number | string; icon: React.ElementType;
  accent: string; sub?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-all ${onClick ? "cursor-pointer hover:border-neutral-300" : ""}`}
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">{label}</p>
        <p className="text-3xl font-black text-neutral-900 mt-1 leading-none">{value}</p>
        {sub && <p className="text-xs text-neutral-400 font-medium mt-1.5">{sub}</p>}
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent + "15", border: `1px solid ${accent}25` }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Status Badge
═══════════════════════════════════════════════════════════════ */
function AgencyBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    active:    "bg-emerald-50 text-emerald-700",
    pending:   "bg-amber-50 text-amber-700",
    suspended: "bg-red-50 text-red-700",
    rejected:  "bg-neutral-100 text-neutral-500",
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
    draft:                "bg-neutral-100 text-neutral-500",
    submitted:            "bg-blue-50 text-blue-700",
    under_review:         "bg-indigo-50 text-indigo-700",
    vendor_sourcing:      "bg-purple-50 text-purple-700",
    quotation_preparation:"bg-orange-50 text-orange-700",
    quotation_ready:      "bg-emerald-50 text-emerald-700",
    revision_requested:   "bg-amber-50 text-amber-700",
    quotation_updated:    "bg-teal-50 text-teal-700",
    accepted:             "bg-green-50 text-green-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider capitalize ${m[status] ?? m.draft}`}>
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Dashboard
═══════════════════════════════════════════════════════════════ */
export default function B2BDashboardClient() {
  const queryClient = useQueryClient();
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  /* ── Data queries ── */
  const { data: agencies = [], isLoading: isAgenciesLoading, refetch } = useQuery<B2BAgency[]>({
    queryKey: ["b2bAgencies"],
    queryFn: getB2BAgencies,
  });

  const { data: quotes = [], isLoading: isQuotesLoading } = useQuery<AdminQuoteRequest[]>({
    queryKey: ["adminQuotes"],
    queryFn: () => getAdminQuotes({ pageSize: 50 }),
  });

  /* ── Mutations ── */
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

  /* ── Agency counts ── */
  const total     = agencies.length;
  const active    = agencies.filter((a) => a.status === "active").length;
  const pending   = agencies.filter((a) => a.status === "pending").length;
  const suspended = agencies.filter((a) => a.status === "suspended").length;
  const rejected  = agencies.filter((a) => a.status === "rejected").length;

  /* ── Quote counts ── */
  const totalQuotes     = quotes.length;
  const newQuotes       = quotes.filter((q) => q.status === "submitted").length;
  const underReview     = quotes.filter((q) => ["under_review", "vendor_sourcing", "quotation_preparation"].includes(q.status)).length;
  const quotesReady     = quotes.filter((q) => q.status === "quotation_ready").length;
  const revisionNeeded  = quotes.filter((q) => q.status === "revision_requested").length;
  const accepted        = quotes.filter((q) => q.status === "accepted").length;

  /* ── Filtered agencies ── */
  const filteredAgencies = agencyFilter === "all"
    ? agencies
    : agencies.filter((a) => a.status === agencyFilter);

  /* ── Recent quotes (last 8) ── */
  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Building2 className="text-primary" size={24} /> B2B Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            All agencies, quote requests &amp; custom packages at a glance.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-sm font-bold text-neutral-600 transition-colors shadow-sm"
        >
          <RefreshCw size={13} className={isAgenciesLoading ? "animate-spin" : ""} />
          Refresh · <span className="text-neutral-400 font-medium">{lastRefresh.toLocaleTimeString()}</span>
        </button>
      </div>

      {/* ═══ SECTION 1: Agency Stats ════════════════════════════════ */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
          <Building2 size={12} /> Agency Overview
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total Agencies" value={total}     icon={Building2}    accent="#f59e0b" sub="All partners" onClick={() => setAgencyFilter("all")} />
          <StatCard label="Active"         value={active}    icon={CheckCircle2} accent="#10b981" sub="Live accounts" onClick={() => setAgencyFilter("active")} />
          <StatCard label="Pending"        value={pending}   icon={Clock}        accent="#f59e0b" sub="Awaiting review" onClick={() => setAgencyFilter("pending")} />
          <StatCard label="Suspended"      value={suspended} icon={ShieldAlert}  accent="#ef4444" sub="Blocked" onClick={() => setAgencyFilter("suspended")} />
          <StatCard label="Rejected"       value={rejected}  icon={XCircle}      accent="#94a3b8" sub="Declined" onClick={() => setAgencyFilter("rejected")} />
        </div>
      </div>

      {/* ═══ SECTION 2: Quote Stats ═════════════════════════════════ */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
          <FileText size={12} /> Quote Request Overview
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Quotes"    value={totalQuotes}    icon={FileText}    accent="#6366f1" sub="All requests" />
          <StatCard label="New / Submitted" value={newQuotes}      icon={Send}        accent="#3b82f6" sub="Need review" />
          <StatCard label="In Progress"     value={underReview}    icon={Eye}         accent="#8b5cf6" sub="Active work" />
          <StatCard label="Ready"           value={quotesReady}    icon={CheckCircle2} accent="#10b981" sub="Awaiting agency" />
          <StatCard label="Revision Needed" value={revisionNeeded} icon={AlertCircle} accent="#f59e0b" sub="Agency feedback" />
          <StatCard label="Accepted"        value={accepted}       icon={TrendingUp}  accent="#059669" sub="Closed" />
        </div>
      </div>

      {/* ═══ SECTION 3: Status Distribution Bar ════════════════════ */}
      {total > 0 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-wider text-neutral-500">Agency Status Distribution</p>
            <p className="text-xs text-neutral-400">{total} total</p>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
            {[
              { count: active,    color: "#10b981", label: "Active" },
              { count: pending,   color: "#f59e0b", label: "Pending" },
              { count: suspended, color: "#ef4444", label: "Suspended" },
              { count: rejected,  color: "#94a3b8", label: "Rejected" },
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
              { count: active, color: "#10b981", label: "Active" },
              { count: pending, color: "#f59e0b", label: "Pending" },
              { count: suspended, color: "#ef4444", label: "Suspended" },
              { count: rejected, color: "#94a3b8", label: "Rejected" },
            ].filter((s) => s.count > 0).map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs font-semibold text-neutral-500">{s.label} <strong className="text-neutral-800">({s.count})</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SECTION 4: Two-column split ════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Recent Quote Requests ── */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              <h2 className="font-black text-neutral-800 text-sm">Recent Quote Requests</h2>
            </div>
            <Link href={ROUTES.b2b.agencyDetails} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={11} />
            </Link>
          </div>

          {isQuotesLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {!isQuotesLoading && recentQuotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <FileText size={20} className="text-neutral-400" />
              </div>
              <p className="font-bold text-neutral-500 text-sm">No quote requests yet</p>
              <p className="text-xs text-neutral-400 mt-1">Quote requests from partner agencies will appear here</p>
            </div>
          )}

          {!isQuotesLoading && recentQuotes.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {recentQuotes.map((q) => (
                <div key={q._id} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <MapPin size={13} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-neutral-800 truncate">{q.destination}</p>
                    <p className="text-xs text-neutral-400 font-medium truncate">
                      {q.reference} · {q.adults}A {q.children > 0 ? `${q.children}C` : ""} · {formatDate(q.travelStart)}
                    </p>
                  </div>
                  <QuoteBadge status={q.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Custom Package Requests / Pending Approvals ── */}
        <div className="space-y-4">

          {/* Pending Approvals quick card */}
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <h2 className="font-black text-neutral-800 text-sm">Pending Approvals</h2>
              </div>
              {pending > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {pending} waiting
                </span>
              )}
            </div>

            {isAgenciesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : agencies.filter((a) => a.status === "pending").length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                <p className="text-sm text-neutral-500 font-medium">All caught up! No pending applications.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {agencies.filter((a) => a.status === "pending").slice(0, 5).map((agency) => (
                  <div key={agency._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <Building2 size={13} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-neutral-800 truncate">{agency.companyName}</p>
                      <p className="text-xs text-neutral-400 font-medium truncate">
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
          </div>

          {/* Quote Status Summary */}
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-indigo-500" />
              <h2 className="font-black text-neutral-800 text-sm">Quote Pipeline Summary</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "New Submissions",   count: newQuotes,      color: "bg-blue-500",    bg: "bg-blue-50" },
                { label: "In Progress",        count: underReview,    color: "bg-purple-500",  bg: "bg-purple-50" },
                { label: "Quotation Ready",    count: quotesReady,    color: "bg-emerald-500", bg: "bg-emerald-50" },
                { label: "Revision Requested", count: revisionNeeded, color: "bg-amber-500",   bg: "bg-amber-50" },
                { label: "Accepted",           count: accepted,       color: "bg-green-500",   bg: "bg-green-50" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${row.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${row.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-600">{row.label}</span>
                      <span className="text-xs font-black text-neutral-800">{row.count}</span>
                    </div>
                    <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${row.color} rounded-full transition-all duration-500`}
                        style={{ width: totalQuotes > 0 ? `${(row.count / totalQuotes) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {totalQuotes === 0 && (
                <p className="text-xs text-neutral-400 text-center py-2">No quote data available yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 5: Full Agency List ════════════════════════════ */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">

        {/* List Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-neutral-100 flex-wrap">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <div>
              <h2 className="font-black text-neutral-800 text-sm">All Partner Agencies</h2>
              <p className="text-xs text-neutral-400 font-medium">Click row for quick action · Arrow for full profile</p>
            </div>
          </div>
          {/* Filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "pending", "active", "suspended", "rejected"] as const).map((s) => {
              const count = s === "all" ? total : agencies.filter((a) => a.status === s).length;
              return (
                <button key={s} onClick={() => setAgencyFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    agencyFilter === s
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {s} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {isAgenciesLoading && (
          <div className="flex items-center justify-center py-14">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        )}

        {/* Empty */}
        {!isAgenciesLoading && filteredAgencies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
              <Building2 size={22} className="text-neutral-400" />
            </div>
            <p className="font-bold text-neutral-500 text-sm">No agencies with status: <span className="capitalize">{agencyFilter}</span></p>
            <button onClick={() => setAgencyFilter("all")} className="mt-2 text-xs text-primary font-bold hover:underline">Show all</button>
          </div>
        )}

        {/* Rows */}
        {!isAgenciesLoading && filteredAgencies.length > 0 && (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.2fr_1fr_80px_100px_36px] gap-3 px-5 py-2.5 bg-neutral-50 border-b border-neutral-100 text-[10px] font-black uppercase tracking-wider text-neutral-400">
              <span>Agency</span>
              <span>Type · Country</span>
              <span>Commission</span>
              <span>Registered</span>
              <span>Status</span>
              <span />
            </div>
            <div className="divide-y divide-neutral-100">
              {filteredAgencies.slice(0, 12).map((agency) => (
                <div key={agency._id} className="grid grid-cols-[2fr_1.2fr_1fr_80px_100px_36px] gap-3 px-5 py-3.5 items-center hover:bg-neutral-50 transition-colors">

                  {/* Name */}
                  <div className="min-w-0">
                    <p className="text-sm font-black text-neutral-900 truncate">{agency.companyName}</p>
                    {agency.tradeName && <p className="text-xs text-neutral-400 truncate">DBA: {agency.tradeName}</p>}
                  </div>

                  {/* Type + country */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-600 truncate">{getBusinessTypeLabel(agency.businessType)}</p>
                    <p className="text-xs text-neutral-400 truncate">{agency.country}</p>
                  </div>

                  {/* Commission */}
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                      <Percent size={9} />{agency.commissionRate ?? 0}%
                    </span>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-neutral-400 font-medium">{formatDate(agency.createdAt)}</p>

                  {/* Status + quick action */}
                  <div className="flex items-center gap-1.5">
                    <AgencyBadge status={agency.status} />
                  </div>

                  {/* Action + arrow */}
                  <div className="flex items-center gap-1">
                    {agency.status === "pending" && (
                      <button onClick={() => approveMutation.mutate(agency._id)} disabled={approveMutation.isPending}
                        className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors disabled:opacity-50" title="Approve">
                        <Check size={11} />
                      </button>
                    )}
                    {agency.status === "active" && (
                      <button onClick={() => suspendMutation.mutate(agency._id)} disabled={suspendMutation.isPending}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors disabled:opacity-50" title="Suspend">
                        <ShieldAlert size={11} />
                      </button>
                    )}
                    {(agency.status === "suspended" || agency.status === "rejected") && (
                      <button onClick={() => reactivateMutation.mutate(agency._id)} disabled={reactivateMutation.isPending}
                        className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors disabled:opacity-50" title="Reactivate">
                        <RotateCcw size={11} />
                      </button>
                    )}
                    <Link href={ROUTES.b2b.agencyDetails}
                      className="w-7 h-7 rounded-lg border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors">
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50">
              <p className="text-xs text-neutral-400 font-semibold">
                Showing {Math.min(filteredAgencies.length, 12)} of {filteredAgencies.length} agencies
              </p>
              <Link href={ROUTES.b2b.agencyDetails}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                Full Details <ArrowRight size={11} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
