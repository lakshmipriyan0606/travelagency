import { requireAdmin } from "@/features/admin/auth/guards";
import { getAccessToken } from "@/lib/auth/session";
import BookingListClient from "@/features/admin/bookings/components/BookingListClient";
import { Booking } from "@/features/admin/bookings/api/bookings.api";

export const metadata = {
  title: "Bookings | Admin",
};

export default async function BookingsListPage() {
  await requireAdmin();
  const token = await getAccessToken();

  let bookings: Booking[] = [];
  try {
    const res = await fetch(`/auth/admin/bookings`, {
      headers: {
        Cookie: "access_token="
      },
      next: { revalidate: 0 },
    });
    
    if (res.ok) {
      const json = await res.json();
      bookings = json.bookings || json.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
  }

  return (
    <div className="space-y-6">
      <BookingListClient initialBookings={bookings} />
    </div>
  );
}
