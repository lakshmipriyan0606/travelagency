import { requireAdmin } from "@/features/admin/auth/guards";
import DestinationFormClient from "@/features/admin/destinations/components/DestinationFormClient";
import { getAccessToken } from "@/lib/auth/session";
import { Destination } from "@/features/admin/destinations/validation/destination.schema";

export const metadata = {
  title: "Add Destination | Admin",
};

export default async function NewDestinationPage() {
  await requireAdmin();
  const token = await getAccessToken();

  let totalDestinations = 0;
  try {
    const res = await fetch(`/destinations`, {
      headers: {
        Cookie: "access_token="
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
