import { ArrowUp, ArrowDown, Star, MapPin, Edit2, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Review } from "../validation/review.schema";

interface Props {
  review: Review;
  index: number;
  totalLength: number;
  onMove: (id: string, direction: "up" | "down") => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ReviewTableRow({
  review,
  index,
  totalLength,
  onMove,
  onEdit,
  onDelete,
}: Props) {
  const isPublished = review.status === "Published";

  return (
    <tr className="group hover:bg-white/[0.035] transition-colors duration-150">
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-white/50 tabular-nums w-6 text-sm">
            {review.orderNumber}
          </span>
          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onMove(review._id!, "up")}
              disabled={index === 0}
              className="inline-flex items-center justify-center w-6 h-6 rounded-md text-white/40 border border-transparent hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/20 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/40 disabled:hover:border-transparent transition-all"
              title="Move up"
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              onClick={() => onMove(review._id!, "down")}
              disabled={index === totalLength - 1}
              className="inline-flex items-center justify-center w-6 h-6 rounded-md text-white/40 border border-transparent hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/20 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/40 disabled:hover:border-transparent transition-all"
              title="Move down"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {review.profileImage?.url ? (
            <img
              src={review.profileImage.url}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-[#F8B400]/35 ring-2 ring-[#F8B400]/15 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
              alt={review.name}
            />
          ) : (
            <div className="w-11 h-11 rounded-full flex-shrink-0 bg-white/[0.06] border border-[#F8B400]/25 ring-2 ring-[#F8B400]/10 flex items-center justify-center text-[#F8B400] text-sm font-bold">
              {review.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm tracking-tight leading-snug">
              {review.name}
            </p>
            <p
              className="text-[12px] text-white/50 line-clamp-1 max-w-[220px] mt-0.5 leading-relaxed"
              title={review.content}
            >
              &ldquo;{review.content}&rdquo;
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <div className="inline-flex items-center gap-1.5 text-sm text-white/70 font-medium">
          <MapPin size={14} className="text-[#F8B400]/70 shrink-0" />
          {review.location}
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-0.5 text-[#F8B400]" aria-label={`${review.rating} of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={13}
              fill={i < review.rating ? "currentColor" : "none"}
              className={i < review.rating ? "" : "text-white/20"}
              strokeWidth={i < review.rating ? 0 : 1.75}
            />
          ))}
        </div>
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isPublished
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
              : "bg-[#F8B400]/12 text-[#F8B400] border-[#F8B400]/20"
          }`}
        >
          {isPublished ? <CheckCircle2 size={13} /> : <Clock size={13} />}
          {review.status}
        </span>
      </td>

      <td className="px-5 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(review._id!)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/45 border border-transparent hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/20 transition-all"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this review?")) {
                onDelete(review._id!);
              }
            }}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/45 border border-transparent hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
