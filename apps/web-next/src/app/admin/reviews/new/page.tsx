import { requireAdmin } from "@/features/admin/auth/guards";
import ReviewFormClient from "@/features/admin/reviews/components/ReviewFormClient";
import { getAccessToken } from "@/lib/auth/session";
import { Review } from "@/features/admin/reviews/validation/review.schema";

export const metadata = {
  title: "Add Review | Admin",
};

export default async function NewReviewPage() {
  await requireAdmin();
  const token = await getAccessToken();

  let totalReviews = 0;
  try {
    const res = await fetch(`/reviews/admin`, {
      headers: {
        Cookie: "access_token="
      },
      next: { revalidate: 0 },
    });
    
    if (res.ok) {
      const json = await res.json();
      const reviews = json.data || json || [];
      totalReviews = reviews.length;
    }
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  }

  return (
    <div className="space-y-6">
      <ReviewFormClient totalReviews={totalReviews} />
    </div>
  );
}
