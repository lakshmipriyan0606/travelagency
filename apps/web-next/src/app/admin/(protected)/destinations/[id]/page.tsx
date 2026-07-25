import { requireAdmin } from "@/features/admin/auth/guards";
import DestinationFormClient from "@/features/admin/destinations/components/DestinationFormClient";
import { getAccessToken } from "@/lib/auth/session";
import { Destination } from "@/features/admin/destinations/validation/destination.schema";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Destination | Admin",
};

export default async function EditDestinationPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const token = await getAccessToken();

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
      destination = destinations.find(d => d._id === params.id) || null;
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
