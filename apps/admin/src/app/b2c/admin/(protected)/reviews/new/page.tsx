import { config } from "@/lib/config";
import { requireAdmin } from "@/features/auth/guards";
import ReviewFormClient from "@/features/reviews/components/ReviewFormClient";
import { getAccessToken } from '@travelagency/auth';
import { Review } from "@/features/reviews/validation/review.schema";
import { ENDPOINTS } from "@/lib/endpoints";

export const metadata = {
  title: "Add Review | Admin",
};

export default async function NewReviewPage() {
  await requireAdmin();
  const token = await getAccessToken();

  let totalReviews = 0;
  try {
    const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.reviews}`, {
      headers: {
        Cookie: `access_token=${token}`
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
