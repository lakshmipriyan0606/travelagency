"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getB2BAgencies,
  getB2BAgencyStatusLog,
  getAdminQuotesByAgency,
  updateAdminQuoteStatus,
  B2BAgency,
  StatusLogEntry,
  AdminQuoteRequest,
} from "@/api/b2bAdmin.api";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { AirplaneLoader, SimpleSelect } from "@travelagency/ui";
import { showToast } from "@/lib/toast";
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
  Package,
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
} from "lucide-react";

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status, dark = false }: { status: string; dark?: boolean }) {
  const lightMap: Record<string, { bg: string; text: string; dot: string }> = {
    active:    { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
    pending:   { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500" },
    suspended: { bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500" },
    rejected:  { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-400" },
  };
  const darkMap: Record<string, { bg: string; text: string; dot: string }> = {
    active:    { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
    pending:   { bg: "bg-[#F8B400]/15",   text: "text-[#FFD54A]",   dot: "bg-[#F8B400]" },
    suspended: { bg: "bg-red-500/15",     text: "text-red-400",     dot: "bg-red-400" },
    rejected:  { bg: "bg-white/8",        text: "text-white/50",    dot: "bg-white/30" },
  };
  const map = dark ? darkMap : lightMap;
  const s = map[status] ?? map.rejected;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${dark ? "border-white/[0.08]" : ""} ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

/* ── Drawer UI helpers ────────────────────────────────────────── */
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

function DrawerEmptyState({
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
      <p className="text-xs text-white/35 mt-1 max-w-[260px] leading-relaxed">{description}</p>
    </div>
  );
}

function DrawerSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F8B400]/20 border-t-[#F8B400]" />
    </div>
  );
}

type DrawerTab = "details" | "quotes" | "log";

function QuoteBadge({ status, dark = false }: { status: string; dark?: boolean }) {
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
  const lightMap: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-600",
    submitted: "bg-blue-50 text-blue-700",
    under_review: "bg-emerald-50 text-emerald-700",
    vendor_sourcing: "bg-purple-50 text-purple-700",
    quotation_preparation: "bg-orange-50 text-orange-700",
    quotation_ready: "bg-emerald-50 text-emerald-700",
    revision_requested: "bg-red-50 text-red-700",
    quotation_updated: "bg-teal-50 text-teal-700",
    accepted: "bg-green-50 text-green-700",
  };
  const darkMap: Record<string, string> = {
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
  const map = dark ? darkMap : lightMap;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider capitalize border ${map[status] ?? map.draft}`}>
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
    inProgress: quotes.filter((q) => ["under_review", "vendor_sourcing", "quotation_preparation"].includes(q.status)).length,
    ready: quotes.filter((q) => q.status === "quotation_ready").length,
    revision: quotes.filter((q) => q.status === "revision_requested").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
  };
}

/* ── Agency Detail Panel (inline right pane) ──────────────────── */
function AgencyDetailPanel({
  agency,
  onDeselect,
  showBack,
  initialTab = "details",
  highlightQuoteId,
}: {
  agency: B2BAgency;
  onDeselect: () => void;
  showBack?: boolean;
  initialTab?: DrawerTab;
  highlightQuoteId?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab);
  const [commentQuoteId, setCommentQuoteId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const quoteStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes?: string;
    }) => updateAdminQuoteStatus(id, status, notes),
    onSuccess: (_data, vars) => {
      showToast({
        type: "success",
        content:
          vars.status === "under_review"
            ? "Quote approved — agency sees Approved."
            : "Changes requested — agency will see your comment.",
      });
      queryClient.invalidateQueries({ queryKey: ["agencyQuotes", agency?._id] });
      queryClient.invalidateQueries({ queryKey: ["adminQuotes"] });
      setCommentQuoteId(null);
      setCommentText("");
    },
    onError: (e: unknown) => {
      const err = e as { message?: string; response?: { data?: { error?: { message?: string }; message?: string } } };
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

  const selectTab = (tab: DrawerTab) => {
    setActiveTab(tab);
    if (!agency) return;
    const params = new URLSearchParams();
    params.set("agencyId", agency._id);
    if (tab !== "details") params.set("tab", tab);
    if (tab === "quotes" && highlightQuoteId) params.set("quoteId", highlightQuoteId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data: logs = [], isLoading: isLogsLoading } = useQuery<StatusLogEntry[]>({
    queryKey: ["agencyStatusLogs", agency?._id],
    queryFn: () => getB2BAgencyStatusLog(agency!._id),
    enabled: !!agency?._id && activeTab === "log",
  });

  const { data: quotes = [], isLoading: isQuotesLoading } = useQuery<AdminQuoteRequest[]>({
    queryKey: ["agencyQuotes", agency?._id],
    queryFn: () => getAdminQuotesByAgency(agency!._id, { pageSize: 100 }),
    enabled: !!agency?._id && activeTab === "quotes",
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, agency._id]);

  useEffect(() => {
    if (!highlightQuoteId || activeTab !== "quotes" || isQuotesLoading) return;
    const el = document.getElementById(`agency-quote-${highlightQuoteId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightQuoteId, activeTab, isQuotesLoading, quotes.length]);

  const tabVariants: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
        exit: { opacity: 0, y: -6, transition: { duration: 0.16 } },
      };

  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.055, delayChildren: prefersReducedMotion ? 0 : 0.04 } },
  };

  const staggerItem: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
      };

  const quoteSummary = computeQuoteSummary(quotes);

  const tabs = [
    { key: "details" as const, label: "Details", icon: Building2 },
    { key: "quotes" as const, label: "Quotes", icon: FileText },
    { key: "log" as const, label: "Activity", icon: Clock },
  ];

  const addressLines = [
    agency.officeAddress.line1,
    agency.officeAddress.line2,
  ].filter(Boolean);
  const addressLocality = [
    agency.officeAddress.city,
    agency.officeAddress.state,
    agency.officeAddress.postalCode,
  ].filter(Boolean).join(", ");
  const formattedAddress = [addressLines.join(", "), addressLocality, agency.officeAddress.country]
    .filter(Boolean)
    .join("\n");

  return (
    <aside className="h-full min-h-0 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent relative">
          {/* Header */}
          <div className="relative shrink-0 flex items-start gap-3 p-4 sm:p-5 border-b border-white/[0.08] bg-[#0A0A0A] overflow-hidden">
            {showBack && (
              <button
                type="button"
                onClick={onDeselect}
                aria-label="Back to agency list"
                className="lg:hidden w-9 h-9 rounded-xl border border-white/[0.12] hover:bg-white/[0.06] hover:border-[#F8B400]/30 flex items-center justify-center text-white/45 hover:text-[#FFD54A] transition-colors shrink-0 mt-0.5"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <StatusBadge status={agency.status} dark />
                <span className="text-[10px] font-black uppercase tracking-wider text-white/35">
                  {agency.businessType.replace(/_/g, " ")}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight truncate">{agency.companyName}</h2>
              {agency.tradeName && (
                <p className="text-sm text-white/45 mt-0.5 truncate">Trading as: {agency.tradeName}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="shrink-0 flex border-b border-white/[0.08] px-3 sm:px-4 gap-0.5 pt-2 bg-[#121212] overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => selectTab(tab.key)}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-t-xl transition-colors duration-200 whitespace-nowrap ${
                    isActive ? "text-[#FFD54A]" : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="panel-tab-indicator"
                      className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#FFD54A] via-[#F8B400] to-[#E8A800]"
                      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon size={13} className={isActive ? "text-[#F8B400]" : ""} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Body — min-h-0 unlocks flex overflow scroll */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#121212] ent-scrollbar [scrollbar-gutter:stable]">
            <AnimatePresence mode="wait">
              {/* ── DETAILS TAB ───────────────────────────── */}
              {activeTab === "details" && (
                <motion.div
                  key="tab-details"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-4 sm:p-6"
                >
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 sm:space-y-5">
                    {/* Commission highlight */}
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
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F8B400]/70">Commission Rate</p>
                          <p className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                            {agency.commissionRate ?? 0}
                            <span className="text-[#FFD54A] text-2xl sm:text-3xl">%</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Business Info */}
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

                    {/* Office Address */}
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

                    {/* Timestamps */}
                    <motion.div variants={staggerItem}>
                      <SectionCard title="Timestamps" icon={Calendar}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <InfoCell label="Registered On" value={new Date(agency.createdAt).toLocaleString()} />
                          <InfoCell label="Last Updated" value={new Date(agency.updatedAt).toLocaleString()} />
                        </div>
                      </SectionCard>
                    </motion.div>

                    {/* Rejection Reason */}
                    {agency.rejectionReason && (
                      <motion.div
                        variants={staggerItem}
                        className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl"
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">Rejection Reason</p>
                        <p className="text-sm font-medium text-red-300/90 leading-relaxed">{agency.rejectionReason}</p>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* ── QUOTES TAB ────────────────────────────── */}
              {activeTab === "quotes" && (
                <motion.div
                  key="tab-quotes"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 p-4 sm:space-y-5 sm:p-6"
                >
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 sm:space-y-5"
                  >
                    <motion.div variants={staggerItem} className="grid grid-cols-3 gap-2">
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
                              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white/35">{stat.label}</span>
                            </div>
                            <p className={`text-lg sm:text-xl font-black tabular-nums ${stat.accent}`}>{stat.value}</p>
                          </div>
                        );
                      })}
                    </motion.div>

                    <motion.div
                      variants={staggerItem}
                      className="flex items-start gap-3 rounded-xl border border-[#F8B400]/20 bg-[#F8B400]/8 p-3.5"
                    >
                      <Package size={16} className="text-[#F8B400] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-[#FFD54A]">Custom packages — coming soon</p>
                        <p className="text-[11px] text-white/45 mt-0.5 leading-relaxed">
                          Accepted Packages &amp; Create Custom Package are not live in the B2B portal yet. Quote requests below are the active tracking source for this agency.
                        </p>
                      </div>
                    </motion.div>

                    {isQuotesLoading ? (
                      <DrawerSpinner />
                    ) : quotes.length === 0 ? (
                      <DrawerEmptyState
                        icon={FileText}
                        title="No quotes from this agency yet"
                        description="Quote requests submitted through the B2B portal will appear here with status and travel details."
                      />
                    ) : (
                      <motion.div variants={staggerItem} className="space-y-2 pb-4">
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
                                  <QuoteBadge status={q.status} dark />
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-white/40">
                                  <span>
                                    <strong className="text-white/65 font-bold">Travel:</strong>{" "}
                                    {formatShortDate(q.travelStart)} – {formatShortDate(q.travelEnd)}
                                  </span>
                                  <span>
                                    <strong className="text-white/65 font-bold">Guests:</strong>{" "}
                                    {q.adults}A{q.children > 0 ? ` ${q.children}C` : ""} · {q.rooms}R
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
                                        quoteStatusMutation.mutate({
                                          id: q._id,
                                          status: "under_review",
                                        })
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
                                      disabled={
                                        quoteStatusMutation.isPending ||
                                        commentText.trim().length < 3
                                      }
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
                                      quoteStatusMutation.variables?.status ===
                                        "revision_requested" ? (
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
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* ── LOG TAB ───────────────────────────────── */}
              {activeTab === "log" && (
                <motion.div
                  key="tab-log"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="p-4 sm:p-6"
                >
                  {isLogsLoading ? (
                    <DrawerSpinner />
                  ) : logs.length > 0 ? (
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                      <motion.p variants={staggerItem} className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F8B400]/70 mb-4">
                        Status History
                      </motion.p>
                      <div className="relative border-l-2 border-[#F8B400]/25 pl-5 ml-3 space-y-5">
                        {logs.map((log, i) => (
                          <motion.div
                            key={log._id}
                            variants={staggerItem}
                            custom={i}
                            className="relative"
                          >
                            <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#F8B400] border-2 border-[#121212] shadow-[0_0_8px_rgba(248,180,0,0.4)] flex items-center justify-center">
                              <ArrowLeftRight size={8} className="text-[#0A0A0A]" />
                            </div>
                            <div className="bg-[#171717] border border-white/[0.08] rounded-2xl p-4 space-y-2 hover:border-[#F8B400]/20 transition-colors">
                              <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge status={log.fromStatus} dark />
                                <span className="text-white/30 text-sm">→</span>
                                <StatusBadge status={log.toStatus} dark />
                              </div>
                              <p className="text-xs text-white/45">
                                <span className="font-bold text-white/70">{log.changedBy?.name ?? "System"}</span>
                                {" · "}{new Date(log.createdAt).toLocaleString()}
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
                  ) : (
                    <DrawerEmptyState
                      icon={Clock}
                      title="No activity yet"
                      description="Status transitions will appear here as the agency moves through the approval workflow."
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
    </aside>
  );
}

/* ── Business type label ──────────────────────────────────────── */
function getBusinessTypeLabel(type: string) {
  switch (type) {
    case "travel_agency":   return "Travel Agency";
    case "tour_operator":   return "Tour Operator";
    case "dmc":             return "DMC";
    case "freelance_agent": return "Freelance Agent";
    default:                return type;
  }
}

/* ── Main Page Component ──────────────────────────────────────── */
export default function AgencyDetailsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedAgency, setSelectedAgency] = useState<B2BAgency | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("details");
  const [highlightQuoteId, setHighlightQuoteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: agencies = [], isLoading } = useQuery<B2BAgency[]>({
    queryKey: ["b2bAgencies"],
    queryFn: getB2BAgencies,
  });

  // Deep-link: ?agencyId=...&tab=quotes&quoteId=...
  useEffect(() => {
    const agencyId = searchParams.get("agencyId");
    if (!agencyId || agencies.length === 0) return;

    const agency = agencies.find((a) => a._id === agencyId);
    if (agency) {
      setSelectedAgency(agency);
      const tab = searchParams.get("tab");
      if (tab === "quotes" || tab === "log" || tab === "details") {
        setDrawerTab(tab);
      }
      const quoteId = searchParams.get("quoteId");
      setHighlightQuoteId(quoteId);
    }
  }, [searchParams, agencies]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null) setSearch(q);
  }, [searchParams]);

  const openAgency = (agency: B2BAgency, tab: DrawerTab = "details", quoteId?: string) => {
    setSelectedAgency(agency);
    setDrawerTab(tab);
    setHighlightQuoteId(quoteId ?? null);
    const params = new URLSearchParams();
    params.set("agencyId", agency._id);
    if (tab !== "details") params.set("tab", tab);
    if (quoteId) params.set("quoteId", quoteId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const deselectAgency = () => {
    setSelectedAgency(null);
    setHighlightQuoteId(null);
    router.replace(pathname, { scroll: false });
  };

  const filtered = agencies.filter((a) => {
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

  if (isLoading) {
    return <AirplaneLoader size="lg" label="Loading agencies…" fullPage className="h-[60vh]" />;
  }

  return (
    <div className="flex h-[calc(100dvh-12rem)] max-h-[calc(100dvh-12rem)] flex-col overflow-hidden">
      {/* Page Header */}
      <div className="shrink-0 mb-4 sm:mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
          <Building2 className="text-[#F8B400]" /> Agency Details
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Select an agency from the list to view profile, quotes &amp; activity — all inline on this page.
        </p>
      </div>

      {/* Split layout: list (left) + detail panel (right) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(400px,520px)]">
        {/* ── Left: Agency List ─────────────────────────────── */}
        <div
          className={`min-h-0 flex-col ${
            selectedAgency ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Filters */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, registration, country…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.1] bg-[#171717] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F8B400]/25 focus:border-[#F8B400]/40 transition-all"
              />
              <svg className="absolute left-3 top-3 text-zinc-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <SimpleSelect
              value={filterStatus}
              onChange={setFilterStatus}
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

          {/* Table */}
          <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-white/[0.08] bg-[#121212] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
            <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.6fr] gap-3 px-4 py-2.5 bg-[#171717] border-b border-white/[0.06] text-[10px] font-black uppercase tracking-wider text-zinc-500 shrink-0">
              <span>Agency</span>
              <span>Registration / Type</span>
              <span>Country / GST</span>
              <span>Commission</span>
              <span>Status</span>
            </div>

            <div className="flex-1 overflow-y-auto ent-scrollbar overscroll-contain">
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 font-medium">
                  No agencies match your search.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {filtered.map((agency) => {
                    const isSelected = selectedAgency?._id === agency._id;
                    return (
                      <button
                        key={agency._id}
                        type="button"
                        onClick={() => openAgency(agency)}
                        className={`w-full text-left transition-colors group ${
                          isSelected
                            ? "bg-[#F8B400]/10 border-l-2 border-l-[#F8B400]"
                            : "hover:bg-white/[0.03] border-l-2 border-l-transparent"
                        }`}
                      >
                        {/* Desktop row */}
                        <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.6fr] gap-3 px-4 py-3.5 items-center">
                          <div className="min-w-0">
                            <p className={`font-black text-sm truncate transition-colors ${isSelected ? "text-[#FFD54A]" : "text-zinc-100 group-hover:text-[#F8B400]"}`}>
                              {agency.companyName}
                            </p>
                            {agency.tradeName && (
                              <p className="text-xs text-zinc-500 font-medium truncate">DBA: {agency.tradeName}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-300">{agency.registrationNumber}</p>
                            <p className="text-[10px] font-semibold text-zinc-500 mt-0.5">{getBusinessTypeLabel(agency.businessType)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-300">{agency.country}</p>
                            {agency.gstNumber && (
                              <p className="text-[10px] font-semibold text-zinc-500 mt-0.5 truncate">GST: {agency.gstNumber}</p>
                            )}
                          </div>
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-black text-[#FFD54A] bg-[#F8B400]/12 px-2 py-1 rounded-lg border border-[#F8B400]/20">
                              <Percent size={10} />
                              {agency.commissionRate ?? 0}%
                            </span>
                          </div>
                          <div>
                            <StatusBadge status={agency.status} dark />
                          </div>
                        </div>

                        {/* Mobile card */}
                        <div className="md:hidden px-4 py-3.5 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={`font-black text-sm truncate ${isSelected ? "text-[#FFD54A]" : "text-zinc-100"}`}>{agency.companyName}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{agency.country} · {getBusinessTypeLabel(agency.businessType)}</p>
                          </div>
                          <StatusBadge status={agency.status} dark />
                          <ChevronRight size={16} className={`shrink-0 ${isSelected ? "text-[#F8B400]" : "text-zinc-600"}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="shrink-0 px-4 py-2 border-t border-white/[0.06] bg-[#171717]">
              <p className="text-[10px] text-zinc-500 font-semibold text-right">
                Showing {filtered.length} of {agencies.length} agencies
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Detail Panel or Empty State ────────────── */}
        <div
          className={`h-full min-h-0 flex-col ${
            selectedAgency ? "flex" : "hidden lg:flex"
          }`}
        >
          {selectedAgency ? (
            <AgencyDetailPanel
              agency={selectedAgency}
              onDeselect={deselectAgency}
              showBack
              initialTab={drawerTab}
              highlightQuoteId={highlightQuoteId}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-[#121212]/80 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F8B400]/10 border border-[#F8B400]/20 flex items-center justify-center mb-5">
                <Building2 size={28} className="text-[#F8B400]/70" />
              </div>
              <p className="text-lg font-black text-zinc-200">Select an agency to view details</p>
              <p className="text-sm text-zinc-500 mt-2 max-w-[280px] leading-relaxed">
                Choose a row from the list to see profile info, quote requests, and activity history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
