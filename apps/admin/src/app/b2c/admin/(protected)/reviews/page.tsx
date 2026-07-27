import { API_BASE_URL } from '@/lib/config';
import { requireAdmin } from "@/features/auth/guards";
import { getAccessToken } from '@travelagency/auth';
import ReviewListClient from "@/features/reviews/components/ReviewListClient";
import { Review } from "@/features/reviews/validation/review.schema";

export const metadata = {
  title: "Reviews | Admin",
};

export default async function ReviewsListPage() {
  await requireAdmin();
  
  const token = await getAccessToken();
  
  let reviews: Review[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/v1/b2c/reviews`, {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer testimonials across the site.</p>
        </div>
      </div>

      <ReviewListClient initialReviews={reviews} />
    </div>
  );
}

