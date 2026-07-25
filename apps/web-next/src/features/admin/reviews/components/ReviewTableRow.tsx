import { ArrowUp, ArrowDown, Star, MapPin, Edit2, Trash2 } from "lucide-react";
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
  return (
    <tr className="hover:bg-neutral-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-400 w-6">{review.orderNumber}</span>
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onMove(review._id!, "up")}
              disabled={index === 0}
              className="p-1 hover:bg-white hover:text-primary rounded shadow-sm disabled:opacity-30"
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={() => onMove(review._id!, "down")}
              disabled={index === totalLength - 1}
              className="p-1 hover:bg-white hover:text-primary rounded shadow-sm disabled:opacity-30"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {review.profileImage?.url ? (
            <img
              src={review.profileImage.url}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              alt={review.name}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center text-neutral-500 text-xs font-bold">
              {review.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-neutral-800 text-sm tracking-tight">{review.name}</p>
            <p className="text-[11px] text-neutral-500 line-clamp-1 max-w-[200px] italic">"{review.content}"</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
          <MapPin size={14} className="text-primary/60" />
          {review.location}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
          ))}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          review.status === "Published" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
        }`}>
          {review.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(review._id!)}
            className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this review?")) {
                onDelete(review._id!);
              }
            }}
            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
