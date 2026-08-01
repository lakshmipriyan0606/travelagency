"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Copy,
  Download,
  Laptop,
  Smartphone,
  Tablet,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { VisitorDetail } from "../types";
import { PanelCard, EmptyState } from "@/components/dashboard";
import { Button, SimpleSelect } from "@travelagency/ui";

const DEVICE_FILTER_OPTIONS = [
  { value: "all", label: "All devices" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];

interface VisitorTableProps {
  items: VisitorDetail[];
  total: number;
  page: number;
  totalPages: number;
  loading?: boolean;
  search: string;
  deviceFilter: string;
  onSearchChange: (v: string) => void;
  onDeviceFilterChange: (v: string) => void;
  onPageChange: (page: number) => void;
  onViewProfile: (visitor: VisitorDetail) => void;
}

function DeviceIcon({ type }: { type?: string }) {
  if (type === "mobile") return <Smartphone size={14} className="text-purple-400" />;
  if (type === "tablet") return <Tablet size={14} className="text-amber-400" />;
  return <Laptop size={14} className="text-blue-400" />;
}

function shortId(id?: string) {
  if (!id) return "—";
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export function VisitorTable({
  items,
  total,
  page,
  totalPages,
  loading,
  search,
  deviceFilter,
  onSearchChange,
  onDeviceFilterChange,
  onPageChange,
  onViewProfile,
}: VisitorTableProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const rows = useMemo(() => items, [items]);

  const copyId = async (id?: string) => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const exportRow = (v: VisitorDetail) => {
    const blob = new Blob([JSON.stringify(v, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitor-${v.visitorId || "row"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PanelCard icon={Users} title="Recent Visitors">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search visitor, page, country, browser…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#F8B400]/40"
          />
        </div>
        <SimpleSelect
          value={deviceFilter || "all"}
          onChange={(v) => {
            onDeviceFilterChange(v === "all" ? "" : v);
          }}
          options={DEVICE_FILTER_OPTIONS}
          aria-label="Filter by device"
          highlight="gold"
          size="sm"
          className="w-full sm:w-auto min-w-[9.5rem]"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No visitors found"
          description="New visits will appear here once the B2C tracker records traffic."
        />
      ) : (
        <>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-zinc-500 border-b border-white/10">
                  <th className="py-2 px-2 font-bold">Visitor</th>
                  <th className="py-2 px-2 font-bold">Country</th>
                  <th className="py-2 px-2 font-bold">Device</th>
                  <th className="py-2 px-2 font-bold">Browser</th>
                  <th className="py-2 px-2 font-bold">OS</th>
                  <th className="py-2 px-2 font-bold">Page</th>
                  <th className="py-2 px-2 font-bold">Referrer</th>
                  <th className="py-2 px-2 font-bold">Last activity</th>
                  <th className="py-2 px-2 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v, idx) => (
                  <tr
                    key={`${v.visitorId}-${v.date}-${idx}`}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-2.5 px-2">
                      <button
                        type="button"
                        onClick={() => onViewProfile(v)}
                        className="font-mono text-xs text-[#F8B400] hover:underline"
                        title={v.visitorId}
                      >
                        {shortId(v.visitorId)}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-zinc-300 text-xs">
                      {v.country || "—"}
                      {v.city ? (
                        <span className="block text-zinc-600">{v.city}</span>
                      ) : null}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300 capitalize">
                        <DeviceIcon type={v.deviceType} />
                        {v.deviceType || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-xs text-zinc-300">
                      {v.browser || "—"}
                      {v.browserVersion ? (
                        <span className="text-zinc-600"> {v.browserVersion.split(".")[0]}</span>
                      ) : null}
                    </td>
                    <td className="py-2.5 px-2 text-xs text-zinc-300">{v.os || "—"}</td>
                    <td className="py-2.5 px-2 text-xs text-zinc-400 max-w-[140px] truncate" title={v.currentPage || v.path}>
                      {v.currentPage || v.landingPage || v.path || "—"}
                    </td>
                    <td className="py-2.5 px-2 text-xs text-zinc-500 max-w-[120px] truncate" title={v.referrer}>
                      {v.referrer || "Direct"}
                    </td>
                    <td className="py-2.5 px-2 text-xs text-zinc-400 whitespace-nowrap">
                      {v.lastVisit || v.time
                        ? new Date(v.lastVisit || v.time).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="View Profile"
                          onClick={() => onViewProfile(v)}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[#F8B400]"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          title={copied === v.visitorId ? "Copied" : "Copy Visitor ID"}
                          onClick={() => copyId(v.visitorId)}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          title="Export JSON"
                          onClick={() => exportRow(v)}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-zinc-500">
              Showing {rows.length} of {total} · page {page}/{totalPages} · 10 per page
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="text-xs gap-1"
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="text-xs gap-1"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
    </PanelCard>
  );
}
