"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Loader2,
  MapPin,
  MessageSquareWarning,
  Package,
  Send,
  X,
} from "lucide-react";
import { showToast } from "@/lib/toast";
import {
  getAdminProposals,
  updateAdminProposalStatus,
  type AdminCustomProposal,
} from "@/api/b2bAdmin.api";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${currency} ${amount || 0}`;
  }
}

function formatShortDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function ProposalBadge({ status }: { status: string }) {
  const friendly: Record<string, string> = {
    draft: "Draft",
    priced: "Pending",
    saved: "Pending",
    submitted: "Pending",
    under_review: "Approved",
    revision_requested: "Needs Changes",
  };
  const map: Record<string, string> = {
    draft: "bg-white/8 text-white/50 border-white/10",
    priced: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    saved: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    submitted: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    under_review: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    revision_requested: "bg-red-500/15 text-red-300 border-red-500/25",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${map[status] ?? map.draft}`}
    >
      {friendly[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}

function isPendingReview(status: string) {
  return ["submitted", "priced", "saved"].includes(status);
}

function DrawerSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F8B400]/20 border-t-[#F8B400]" />
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

function computeProposalSummary(proposals: AdminCustomProposal[]) {
  return {
    total: proposals.length,
    pending: proposals.filter((p) => isPendingReview(p.status)).length,
    approved: proposals.filter((p) => p.status === "under_review").length,
    needsChanges: proposals.filter((p) => p.status === "revision_requested").length,
  };
}

export default function AgencyCustomPackagesTab({ agencyId }: { agencyId: string }) {
  const qc = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const [commentId, setCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["agencyCustomProposals", agencyId],
    queryFn: () =>
      getAdminProposals({
        agencyId,
        pageSize: 100,
      }),
    enabled: !!agencyId,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes?: string;
    }) => updateAdminProposalStatus(id, status, notes),
    onSuccess: (_data, vars) => {
      showToast({
        type: "success",
        content:
          vars.status === "under_review"
            ? "Proposal approved — agency sees Approved."
            : "Changes requested — agency will see your comment.",
      });
      qc.invalidateQueries({ queryKey: ["agencyCustomProposals", agencyId] });
      qc.invalidateQueries({ queryKey: ["admin-custom-proposals"] });
      setCommentId(null);
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
          "Failed to update proposal status.",
      });
    },
  });

  const summary = useMemo(() => computeProposalSummary(proposals), [proposals]);

  if (isLoading) return <DrawerSpinner />;

  if (proposals.length === 0) {
    return (
      <DrawerEmptyState
        icon={ClipboardList}
        title="No custom packages yet"
        description="When this agency submits a custom package proposal, it will appear here for review."
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: summary.total, icon: Package, accent: "text-white/80" },
          { label: "Pending", value: summary.pending, icon: Send, accent: "text-blue-300" },
          { label: "Approved", value: summary.approved, icon: CheckCircle2, accent: "text-emerald-300" },
          { label: "Needs Changes", value: summary.needsChanges, icon: AlertCircle, accent: "text-red-300" },
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

      <div className="space-y-2 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F8B400]/70">
          {proposals.length} Custom Package{proposals.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-2">
          {proposals.map((p, i) => {
            const destLabel = (p.destinations || [])
              .map((d) => `${d.cityName} (${d.nights}n)`)
              .join(" → ");
            const hotels = (p.destinations || [])
              .map((d) => d.hotelName)
              .filter(Boolean)
              .join(", ");
            const isExpanded = expandedId === p._id;
            const currency = p.pricing?.currency || "USD";

            return (
              <motion.div
                key={p._id}
                id={`agency-proposal-${p._id}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : i * 0.04, duration: 0.25 }}
                className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#171717] hover:border-[#F8B400]/25 hover:bg-[#1a1a1a] transition-colors before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/25 before:to-transparent"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : p._id)}
                  className="w-full text-left p-4"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-[#FFD54A] truncate">{p.reference}</p>
                        <ProposalBadge status={p.status} />
                      </div>
                      <p className="text-xs font-semibold text-white/50 truncate flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-[#F8B400] shrink-0" />
                        {destLabel || "—"}
                      </p>
                    </div>
                    <div className="flex items-start gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-white tabular-nums">
                          {formatMoney(p.pricing?.total ?? 0, currency)}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5">{formatShortDate(p.createdAt)}</p>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-white/35 mt-0.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-white/40">
                    <span>
                      <strong className="text-white/65 font-bold">Guests:</strong>{" "}
                      {p.tripDetails?.adults ?? 0}A
                      {(p.tripDetails?.children ?? 0) > 0 ? ` ${p.tripDetails.children}C` : ""} ·{" "}
                      {p.tripDetails?.rooms ?? 1}R
                    </span>
                    <span>
                      <strong className="text-white/65 font-bold">From:</strong>{" "}
                      {p.tripDetails?.leavingFromName || "—"}
                    </span>
                    <span>
                      <strong className="text-white/65 font-bold">Travel:</strong>{" "}
                      {formatShortDate(p.tripDetails?.leavingOn)}
                    </span>
                    <span className="truncate">
                      <strong className="text-white/65 font-bold">Hotels:</strong> {hotels || "—"}
                    </span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      key="detail"
                      initial={prefersReducedMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={prefersReducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
                        {(p.destinations || []).length > 0 ? (
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#F8B400]/70">
                              Itinerary
                            </p>
                            <div className="space-y-1.5">
                              {(p.destinations || []).map((d, idx) => (
                                <div
                                  key={`${d.cityId}-${idx}`}
                                  className="rounded-lg border border-white/[0.06] bg-[#121212] px-3 py-2 flex items-start justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white/85">
                                      {idx + 1}. {d.cityName}
                                    </p>
                                    <p className="text-[11px] text-white/45 mt-0.5 truncate">
                                      {d.hotelName || "Hotel TBD"}
                                    </p>
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD54A] shrink-0">
                                    {d.nights}n
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="rounded-lg border border-white/[0.06] bg-[#121212] px-3 py-2.5 space-y-1.5">
                          <p className="text-[9px] font-black uppercase tracking-wider text-[#F8B400]/70">
                            Pricing
                          </p>
                          <div className="flex justify-between text-[11px] text-white/45">
                            <span>Subtotal</span>
                            <span className="tabular-nums text-white/70">
                              {formatMoney(p.pricing?.subtotal ?? 0, currency)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-white/45">
                            <span>Transfers</span>
                            <span className="tabular-nums text-white/70">
                              {formatMoney(p.pricing?.transferTotal ?? 0, currency)}
                            </span>
                          </div>
                          {(p.pricing?.breakdown || []).map((row, idx) => (
                            <div
                              key={`${row.label}-${idx}`}
                              className="flex justify-between text-[11px] text-white/45"
                            >
                              <span className="truncate pr-2">{row.label}</span>
                              <span className="tabular-nums text-white/70 shrink-0">
                                {formatMoney(row.amount, currency)}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-white/[0.06]">
                            <span>Total</span>
                            <span className="tabular-nums text-[#FFD54A]">
                              {formatMoney(p.pricing?.total ?? 0, currency)}
                            </span>
                          </div>
                          {p.tripDetails?.includeTransfers != null ? (
                            <p className="text-[10px] text-white/35 pt-0.5">
                              Transfers: {p.tripDetails.includeTransfers ? "Included" : "Not included"}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="px-4 pb-4 space-y-3">
                  {p.adminFeedback ? (
                    <div className="rounded-lg border border-[#F8B400]/25 bg-[#F8B400]/10 px-3 py-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#FFD54A] mb-1">
                        Comment to agency
                      </p>
                      <p className="text-xs text-white/70 leading-relaxed">{p.adminFeedback}</p>
                    </div>
                  ) : null}

                  {(isPendingReview(p.status) || p.status === "under_review") && (
                    <div className="flex flex-wrap gap-2">
                      {isPendingReview(p.status) ? (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: p._id,
                              status: "under_review",
                            })
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          {statusMutation.isPending &&
                          statusMutation.variables?.id === p._id &&
                          statusMutation.variables?.status === "under_review" ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          Approve
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={statusMutation.isPending}
                        onClick={() => {
                          setCommentId(p._id);
                          setCommentText(p.adminFeedback || "");
                        }}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F8B400]/12 px-3 text-[10px] font-black uppercase tracking-wider text-[#FFD54A] border border-[#F8B400]/25 hover:bg-[#F8B400]/20 disabled:opacity-50"
                      >
                        <MessageSquareWarning size={12} />
                        Request Changes
                      </button>
                    </div>
                  )}

                  {p.status === "revision_requested" ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            id: p._id,
                            status: "under_review",
                          })
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        <Check size={12} />
                        Approve
                      </button>
                    </div>
                  ) : null}

                  {commentId === p._id ? (
                    <div className="space-y-2 rounded-xl border border-white/[0.1] bg-[#0A0A0A] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD54A]">
                          Tell the agency what to fix
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCommentId(null);
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
                        placeholder="e.g. Please adjust nights or hotel selection…"
                        className="w-full rounded-lg border border-white/[0.1] bg-[#121212] px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#F8B400]/50"
                      />
                      <button
                        type="button"
                        disabled={statusMutation.isPending || commentText.trim().length < 3}
                        onClick={() =>
                          statusMutation.mutate({
                            id: p._id,
                            status: "revision_requested",
                            notes: commentText.trim(),
                          })
                        }
                        className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FFD54A] to-[#F8B400] text-[10px] font-black uppercase tracking-wider text-black disabled:opacity-50"
                      >
                        {statusMutation.isPending &&
                        statusMutation.variables?.status === "revision_requested" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : null}
                        Send Comment to Agency
                      </button>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
