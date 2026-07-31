import { Suspense } from "react";
import AgencyDetailsClient from "@/features/b2b-agencies/components/AgencyDetailsClient";
import { AirplaneLoader } from "@travelagency/ui";

export const metadata = {
  title: "Agency Details | B2B Admin",
  description: "Full profile, quote requests, contact info, and activity log for each B2B travel agency partner.",
};

export default function AgencyDetailsPage() {
  return (
    <Suspense fallback={<AirplaneLoader size="lg" label="Loading agencies…" fullPage className="h-[60vh]" />}>
      <AgencyDetailsClient />
    </Suspense>
  );
}
