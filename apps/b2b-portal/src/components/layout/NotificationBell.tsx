"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@travelagency/ui";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboard";
import { NOTIFICATION_SEVERITY_META } from "@/features/dashboard/config/dashboard.config";
import {
  NotificationSeverity,
  type ActivityEntry,
  type PortalNotification,
} from "@/features/dashboard/types/dashboard.types";
import { ROUTES } from "@/lib/routes";

const SEVERITY_ICONS = {
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} as const;

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityToNotifications(
  activity: readonly ActivityEntry[]
): PortalNotification[] {
  return activity.slice(0, 8).map((item) => ({
    id: item.id,
    severity: NotificationSeverity.INFO,
    title: item.title,
    message: item.description,
    isRead: false,
    quoteReference: item.quoteReference,
    quoteId: item.quoteId,
    timestamp: item.timestamp,
  }));
}

function resolveNotificationHref(item: PortalNotification): string | null {
  if (item.quoteId) return ROUTES.quoteDetail(item.quoteId);
  if (item.quoteReference) {
    return `${ROUTES.quotes}?search=${encodeURIComponent(item.quoteReference)}`;
  }
  return null;
}

export function NotificationBell() {
  const router = useRouter();
  const { data, isLoading } = useDashboardSummary();

  const notifications = useMemo(() => {
    const fromApi = data?.notifications ?? [];
    if (fromApi.length > 0) return fromApi;
    return activityToNotifications(data?.recentActivity ?? []);
  }, [data?.notifications, data?.recentActivity]);

  const unreadCount = useMemo(() => {
    const apiCount = data?.unreadNotificationCount ?? 0;
    if (apiCount > 0) return apiCount;
    if ((data?.notifications?.length ?? 0) > 0) {
      return notifications.filter((n) => !n.isRead).length;
    }
    return notifications.filter((n) => !n.isRead).length;
  }, [data?.notifications, data?.unreadNotificationCount, notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex items-center justify-center h-10 w-10 rounded-xl border border-white/[0.08] bg-[#141416] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#F8B400]/50"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#0A0A0C]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 border-white/[0.08] bg-[#141416] text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-0 overflow-hidden"
      >
        <DropdownMenuLabel className="px-4 py-3 text-sm font-bold text-white border-b border-white/[0.08]">
          Notifications
        </DropdownMenuLabel>

        {isLoading ? (
          <div className="px-4 py-8 text-center text-xs text-zinc-500">
            Loading updates…
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">All caught up</p>
            <p className="text-xs text-zinc-500 mt-1">
              No new notifications right now.
            </p>
            <Link
              href={ROUTES.quotes}
              className="inline-block mt-3 text-xs font-bold text-[#F8B400] hover:underline"
            >
              View quotation pipeline
            </Link>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto py-1">
            {notifications.map((item) => {
              const meta = NOTIFICATION_SEVERITY_META[item.severity];
              const Icon =
                SEVERITY_ICONS[meta.iconName as keyof typeof SEVERITY_ICONS] ??
                Info;
              const href = resolveNotificationHref(item);

              return (
                <DropdownMenuItem
                  key={item.id}
                  className="cursor-pointer flex items-start gap-3 px-4 py-3 rounded-none focus:bg-white/[0.06] focus:text-white"
                  onSelect={() => {
                    if (href) router.push(href);
                  }}
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.colorClass}`} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-white leading-snug">
                      {item.title}
                    </span>
                    <span className="block text-xs text-zinc-500 mt-0.5 line-clamp-2">
                      {item.message}
                    </span>
                    <span className="block text-[10px] text-zinc-600 mt-1 uppercase tracking-wide">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </span>
                  {!item.isRead && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#F8B400] shrink-0" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator className="bg-white/[0.08] m-0" />
        <DropdownMenuItem
          className="cursor-pointer justify-center py-2.5 text-xs font-bold text-[#F8B400] focus:bg-[#F8B400]/10 focus:text-[#F8B400] rounded-none"
          onSelect={() => router.push(ROUTES.dashboard)}
        >
          Go to dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
