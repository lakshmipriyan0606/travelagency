import { requireAdmin } from "@/features/auth/guards";
import DestinationFormClient from "@/features/destinations/components/DestinationFormClient";
import { getAccessToken } from '@travelagency/auth';
import { Destination } from "@/features/destinations/validation/destination.schema";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Destination | Admin",
};

export default async function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const token = await getAccessToken();
  const { id } = await params;

  let destination: Destination | null = null;
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
      const destinations: Destination[] = json.data || json || [];
      totalDestinations = destinations.length;
      destination = destinations.find(d => d._id === id) || null;
    }
  } catch (error) {
    console.error("Failed to fetch destination:", error);
  }

  if (!destination) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DestinationFormClient initialData={destination} totalDestinations={totalDestinations} />
    </div>
  );
}
