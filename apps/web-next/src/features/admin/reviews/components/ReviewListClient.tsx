"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminReviews, deleteReview, moveReview, normalizeReviewsOrder } from "../api/reviews.api";
import { Loader2, Trash2, Edit2, ArrowUp, ArrowDown, Star, MapPin, ListOrdered } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Review } from "../validation/review.schema";

export default function ReviewListClient({ initialReviews }: { initialReviews: Review[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: reviews = initialReviews, isLoading, isError } = useQuery({
    queryKey: ["adminReviews"],
    queryFn: getAdminReviews,
    initialData: initialReviews
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      showToast({ type: "success", content: "Review deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
    },
    onError: (error: any) => {
      showToast({ type: "error", content: error.message || "Failed to delete review" });
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: "up" | "down" }) => moveReview(id, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
    },
    onError: (error: any) => {
      showToast({ type: "error", content: error.message || "Failed to move review" });
    },
  });

  const normalizeMutation = useMutation({
    mutationFn: () => normalizeReviewsOrder(),
    onSuccess: () => {
      showToast({ type: "success", content: "Order numbers fixed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
    },
    onError: (error: any) => {
      showToast({ type: "error", content: error.message || "Failed to fix order numbers" });
    },
  });

  const handleEdit = (id: string) => {
    router.push(`/admin/reviews/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">
        Error loading reviews. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
        <h2 className="text-xl font-bold text-neutral-800">Customer Testimonials ({reviews?.length || 0})</h2>
        <div className="flex gap-3">
          <button
            onClick={() => normalizeMutation.mutate()}
            disabled={normalizeMutation.isPending}
            className="flex items-center gap-2 bg-white text-neutral-600 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-all shadow-sm"
            title="Sequentially re-number all testimonials"
          >
            {normalizeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <ListOrdered size={14} />}
            FIX ALL ORDERS
          </button>
          <button
            onClick={() => router.push("/admin/reviews/new")}
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Add New Review
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-neutral-500 text-[10px] uppercase tracking-widest font-black">
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Reviewer</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {reviews?.map((review: Review, index: number) => (
              <tr key={review._id} className="hover:bg-neutral-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-400 w-6">{review.orderNumber}</span>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveMutation.mutate({ id: review._id, direction: "up" })}
                        disabled={index === 0}
                        className="p-1 hover:bg-white hover:text-primary rounded shadow-sm disabled:opacity-30"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => moveMutation.mutate({ id: review._id, direction: "down" })}
                        disabled={index === reviews.length - 1}
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
                  <span className={"px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest "}>
                    {review.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(review._id)}
                      className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this review?")) {
                          deleteMutation.mutate(review._id);
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
            ))}
          </tbody>
        </table>
      </div>
      
      {(!reviews || reviews.length === 0) && (
        <div className="p-20 text-center text-neutral-400 italic bg-neutral-50/30">
          No reviews found. Click "Add New Review" to get started.
        </div>
      )}
    </div>
  );
}
