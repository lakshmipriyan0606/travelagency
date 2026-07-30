"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminReviews, deleteReview, moveReview, normalizeReviewsOrder } from "../api/reviews.api";
import { Loader2, ListOrdered, Plus, MessageSquareQuote } from "lucide-react";
import { AirplaneLoader } from "@travelagency/ui";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Review } from "../validation/review.schema";
import { ROUTES } from "@/lib/routes";
import { ViewMode, ViewModeToggle } from "@/components/common/ViewModeToggle";
import { ReviewTableRow } from "./ReviewTableRow";
import { ReviewListCards } from "./ReviewListCards";

export default function ReviewListClient({ initialReviews }: { initialReviews: Review[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data: reviewsData = initialReviews, isLoading, isError } = useQuery({
    queryKey: ["adminReviews"],
    queryFn: getAdminReviews,
    initialData: initialReviews,
  });

  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

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
    mutationFn: ({ id, direction }: { id: string; direction: "up" | "down" }) =>
      moveReview(id, direction),
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
    router.push(ROUTES.reviews.edit(id));
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    moveMutation.mutate({ id, direction });
  };

  if (isLoading) {
    return (
      <AirplaneLoader
        size="lg"
        label="Loading reviews…"
        fullPage
        className="py-20"
      />
    );
  }

  if (isError) {
    return (
      <div className="admin-surface p-10 text-center text-red-400">
        Error loading reviews. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="ent-gold-bar h-7 shrink-0" />
            Review Management
          </h2>
          <p className="text-sm text-white/60 mt-1.5 ml-[15px]">
            Manage customer testimonials across the site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => normalizeMutation.mutate()}
            disabled={normalizeMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white/70 border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] hover:text-white hover:border-white/[0.16] transition-all disabled:opacity-50"
            title="Sequentially re-number all testimonials"
          >
            {normalizeMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ListOrdered size={14} />
            )}
            Fix All Orders
          </button>
          <button
            type="button"
            onClick={() => router.push(ROUTES.reviews.new)}
            className="inline-flex items-center gap-2 bg-[#F8B400] hover:bg-[#e0a200] text-black px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-[0_0_20px_rgba(248,180,0,0.15)]"
          >
            <Plus size={18} />
            Add New Review
          </button>
        </div>
      </div>

      <div className="admin-surface p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-sm font-semibold text-white/80 tracking-tight">
            Customer Testimonials
            <span className="ml-2 tabular-nums text-white/45 font-medium">
              ({reviews?.length || 0})
            </span>
          </h3>
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <MessageSquareQuote className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-base font-semibold text-white/80">No reviews found</h3>
            <p className="text-sm text-white/45 mt-1">
              Get started by adding your first customer testimonial.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/40 shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
            <table className="min-w-full divide-y divide-white/[0.06] text-left">
              <thead className="bg-[var(--ent-elevated,#1c1c22)]/70">
                <tr>
                  {["Order", "Reviewer", "Location", "Rating", "Status", "Actions"].map((label) => (
                    <th
                      key={label}
                      className={`px-5 py-3.5 text-[11px] font-semibold text-white/55 uppercase tracking-wider ${
                        label === "Actions" ? "text-right" : "text-left"
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {reviews.map((review: Review, index: number) => (
                  <ReviewTableRow
                    key={review._id}
                    review={review}
                    index={index}
                    totalLength={reviews.length}
                    onMove={handleMove}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ReviewListCards
            reviews={reviews}
            onMove={handleMove}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        )}
      </div>
    </div>
  );
}
