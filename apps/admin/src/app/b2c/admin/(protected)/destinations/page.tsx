import { API_BASE_URL } from '@/lib/config';
import { requireAdmin } from "@/features/auth/guards";
import { getAccessToken } from '@travelagency/auth';
import DestinationListClient from "@/features/destinations/components/DestinationListClient";
import { Destination } from "@/features/destinations/validation/destination.schema";

export const metadata = {
  title: "Destinations | Admin",
};

export default async function DestinationsListPage() {
  await requireAdmin();
  
  const token = await getAccessToken();
  
  // Fetch initial data from backend to pass to Client Component
  let destinations: Destination[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/v1/b2c/destinations`, {
      headers: {
        Cookie: `access_token=${token}`
      },
      next: { revalidate: 0 },
    });
    
    if (res.ok) {
      const json = await res.json();
      destinations = json.data || json || [];
    }
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destination Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the 4 popular destination tiles on the homepage.</p>
        </div>
      </div>

      <DestinationListClient initialDestinations={destinations} />
    </div>
  );
}

