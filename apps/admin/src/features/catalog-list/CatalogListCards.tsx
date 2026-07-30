"use client";

import Link from "next/link";
import { Edit, MapPin, Package } from "lucide-react";
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

export function CatalogListCards({
  items,
  config,
  takenRanks,
  updatingId,
  onSetRank,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {items.map((item) => {
        const title = getCatalogTitle(item);
        const imageUrl = getCatalogImageUrl(item);
        const destination = getCatalogDestination(item);
        const secondary = getCatalogSecondary(item, config.mode);
        const active = item.isActive !== false;
        const price = item.offerPrice ?? item.price;
        const bestRank = getCatalogBestRank(item);
        const busy = updatingId === item._id;

        return (
          <article
            key={item._id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/50 shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-[#F8B400]/35 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent"
          >
            <div className="relative aspect-[16/10] bg-white/[0.03] overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="w-10 h-10 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f]/80 via-transparent to-transparent" />
              <span
                className={`absolute top-3 left-3 inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${
                  active
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                    : "bg-black/50 text-white/60 border-white/15"
                }`}
              >
                {active ? "Active" : "Inactive"}
              </span>
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                {bestRank != null && (
                  <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F8B400] text-black border border-[#F8B400] shadow-[0_0_12px_rgba(248,180,0,0.35)]">
                    Best #{bestRank}
                  </span>
                )}
                <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/55 text-[#F8B400] border border-[#F8B400]/30 backdrop-blur-sm">
                  {secondary}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
              <h3
                className="text-base font-semibold text-white tracking-tight line-clamp-2 leading-snug"
                title={title}
              >
                {title}
              </h3>

              <div className="flex items-center gap-1.5 text-sm text-white/55 min-w-0">
                <MapPin size={14} className="shrink-0 text-[#F8B400]/70" />
                <span className="truncate">{destination}</span>
              </div>

              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-1">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    From
                  </p>
                  <p className="text-lg font-bold text-[#F8B400] tabular-nums">
                    {price != null ? `RM ${price}` : "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <CatalogSetBestControl
                    item={item}
                    config={config}
                    takenRanks={takenRanks}
                    busy={busy}
                    variant="card"
                    onSetRank={(bestRankValue) => onSetRank(item._id, bestRankValue)}
                  />
                  <Link
                    href={getCatalogEditHref(config, item._id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8B400] hover:bg-[#e0a200] text-black px-3.5 py-2 text-xs font-bold transition-colors shadow-[0_0_16px_rgba(248,180,0,0.2)]"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
