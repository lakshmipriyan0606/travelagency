/**
 * My Proposals list — custom packages with admin review status
 * (Pending / Approved / Needs Changes — same vocabulary as Quote Requests).
 */
"use client";

import React from "react";
import Link from "next/link";
import {
  PlusCircle,
  Inbox,
  AlertCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Button, AirplaneLoader } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import { ROUTES } from "@/lib/routes";
import { useProposalList, useResubmitProposal } from "../hooks/useProposals";
import { PROPOSAL_STATUS_META } from "../config/proposal.config";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProposalsListClient() {
  const { data: proposals = [], isLoading, isError, refetch, isFetching } =
    useProposalList();
  const resubmitMutation = useResubmitProposal();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F8B400]">
            Custom packages
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            My Proposals
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Saved packages go to B2B Admin for review (Pending → Approved).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/15 text-zinc-300"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              size={16}
              className={cn("mr-2", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
          <Button
            asChild
            className="bg-[#F8B400] text-black hover:bg-[#FFD54A] font-semibold"
          >
            <Link href={ROUTES.customPackage}>
              <PlusCircle size={16} className="mr-2" />
              Create Custom Package
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <AirplaneLoader size="md" label="Loading proposals…" className="py-16" />
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-red-300">Could not load proposals</p>
            <p className="text-sm text-red-300/80 mt-1">
              Check your session and try again.
            </p>
          </div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[var(--ent-card,#16161b)] p-10 text-center space-y-3">
          <Inbox className="mx-auto text-zinc-600" size={36} />
          <p className="text-white font-semibold">No proposals yet</p>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Create a custom package from master cities and hotels to see it here.
          </p>
          <Button
            asChild
            className="bg-[#F8B400] text-black hover:bg-[#FFD54A] font-semibold mt-2"
          >
            <Link href={ROUTES.customPackage}>Create Custom Package</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[var(--ent-card,#16161b)]">
          <p className="sr-only">Table scrolls horizontally on small screens</p>
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Destinations</th>
                <th className="px-4 py-3 font-semibold">Travelers</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => {
                const meta =
                  PROPOSAL_STATUS_META[p.status] ?? PROPOSAL_STATUS_META.draft;
                const destLabel = (p.destinations || [])
                  .map((d) => `${d.cityName} (${d.nights}n)`)
                  .join(" → ");
                const needsChanges = p.status === "revision_requested";
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.05] hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-[#FFD54A]">
                      {p.reference}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 max-w-[240px]">
                      <span className="truncate block">{destLabel || "—"}</span>
                      {needsChanges && p.adminFeedback ? (
                        <p className="text-[11px] text-red-300/90 mt-1 line-clamp-2">
                          Admin: {p.adminFeedback}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {p.tripDetails?.adults ?? 0}A / {p.tripDetails?.children ?? 0}C
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {formatMoney(
                        p.pricing?.total ?? 0,
                        p.pricing?.currency || "USD"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          meta.className
                        )}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {needsChanges ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-[#F8B400]/35 text-[#FFD54A] h-8 text-xs px-2.5"
                          disabled={resubmitMutation.isPending}
                          onClick={() => resubmitMutation.mutate(p.id)}
                        >
                          <RotateCcw size={14} className="mr-1.5" />
                          Resubmit
                        </Button>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
