"use client";

import {
  ArrowUp,
  ArrowDown,
  Star,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Review } from "../validation/review.schema";

interface Props {
  reviews: Review[];
  onMove: (id: string, direction: "up" | "down") => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ReviewListCards({ reviews, onMove, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {reviews.map((review, index) => {
        const isPublished = review.status === "Published";

        return (
          <article
            key={review._id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/50 shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-[#F8B400]/35 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent"
          >
            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  {review.profileImage?.url ? (
                    <img
                      src={review.profileImage.url}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-[#F8B400]/35 ring-2 ring-[#F8B400]/15"
                      alt={review.name}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex-shrink-0 bg-white/[0.06] border border-[#F8B400]/25 ring-2 ring-[#F8B400]/10 flex items-center justify-center text-[#F8B400] text-sm font-bold">
                      {review.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm tracking-tight leading-snug truncate">
                      {review.name}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-white/55 mt-0.5">
                      <MapPin size={12} className="text-[#F8B400]/70 shrink-0" />
                      <span className="truncate">{review.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F8B400] text-black border border-[#F8B400] shadow-[0_0_12px_rgba(248,180,0,0.35)]">
                    #{review.orderNumber}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      isPublished
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                        : "bg-[#F8B400]/12 text-[#F8B400] border-[#F8B400]/20"
                    }`}
                  >
                    {isPublished ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    {review.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-[#F8B400]" aria-label={`${review.rating} of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < review.rating ? "currentColor" : "none"}
                    className={i < review.rating ? "" : "text-white/20"}
                    strokeWidth={i < review.rating ? 0 : 1.75}
                  />
                ))}
              </div>

              <p className="text-sm text-white/60 line-clamp-3 leading-relaxed flex-1" title={review.content}>
                &ldquo;{review.content}&rdquo;
              </p>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(review._id!, "up")}
                    disabled={index === 0}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/40 border border-white/[0.08] hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/20 disabled:opacity-25 disabled:pointer-events-none transition-all"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(review._id!, "down")}
                    disabled={index === reviews.length - 1}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/40 border border-white/[0.08] hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/20 disabled:opacity-25 disabled:pointer-events-none transition-all"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(review._id!)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8B400] hover:bg-[#e0a200] text-black px-3.5 py-2 text-xs font-bold transition-colors shadow-[0_0_16px_rgba(248,180,0,0.2)]"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this review?")) {
                        onDelete(review._id!);
                      }
                    }}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/45 border border-white/[0.08] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
