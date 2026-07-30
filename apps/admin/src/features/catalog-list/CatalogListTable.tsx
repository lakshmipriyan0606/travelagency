"use client";

import Link from "next/link";
import { Edit, Package } from "lucide-react";
import { CatalogSetBestControl } from "./CatalogSetBestControl";
import {
  CatalogItem,
  CatalogListConfig,
  TakenRank,
  getCatalogBestRank,
  getCatalogDestination,
  getCatalogEditHref,
  getCatalogImageUrl,
  getCatalogSecondary,
  getCatalogTitle,
} from "./types";

type Props = {
  items: CatalogItem[];
  config: CatalogListConfig;
  takenRanks: TakenRank[];
  updatingId: string | null;
  onSetRank: (id: string, bestRank: string | null) => void;
};

export function CatalogListTable({
  items,
  config,
  takenRanks,
  updatingId,
  onSetRank,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/40 shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
      <table className="min-w-full divide-y divide-white/[0.06] text-left">
        <thead className="bg-[var(--ent-elevated,#1c1c22)]/70">
          <tr>
            {["Title", config.secondaryColumn, "Destination", "Price", "Best", "Status", "Actions"].map(
              (label) => (
                <th
                  key={label}
                  className={`px-5 py-3.5 text-[11px] font-semibold text-white/55 uppercase tracking-wider ${
                    label === "Actions" ? "text-right" : "text-left"
                  }`}
                >
                  {label}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {items.map((item) => {
            const title = getCatalogTitle(item);
            const imageUrl = getCatalogImageUrl(item);
            const active = item.isActive !== false;
            const bestRank = getCatalogBestRank(item);
            const busy = updatingId === item._id;
            return (
              <tr
                key={item._id}
                className="group hover:bg-white/[0.035] transition-colors duration-150"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.1] ring-1 ring-white/[0.04] flex-shrink-0 flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]">
                      {imageUrl ? (
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-white/30" />
                      )}
                    </div>
                    <div
                      className="font-semibold text-white text-sm leading-snug line-clamp-2 max-w-[240px]"
                      title={title}
                    >
                      {title}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.06] text-white/75 border border-white/[0.08]">
                    {getCatalogSecondary(item, config.mode)}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-white/70">
                  {getCatalogDestination(item)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-white/70 tabular-nums">
                  {item.price != null ? `RM ${item.price}` : "—"}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {bestRank != null ? (
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-[#F8B400]/15 text-[#F8B400] border border-[#F8B400]/30">
                      #{bestRank}
                    </span>
                  ) : (
                    <span className="text-xs text-white/35">—</span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      active
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                        : "bg-white/10 text-white/45 border-white/[0.08]"
                    }`}
                  >
                    {active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <CatalogSetBestControl
                      item={item}
                      config={config}
                      takenRanks={takenRanks}
                      busy={busy}
                      variant="table"
                      onSetRank={(bestRankValue) => onSetRank(item._id, bestRankValue)}
                    />
                    <Link
                      href={getCatalogEditHref(config, item._id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/45 border border-transparent hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/20 transition-all"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
