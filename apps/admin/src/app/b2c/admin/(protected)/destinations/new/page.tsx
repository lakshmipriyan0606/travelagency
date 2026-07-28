import { config } from "@/lib/config";
import { requireAdmin } from "@/features/auth/guards";
import DestinationFormClient from "@/features/destinations/components/DestinationFormClient";
import { getAccessToken } from '@travelagency/auth';
import { Destination } from "@/features/destinations/validation/destination.schema";
import { ENDPOINTS } from "@/lib/endpoints";

export const metadata = {
  title: "Add Destination | Admin",
};

export default async function NewDestinationPage() {
  await requireAdmin();
  const token = await getAccessToken();

  let totalDestinations = 0;
  try {
    const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.destinations}`, {
      headers: {
        Cookie: `access_token=${token}`
      },
      next: { revalidate: 0 },
    });
    
    if (res.ok) {
      const json = await res.json();
      const destinations = json.data || json || [];
      totalDestinations = destinations.length;
    }
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
  }

  return (
    <div className="space-y-6">
      <DestinationFormClient totalDestinations={totalDestinations} />
    </div>
  );
}
