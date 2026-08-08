"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getB2BAgencies,
  getB2BAgencyStatusLog,
  getAdminQuotesByAgency,
  updateAdminQuoteStatus,
  approveB2BAgency,
  rejectB2BAgency,
  suspendB2BAgency,
  reactivateB2BAgency,
  B2BAgency,
  StatusLogEntry,
  AdminQuoteRequest,
} from "@/api/b2bAdmin.api";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { AirplaneLoader, SimpleSelect } from "@travelagency/ui";
import { showToast } from "@/lib/toast";
import { ROUTES } from "@/lib/routes";
import {
  Building2,
  Briefcase,
  Globe,
  MapPin,
  FileText,
  Percent,
  Calendar,
  ChevronRight,
  Clock,
  ArrowLeftRight,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Check,
  MessageSquareWarning,
  Loader2,
  X,
  ArrowLeft,
  Info,
  Package,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import AgencyCustomPackagesTab from "./AgencyCustomPackagesTab";

/* ── Types ────────────────────────────────────────────────────── */
type AgencySection = "info" | "quotes" | "packages" | "activity" | "status";

/** Custom Packages before Quotes — packages are the primary B2B feature. */
const SECTION_KEYS: AgencySection[] = ["info", "packages", "quotes", "activity", "status"];

function parseSection(raw: string | null): AgencySection | null {
  if (!raw) return null;
  if (raw === "details") return "info";
  if (raw === "log") return "activity";
  if (SECTION_KEYS.includes(raw as AgencySection)) return raw as AgencySection;
  return null;
}

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
    pending: { bg: "bg-[#F8B400]/15", text: "text-[#FFD54A]", dot: "bg-[#F8B400]" },
    suspended: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
    rejected: { bg: "bg-white/8", text: "text-white/50", dot: "bg-white/30" },
  };
  const s = map[status] ?? map.rejected;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/[0.08] ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

/* ── Shared UI helpers ────────────────────────────────────────── */
function SectionCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#171717] shadow-[0_8px_28px_rgba(0,0,0,0.35)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/35 before:to-transparent ${className}`}
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-[#F8B400]/10 border border-[#F8B400]/20 flex items-center justify-center">
            <Icon size={13} className="text-[#F8B400]" />
          </div>
        )}
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F8B400]/80">{title}</p>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

function InfoCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-[#121212] px-3 py-2.5 ${className}`}>
      <p className="text-[9px] font-black uppercase tracking-wider text-white/35">{label}</p>
      <p className="text-sm font-semibold text-white/90 mt-0.5 break-words leading-snug">
        {value ?? <span className="text-white/25 font-medium">—</span>}
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <Icon size={24} className="text-white/25" />
      </div>
      <p className="font-bold text-white/60">{title}</p>
      <p className="text-xs text-white/35 mt-1 max-w-[280px] leading-relaxed">{description}</p>
    </div>
  );
}

function SectionSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F8B400]/20 border-t-[#F8B400]" />
    </div>
  );
}

function QuoteBadge({ status }: { status: string }) {
  const friendly: Record<string, string> = {
    draft: "Draft",
    submitted: "Pending",
    under_review: "Approved",
    vendor_sourcing: "Vendor Sourcing",
    quotation_preparation: "Preparing",
    quotation_ready: "Ready",
    revision_requested: "Needs Changes",
    quotation_updated: "Updated",
    accepted: "Accepted",
  };
  const label = friendly[status] ?? status.replace(/_/g, " ");
  const map: Record<string, string> = {
    draft: "bg-white/8 text-white/50 border-white/10",
    submitted: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    under_review: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    vendor_sourcing: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    quotation_preparation: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    quotation_ready: "bg-teal-500/15 text-teal-300 border-teal-500/25",
    revision_requested: "bg-red-500/15 text-red-300 border-red-500/25",
    quotation_updated: "bg-teal-500/15 text-teal-300 border-teal-500/25",
    accepted: "bg-green-500/15 text-green-300 border-green-500/25",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider capitalize border ${map[status] ?? map.draft}`}
    >
      {label}
    </span>
  );
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function computeQuoteSummary(quotes: AdminQuoteRequest[]) {
  return {
    total: quotes.length,
    submitted: quotes.filter((q) => q.status === "submitted").length,
    inProgress: quotes.filter((q) =>
      ["under_review", "vendor_sourcing", "quotation_preparation"].includes(q.status)
    ).length,
    ready: quotes.filter((q) => q.status === "quotation_ready").length,
    revision: quotes.filter((q) => q.status === "revision_requested").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
  };
}

function getBusinessTypeLabel(type: string) {
  switch (type) {
    case "travel_agency":
      return "Travel Agency";
    case "tour_operator":
      return "Tour Operator";
    case "dmc":
      return "DMC";
    case "freelance_agent":
      return "Freelance Agent";
    default:
      return type;
  }
}

function buildAgencyHref(opts: {
  agencyId?: string;
  section?: AgencySection;
  quoteId?: string | null;
  q?: string;
}) {
  if (!opts.agencyId) {
    const qs = new URLSearchParams();
    if (opts.q) qs.set("q", opts.q);
    const query = qs.toString();
    return query ? `${ROUTES.b2b.agencyDetails}?${query}` : ROUTES.b2b.agencyDetails;
  }
  return ROUTES.b2b.agencyDetail({
    agencyId: opts.agencyId,
    section: opts.section ?? "info",
    quoteId: opts.quoteId ?? undefined,
  });
}

/* ── Info section ─────────────────────────────────────────────── */
function AgencyInfoSection({ agency }: { agency: B2BAgency }) {
  const prefersReducedMotion = useReducedMotion();
  const staggerContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.055,
        delayChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
  };
  const staggerItem: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      };

  const addressLines = [agency.officeAddress.line1, agency.officeAddress.line2].filter(Boolean);
  const addressLocality = [
    agency.officeAddress.city,
    agency.officeAddress.state,
    agency.officeAddress.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  const formattedAddress = [addressLines.join(", "), addressLocality, agency.officeAddress.country]
    .filter(Boolean)
    .join("\n");

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 sm:space-y-5">
      <motion.div
        variants={staggerItem}
        className="relative overflow-hidden rounded-2xl border border-[#F8B400]/25 bg-gradient-to-br from-[#F8B400]/12 via-[#171717] to-[#121212] p-4 sm:p-5 shadow-[0_8px_32px_rgba(248,180,0,0.12)]"
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#F8B400]/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFD54A] via-[#F8B400] to-[#E8A800] flex items-center justify-center shadow-[0_4px_20px_rgba(248,180,0,0.35)]">
            <Percent size={22} className="text-[#0A0A0A]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F8B400]/70">
              Commission Rate
            </p>
            <p className="text-3xl sm:text-4xl font-black text-white tabular-nums">
              {agency.commissionRate ?? 0}
              <span className="text-[#FFD54A] text-2xl sm:text-3xl">%</span>
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <SectionCard title="Business Info" icon={Briefcase}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InfoCell label="Registration No." value={agency.registrationNumber} />
            <InfoCell label="Country" value={agency.country} />
            <InfoCell label="GST Number" value={agency.gstNumber} />
            <InfoCell
              label="Years in Business"
              value={agency.yearsInBusiness != null ? `${agency.yearsInBusiness} yrs` : null}
            />
            <InfoCell label="IATA Number" value={agency.iataNumber} />
            {agency.websiteUrl ? (
              <div className="rounded-xl border border-[#F8B400]/20 bg-[#F8B400]/8 px-3 py-2.5 sm:col-span-2">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#F8B400]/70">Website</p>
                <a
                  href={agency.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#FFD54A] hover:text-white mt-0.5 inline-flex items-center gap-1.5 transition-colors"
                >
                  Visit site <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <InfoCell label="Website" value={null} />
            )}
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={staggerItem}>
        <SectionCard title="Office Address" icon={MapPin}>
          <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-3.5">
            <p className="text-sm font-medium text-white/85 leading-relaxed whitespace-pre-line">
              {formattedAddress || "—"}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {agency.officeAddress.city && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-white/55">
                  <MapPin size={9} className="text-[#F8B400]/70" />
                  {agency.officeAddress.city}
                </span>
              )}
              {agency.officeAddress.state && (
                <span className="inline-flex px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-white/55">
                  {agency.officeAddress.state}
                </span>
              )}
              {agency.officeAddress.postalCode && (
                <span className="inline-flex px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-white/55">
                  {agency.officeAddress.postalCode}
                </span>
              )}
              {agency.officeAddress.country && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F8B400]/10 border border-[#F8B400]/20 text-[10px] font-bold text-[#FFD54A]">
                  <Globe size={9} />
                  {agency.officeAddress.country}
                </span>
              )}
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={staggerItem}>
        <SectionCard title="Timestamps" icon={Calendar}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InfoCell label="Registered On" value={new Date(agency.createdAt).toLocaleString()} />
            <InfoCell label="Last Updated" value={new Date(agency.updatedAt).toLocaleString()} />
          </div>
        </SectionCard>
      </motion.div>

      {agency.rejectionReason && (
        <motion.div variants={staggerItem} className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">
            Rejection Reason
          </p>
          <p className="text-sm font-medium text-red-300/90 leading-relaxed">{agency.rejectionReason}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Quotes section ───────────────────────────────────────────── */
function AgencyQuotesSection({
  agencyId,
  highlightQuoteId,
}: {
  agencyId: string;
  highlightQuoteId?: string | null;
}) {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [commentQuoteId, setCommentQuoteId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const quoteStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      updateAdminQuoteStatus(id, status, notes),
    onSuccess: (_data, vars) => {
      showToast({
        type: "success",
        content:
          vars.status === "under_review"
            ? "Quote approved — agency sees Approved."
            : "Changes requested — agency will see your comment.",
      });
      queryClient.invalidateQueries({ queryKey: ["agencyQuotes", agencyId] });
      queryClient.invalidateQueries({ queryKey: ["adminQuotes"] });
      setCommentQuoteId(null);
      setCommentText("");
    },
    onError: (e: unknown) => {
      const err = e as {
        message?: string;
        response?: { data?: { error?: { message?: string }; message?: string } };
      };
      showToast({
        type: "error",
        content:
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update quote status.",
      });
    },
  });

  const { data: quotes = [], isLoading } = useQuery<AdminQuoteRequest[]>({
    queryKey: ["agencyQuotes", agencyId],
    queryFn: () => getAdminQuotesByAgency(agencyId, { pageSize: 100 }),
    enabled: !!agencyId,
  });

  useEffect(() => {
    if (!highlightQuoteId || isLoading) return;
    const el = document.getElementById(`agency-quote-${highlightQuoteId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightQuoteId, isLoading, quotes.length]);

  const quoteSummary = computeQuoteSummary(quotes);

  if (isLoading) return <SectionSpinner />;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          { label: "Total", value: quoteSummary.total, icon: FileText, accent: "text-white/80" },
          { label: "Pending", value: quoteSummary.submitted, icon: Send, accent: "text-blue-300" },
          { label: "Approved", value: quoteSummary.inProgress, icon: Eye, accent: "text-emerald-300" },
          { label: "Ready", value: quoteSummary.ready, icon: CheckCircle2, accent: "text-teal-300" },
          { label: "Needs Changes", value: quoteSummary.revision, icon: AlertCircle, accent: "text-red-300" },
          { label: "Accepted", value: quoteSummary.accepted, icon: TrendingUp, accent: "text-green-300" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl p-2.5 sm:p-3 border border-white/[0.08] bg-[#171717] hover:border-[#F8B400]/20 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={11} className={stat.accent} />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white/35">
                  {stat.label}
                </span>
              </div>
              <p className={`text-lg sm:text-xl font-black tabular-nums ${stat.accent}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quotes from this agency yet"
          description="Quote requests submitted through the B2B portal will appear here with status and travel details."
        />
      ) : (
        <div className="space-y-2 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F8B400]/70">
            {quotes.length} Quote Request{quotes.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {quotes.map((q, i) => {
              const isHighlighted = highlightQuoteId === q._id;
              return (
                <motion.div
                  key={q._id}
                  id={`agency-quote-${q._id}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : i * 0.04, duration: 0.25 }}
                  className={`relative overflow-hidden rounded-xl border p-4 transition-colors ${
                    isHighlighted
                      ? "bg-[#F8B400]/12 border-[#F8B400]/40 ring-1 ring-[#F8B400]/25"
                      : "bg-[#171717] border-white/[0.08] hover:border-[#F8B400]/25 hover:bg-[#1a1a1a]"
                  } before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/25 before:to-transparent`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white truncate">{q.reference}</p>
                      <p className="text-xs font-semibold text-white/50 truncate flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-[#F8B400] shrink-0" />
                        {q.destination}
                      </p>
                    </div>
                    <QuoteBadge status={q.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-white/40">
                    <span>
                      <strong className="text-white/65 font-bold">Travel:</strong>{" "}
                      {formatShortDate(q.travelStart)} – {formatShortDate(q.travelEnd)}
                    </span>
                    <span>
                      <strong className="text-white/65 font-bold">Guests:</strong> {q.adults}A
                      {q.children > 0 ? ` ${q.children}C` : ""} · {q.rooms}R
                    </span>
                    <span className="capitalize">
                      <strong className="text-white/65 font-bold">Budget:</strong> {q.budgetCategory}
                    </span>
                    <span>
                      <strong className="text-white/65 font-bold">Updated:</strong>{" "}
                      {formatShortDate(q.updatedAt)}
                    </span>
                  </div>
                  {q.adminFeedback ? (
                    <div className="mt-3 rounded-lg border border-[#F8B400]/25 bg-[#F8B400]/10 px-3 py-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#FFD54A] mb-1">
                        Comment to agency
                      </p>
                      <p className="text-xs text-white/70 leading-relaxed">{q.adminFeedback}</p>
                    </div>
                  ) : null}

                  {q.status === "submitted" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={quoteStatusMutation.isPending}
                        onClick={() =>
                          quoteStatusMutation.mutate({ id: q._id, status: "under_review" })
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        {quoteStatusMutation.isPending &&
                        quoteStatusMutation.variables?.id === q._id &&
                        quoteStatusMutation.variables?.status === "under_review" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={quoteStatusMutation.isPending}
                        onClick={() => {
                          setCommentQuoteId(q._id);
                          setCommentText(q.adminFeedback || "");
                        }}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F8B400]/12 px-3 text-[10px] font-black uppercase tracking-wider text-[#FFD54A] border border-[#F8B400]/25 hover:bg-[#F8B400]/20 disabled:opacity-50"
                      >
                        <MessageSquareWarning size={12} />
                        Request Changes
                      </button>
                    </div>
                  ) : null}

                  {q.status === "under_review" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={quoteStatusMutation.isPending}
                        onClick={() => {
                          setCommentQuoteId(q._id);
                          setCommentText(q.adminFeedback || "");
                        }}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F8B400]/12 px-3 text-[10px] font-black uppercase tracking-wider text-[#FFD54A] border border-[#F8B400]/25 hover:bg-[#F8B400]/20 disabled:opacity-50"
                      >
                        <MessageSquareWarning size={12} />
                        Request Changes
                      </button>
                    </div>
                  ) : null}

                  {commentQuoteId === q._id ? (
                    <div className="mt-3 space-y-2 rounded-xl border border-white/[0.1] bg-[#0A0A0A] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD54A]">
                          Tell the agency what to fix
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCommentQuoteId(null);
                            setCommentText("");
                          }}
                          className="text-white/40 hover:text-white"
                          aria-label="Close comment form"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
                        placeholder="e.g. Please update travel dates and guest count…"
                        className="w-full rounded-lg border border-white/[0.1] bg-[#121212] px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#F8B400]/50"
                      />
                      <button
                        type="button"
                        disabled={quoteStatusMutation.isPending || commentText.trim().length < 3}
                        onClick={() =>
                          quoteStatusMutation.mutate({
                            id: q._id,
                            status: "revision_requested",
                            notes: commentText.trim(),
                          })
                        }
                        className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FFD54A] to-[#F8B400] text-[10px] font-black uppercase tracking-wider text-black disabled:opacity-50"
                      >
                        {quoteStatusMutation.isPending &&
                        quoteStatusMutation.variables?.status === "revision_requested" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : null}
                        Send Comment to Agency
                      </button>
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Activity section ─────────────────────────────────────────── */
function AgencyActivitySection({ agencyId }: { agencyId: string }) {
  const prefersReducedMotion = useReducedMotion();
  const { data: logs = [], isLoading } = useQuery<StatusLogEntry[]>({
    queryKey: ["agencyStatusLogs", agencyId],
    queryFn: () => getB2BAgencyStatusLog(agencyId),
    enabled: !!agencyId,
  });

  const staggerContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.055,
        delayChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
  };
  const staggerItem: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      };

  if (isLoading) return <SectionSpinner />;

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No activity yet"
        description="Status transitions will appear here as the agency moves through the approval workflow."
      />
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.p
        variants={staggerItem}
        className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F8B400]/70 mb-4"
      >
        Status History
      </motion.p>
      <div className="relative border-l-2 border-[#F8B400]/25 pl-5 ml-3 space-y-5">
        {logs.map((log) => (
          <motion.div key={log._id} variants={staggerItem} className="relative">
            <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#F8B400] border-2 border-[#121212] shadow-[0_0_8px_rgba(248,180,0,0.4)] flex items-center justify-center">
              <ArrowLeftRight size={8} className="text-[#0A0A0A]" />
            </div>
            <div className="bg-[#171717] border border-white/[0.08] rounded-2xl p-4 space-y-2 hover:border-[#F8B400]/20 transition-colors">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={log.fromStatus} />
                <span className="text-white/30 text-sm">→</span>
                <StatusBadge status={log.toStatus} />
              </div>
              <p className="text-xs text-white/45">
                <span className="font-bold text-white/70">{log.changedBy?.name ?? "System"}</span>
                {" · "}
                {new Date(log.createdAt).toLocaleString()}
              </p>
              {log.reason && (
                <p className="text-xs text-white/55 bg-[#121212] border border-white/[0.06] rounded-xl p-2.5 mt-1 leading-relaxed">
                  {log.reason}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Status section ───────────────────────────────────────────── */
function AgencyStatusSection({ agency }: { agency: B2BAgency }) {
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const [rejectMode, setRejectMode] = useState(false);
  const [reasonText, setReasonText] = useState("");

  const approveMutation = useMutation({
    mutationFn: approveB2BAgency,
    onSuccess: () => {
      showToast({ type: "success", content: "Agency approved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] });
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err?.message || "Failed to approve agency." });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectB2BAgency,
    onSuccess: () => {
      showToast({ type: "success", content: "Agency rejected successfully!" });
      setRejectMode(false);
      setReasonText("");
      queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] });
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err?.message || "Failed to reject agency." });
    }
  });

  const suspendMutation = useMutation({
    mutationFn: suspendB2BAgency,
    onSuccess: () => {
      showToast({ type: "success", content: "Agency suspended successfully!" });
      queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] });
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err?.message || "Failed to suspend agency." });
    }
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateB2BAgency,
    onSuccess: () => {
      showToast({ type: "success", content: "Agency reactivated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] });
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err?.message || "Failed to reactivate agency." });
    }
  });

  const staggerContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.055,
        delayChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
  };
  const staggerItem: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem}>
        <SectionCard title="Current Account Status" icon={ShieldAlert}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-xs font-semibold">Account Status:</span>
                <StatusBadge status={agency.status} />
              </div>
              <p className="text-xs text-white/45 mt-2">
                Last status update: {agency.statusChangedAt ? new Date(agency.statusChangedAt).toLocaleString() : "N/A"}
              </p>
              {agency.status === "rejected" && agency.rejectionReason && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl max-w-xl">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-400">Rejection Reason</p>
                  <p className="text-xs text-red-300 font-medium mt-1">{agency.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {agency.status === "pending" && !rejectMode && (
                <>
                  <button
                    type="button"
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(agency._id)}
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-black uppercase tracking-wider text-white hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md shadow-emerald-950/20 flex items-center gap-1.5"
                  >
                    {approveMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                    <Check size={14} /> Approve Agency
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectMode(true)}
                    className="h-9 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-black uppercase tracking-wider text-red-400 transition-all flex items-center gap-1.5"
                  >
                    <X size={14} /> Reject Agency
                  </button>
                </>
              )}

              {agency.status === "active" && (
                <button
                  type="button"
                  disabled={suspendMutation.isPending}
                  onClick={() => suspendMutation.mutate(agency._id)}
                  className="h-9 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-black uppercase tracking-wider text-red-400 transition-all flex items-center gap-1.5"
                >
                  {suspendMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                  <ShieldAlert size={14} /> Suspend Agency
                </button>
              )}

              {(agency.status === "suspended" || agency.status === "rejected") && (
                <button
                  type="button"
                  disabled={reactivateMutation.isPending}
                  onClick={() => reactivateMutation.mutate(agency._id)}
                  className="h-9 px-4 rounded-xl bg-[#F8B400]/10 hover:bg-[#F8B400]/20 border border-[#F8B400]/25 text-xs font-black uppercase tracking-wider text-[#FFD54A] transition-all flex items-center gap-1.5"
                >
                  {reactivateMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                  <RotateCcw size={14} /> Reactivate Agency
                </button>
              )}
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {rejectMode && (
        <motion.div variants={staggerItem}>
          <SectionCard title="Provide Rejection Reason" icon={MessageSquareWarning}>
            <div className="space-y-4 max-w-2xl">
              <p className="text-xs text-white/50">
                Please enter a descriptive reason. This will be recorded in the status log and visible to team admins.
              </p>
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                rows={4}
                placeholder="Enter rejection reason..."
                className="w-full rounded-xl border border-white/[0.1] bg-[#121212] p-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F8B400]/50"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={rejectMutation.isPending || !reasonText.trim()}
                  onClick={() => rejectMutation.mutate({ id: agency._id, reason: reasonText })}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-xs font-black uppercase tracking-wider text-white hover:from-red-400 hover:to-orange-500 transition-all shadow-md flex items-center gap-1.5"
                >
                  {rejectMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                  Confirm Rejection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectMode(false);
                    setReasonText("");
                  }}
                  className="h-9 px-4 rounded-xl border border-white/[0.1] hover:bg-white/[0.06] text-xs font-bold text-white/70 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <AgencyActivitySection agencyId={agency._id} />
      </motion.div>
    </motion.div>
  );
}

/* ── Full agency detail page ──────────────────────────────────── */
function AgencyDetailPage({
  agency,
  section,
  highlightQuoteId,
  onBack,
  onSectionChange,
}: {
  agency: B2BAgency;
  section: AgencySection;
  highlightQuoteId?: string | null;
  onBack: () => void;
  onSectionChange: (section: AgencySection) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  const sections = [
    { key: "info" as const, label: "Info", icon: Info },
    { key: "packages" as const, label: "Custom Packages", icon: Package },
    { key: "quotes" as const, label: "Quotes", icon: FileText },
    { key: "activity" as const, label: "Activity", icon: Clock },
    { key: "status" as const, label: "Account Status", icon: ShieldAlert },
  ];

  const sectionVariants: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
        },
        exit: { opacity: 0, y: -6, transition: { duration: 0.16 } },
      };

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* Back + page chrome */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-white/[0.12] bg-[#171717] text-sm font-bold text-white/70 hover:text-[#FFD54A] hover:border-[#F8B400]/35 hover:bg-[#F8B400]/8 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to agencies</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.35)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/45 before:to-transparent">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#F8B400]/8 blur-3xl pointer-events-none" />
        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FFD54A]/20 via-[#F8B400]/10 to-transparent border border-[#F8B400]/25 flex items-center justify-center shrink-0">
            <Building2 size={28} className="text-[#F8B400]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={agency.status} />
              <span className="text-[10px] font-black uppercase tracking-wider text-white/35">
                {getBusinessTypeLabel(agency.businessType)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight break-words">
              {agency.companyName}
            </h1>
            {agency.tradeName && (
              <p className="text-sm text-white/45 mt-0.5 break-words">Trading as: {agency.tradeName}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-white/45">
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <MapPin size={12} className="text-[#F8B400]/70 shrink-0" />
                <span className="break-words">{agency.country}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Percent size={12} className="text-[#F8B400]/70 shrink-0" />
                {agency.commissionRate ?? 0}% commission
              </span>
              <span className="font-mono text-white/35 break-all">{agency.registrationNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Icon section rail — horizontal scroll on narrow viewports */}
      <div className="-mx-1 px-1 overflow-x-auto ent-scrollbar">
        <div className="flex items-center justify-start gap-3 sm:gap-6 min-w-0 w-max sm:w-auto sm:flex-wrap py-1">
          {sections.map((item) => {
            const Icon = item.icon;
            const isActive = section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key)}
                aria-pressed={isActive}
                aria-label={item.label}
                className="group flex flex-col items-center gap-2 focus:outline-none shrink-0"
              >
                <span
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-br from-[#FFD54A] via-[#F8B400] to-[#E8A800] text-[#0A0A0A] shadow-[0_0_0_4px_rgba(248,180,0,0.2),0_8px_24px_rgba(248,180,0,0.35)] scale-105"
                      : "bg-[#171717] border border-white/[0.12] text-white/45 group-hover:border-[#F8B400]/40 group-hover:text-[#FFD54A] group-hover:bg-[#F8B400]/8"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} className="sm:h-[22px] sm:w-[22px]" />
                </span>
                <span
                  className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                    isActive ? "text-[#FFD54A]" : "text-white/40 group-hover:text-white/70"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section content */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212] shadow-[0_8px_28px_rgba(0,0,0,0.3)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/30 before:to-transparent">
        <div className="px-4 sm:px-6 py-5 sm:py-6">
          <AnimatePresence mode="wait">
            {section === "info" && (
              <motion.div
                key="info"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AgencyInfoSection agency={agency} />
              </motion.div>
            )}
            {section === "quotes" && (
              <motion.div
                key="quotes"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AgencyQuotesSection agencyId={agency._id} highlightQuoteId={highlightQuoteId} />
              </motion.div>
            )}
            {section === "packages" && (
              <motion.div
                key="packages"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AgencyCustomPackagesTab agencyId={agency._id} />
              </motion.div>
            )}
            {section === "activity" && (
              <motion.div
                key="activity"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AgencyActivitySection agencyId={agency._id} />
              </motion.div>
            )}
            {section === "status" && (
              <motion.div
                key="status"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AgencyStatusSection agency={agency} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Agency list (cards) ──────────────────────────────────────── */
function AgencyListView({
  agencies,
  search,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onOpenAgency,
}: {
  agencies: B2BAgency[];
  search: string;
  onSearchChange: (v: string) => void;
  filterStatus: string;
  onFilterChange: (v: string) => void;
  onOpenAgency: (agency: B2BAgency) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  const filtered = useMemo(() => {
    return agencies.filter((a) => {
      const matchStatus = filterStatus === "all" || a.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.companyName.toLowerCase().includes(q) ||
        a.tradeName?.toLowerCase().includes(q) ||
        a.registrationNumber.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [agencies, filterStatus, search]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
          <Building2 className="text-[#F8B400]" /> Agency Details
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Browse partner agencies, then open a full profile with info, custom packages, quotes &amp; activity.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, registration, country…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.1] bg-[#171717] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F8B400]/25 focus:border-[#F8B400]/40 transition-all"
          />
          <svg
            className="absolute left-3 top-3 text-zinc-500"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <SimpleSelect
          value={filterStatus}
          onChange={onFilterChange}
          aria-label="Filter by agency status"
          placeholder="All Statuses"
          className="w-full sm:w-auto sm:min-w-[10.5rem]"
          options={[
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "pending", label: "Pending" },
            { value: "suspended", label: "Suspended" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#121212]/80 py-16 text-center text-zinc-500 font-medium">
          No agencies match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((agency, i) => (
            <motion.button
              key={agency._id}
              type="button"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : Math.min(i * 0.03, 0.3), duration: 0.25 }}
              onClick={() => onOpenAgency(agency)}
              className="group relative text-left overflow-hidden rounded-2xl border border-white/[0.08] bg-[#171717] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-[#F8B400]/35 hover:bg-[#1a1a1a] hover:shadow-[0_8px_28px_rgba(248,180,0,0.1)] transition-all before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/30 before:to-transparent"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#F8B400]/10 border border-[#F8B400]/20 flex items-center justify-center shrink-0 group-hover:bg-[#F8B400]/15 transition-colors">
                  <Building2 size={18} className="text-[#F8B400]" />
                </div>
                <StatusBadge status={agency.status} />
              </div>

              <h2 className="text-base font-black text-zinc-100 truncate group-hover:text-[#FFD54A] transition-colors">
                {agency.companyName}
              </h2>
              {agency.tradeName ? (
                <p className="text-xs text-zinc-500 mt-0.5 truncate">DBA: {agency.tradeName}</p>
              ) : (
                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                  {getBusinessTypeLabel(agency.businessType)}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-white/55">
                  <MapPin size={9} className="text-[#F8B400]/70" />
                  {agency.country}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#FFD54A] bg-[#F8B400]/12 px-2 py-1 rounded-lg border border-[#F8B400]/20">
                  <Percent size={9} />
                  {agency.commissionRate ?? 0}%
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold text-zinc-500 truncate font-mono">
                  {agency.registrationNumber}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/35 group-hover:text-[#F8B400] transition-colors">
                  Open
                  <ChevronRight size={12} />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-zinc-500 font-semibold text-right">
        Showing {filtered.length} of {agencies.length} agencies
      </p>
    </div>
  );
}

/* ── Main Page Component ──────────────────────────────────────── */
export default function AgencyDetailsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const agencyId = searchParams.get("agencyId");
  const section =
    parseSection(searchParams.get("section")) ??
    parseSection(searchParams.get("tab")) ??
    "info";
  const highlightQuoteId = searchParams.get("quoteId");

  const { data: agencies = [], isLoading } = useQuery<B2BAgency[]>({
    queryKey: ["b2bAgencies"],
    queryFn: getB2BAgencies,
  });

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null) setSearch(q);
  }, [searchParams]);

  const selectedAgency = useMemo(
    () => (agencyId ? agencies.find((a) => a._id === agencyId) ?? null : null),
    [agencies, agencyId]
  );

  const openAgency = (agency: B2BAgency) => {
    router.push(buildAgencyHref({ agencyId: agency._id, section: "info" }));
  };

  const goBackToList = () => {
    const qs = new URLSearchParams();
    if (search) qs.set("q", search);
    const query = qs.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const changeSection = (next: AgencySection) => {
    if (!agencyId) return;
    router.replace(
      buildAgencyHref({
        agencyId,
        section: next,
        quoteId: next === "quotes" ? highlightQuoteId : null,
      }),
      { scroll: false }
    );
  };

  if (isLoading) {
    return <AirplaneLoader size="lg" label="Loading agencies…" fullPage className="h-[60vh]" />;
  }

  // Deep-linked agency that doesn't exist
  if (agencyId && !selectedAgency) {
    return (
      <div className="space-y-5 pb-8">
        <button
          type="button"
          onClick={goBackToList}
          className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-white/[0.12] bg-[#171717] text-sm font-bold text-white/70 hover:text-[#FFD54A] hover:border-[#F8B400]/35 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to agencies
        </button>
        <EmptyState
          icon={Building2}
          title="Agency not found"
          description="This agency may have been removed, or the link is invalid. Return to the list to pick another partner."
        />
      </div>
    );
  }

  if (selectedAgency) {
    return (
      <AgencyDetailPage
        agency={selectedAgency}
        section={section}
        highlightQuoteId={highlightQuoteId}
        onBack={goBackToList}
        onSectionChange={changeSection}
      />
    );
  }

  return (
    <AgencyListView
      agencies={agencies}
      search={search}
      onSearchChange={setSearch}
      filterStatus={filterStatus}
      onFilterChange={setFilterStatus}
      onOpenAgency={openAgency}
    />
  );
}
