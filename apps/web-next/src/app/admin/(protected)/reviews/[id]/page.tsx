import { requireAdmin } from "@/features/admin/auth/guards";
import ReviewFormClient from "@/features/admin/reviews/components/ReviewFormClient";
import { getAccessToken } from "@/lib/auth/session";
import { Review } from "@/features/admin/reviews/validation/review.schema";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Review | Admin",
};

export default async function EditReviewPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const token = await getAccessToken();

  let review: Review | null = null;
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
      const reviews: Review[] = json.data || json || [];
      totalReviews = reviews.length;
      review = reviews.find(r => r._id === params.id) || null;
    }
  } catch (error) {
    console.error("Failed to fetch review:", error);
  }

  if (!review) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ReviewFormClient initialData={review} totalReviews={totalReviews} />
    </div>
  );
}
