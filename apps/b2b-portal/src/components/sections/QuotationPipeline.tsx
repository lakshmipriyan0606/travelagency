"use client";

import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { DashboardCard } from "@/components/cards/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import {
  STATUS_STYLES,
  type PipelineRow,
} from "@/features/dashboard/config/dashboard-ui.config";
import { ROUTES } from "@/lib/routes";
import { cn } from "@travelagency/utils";

export interface QuotationPipelineProps {
  rows?: readonly PipelineRow[];
}

export function QuotationPipeline({ rows = [] }: QuotationPipelineProps) {
  return (
    <DashboardCard className="h-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Recent Quotation Pipeline</h2>
          <p className="text-xs text-zinc-500 mt-1">Track updates, revisions, and status approvals</p>
        </div>
        <Link
          href={ROUTES.quotes}
          className="flex items-center gap-1 text-xs font-semibold text-[#F8B400] hover:text-[#FFD54A] transition-colors shrink-0"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="h-8 w-8 text-zinc-600 mb-3" aria-hidden />
          <p className="text-sm font-semibold text-zinc-300">No quote requests yet</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            Submit a new quote request to see it appear in your pipeline.
          </p>
          <Link
            href={ROUTES.quoteNew}
            className="mt-4 text-xs font-bold text-[#F8B400] hover:underline"
          >
            + New Quote Request
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[560px] text-left" role="table">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Quote ID", "Customer", "Destination", "Budget", "Status"].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500 last:pr-0"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 pr-4 text-sm font-semibold text-[#F8B400]">{row.quoteId}</td>
                  <td className="py-3.5 pr-4 text-sm text-zinc-300">{row.customer}</td>
                  <td className="py-3.5 pr-4 text-sm text-zinc-400">{row.destination}</td>
                  <td className="py-3.5 pr-4 text-sm font-medium text-white tabular-nums">{row.amount}</td>
                  <td className="py-3.5">
                    <Badge
                      variant="default"
                      className={cn("normal-case tracking-normal text-[10px]", STATUS_STYLES[row.status])}
                    >
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
}
