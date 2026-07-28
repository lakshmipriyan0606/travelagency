import { config } from '@/lib/config';
import { requireAdmin } from "@/features/auth/guards";
import { getAccessToken } from '@travelagency/auth';
import BookingListClient from "@/features/bookings/components/BookingListClient";
import { Booking } from "@/features/bookings/api/bookings.api";
import { ENDPOINTS } from '@/lib/endpoints';

export const metadata = {
  title: "Bookings | Admin",
};

export default async function BookingsListPage() {
  await requireAdmin();
  const token = await getAccessToken();

  let bookings: Booking[] = [];
  try {
    const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.bookingsAll}`, {
      headers: {
        Cookie: `access_token=${token}`
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

