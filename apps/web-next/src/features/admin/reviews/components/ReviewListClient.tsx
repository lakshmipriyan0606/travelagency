"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminReviews, deleteReview, moveReview, normalizeReviewsOrder } from "../api/reviews.api";
import { Loader2, Trash2, Edit2, ArrowUp, ArrowDown, Star, MapPin, ListOrdered } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Review } from "../validation/review.schema";

import { ReviewTableRow } from "./ReviewTableRow";

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
              <ReviewTableRow
                key={review._id}
                review={review}
                index={index}
                totalLength={reviews.length}
                onMove={(id, direction) => moveMutation.mutate({ id, direction })}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
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
