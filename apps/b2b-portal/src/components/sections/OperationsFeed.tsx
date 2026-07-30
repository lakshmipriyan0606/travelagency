"use client";

import { FileText, Send, CheckCircle2, BadgeCheck, RotateCcw, Inbox } from "lucide-react";
import { DashboardCard } from "@/components/cards/DashboardCard";
import type { OperationsFeedItem } from "@/features/dashboard/config/dashboard-ui.config";
import { cn } from "@travelagency/utils";

const FEED_ICONS = [FileText, Send, CheckCircle2, BadgeCheck, RotateCcw];

export interface OperationsFeedProps {
  items?: readonly OperationsFeedItem[];
}

export function OperationsFeed({ items = [] }: OperationsFeedProps) {
  return (
    <DashboardCard className="h-full">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Operations Feed</h2>
        <p className="text-xs text-zinc-500 mt-1">Status updates from your quote pipeline</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Inbox className="h-7 w-7 text-zinc-600 mb-3" aria-hidden />
          <p className="text-sm font-semibold text-zinc-300">No recent activity</p>
          <p className="text-xs text-zinc-500 mt-1">Updates will appear as quotes move through status.</p>
        </div>
      ) : (
        <ul className="space-y-5" role="list" aria-label="Operations activity feed">
          {items.map((item, index) => {
            const Icon = FEED_ICONS[index % FEED_ICONS.length];
            return (
              <li key={item.id} className="flex gap-3 group">
                <div
                  className={cn(
                    "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06]",
                    item.iconBg
                  )}
                >
                  <Icon className={cn("h-4 w-4", item.iconColor)} aria-hidden />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                    <time className="text-[10px] text-zinc-500 shrink-0 whitespace-nowrap">
                      {item.timeAgo}
                    </time>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
