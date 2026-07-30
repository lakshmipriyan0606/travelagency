import { config } from '@/lib/config';
import { requireAdmin } from "@/features/auth/guards";
import { getAccessToken } from '@travelagency/auth';
import ReviewListClient from "@/features/reviews/components/ReviewListClient";
import { Review } from "@/features/reviews/validation/review.schema";
import { ENDPOINTS } from '@/lib/endpoints';

export const metadata = {
  title: "Reviews | Admin",
};

export default async function ReviewsListPage() {
  await requireAdmin();
  
  const token = await getAccessToken();
  
  let reviews: Review[] = [];
  try {
    const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.reviews}`, {
      headers: {
        Cookie: `access_token=${token}`
      },
      next: { revalidate: 0 },
    });
    
    if (res.ok) {
      const json = await res.json();
      reviews = json.data || json || [];
    }
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  }

  return (
    <div className="space-y-6">
      <ReviewListClient initialReviews={reviews} />
    </div>
  );
}
