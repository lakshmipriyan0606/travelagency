import { Suspense } from "react";
import AgencyDetailsClient from "@/features/b2b-agencies/components/AgencyDetailsClient";
import { AirplaneLoader } from "@travelagency/ui";

export const metadata = {
  title: "Agency Details | B2B Admin",
  description: "Browse partner agencies as cards, then open a full page for profile, quotes, custom packages, and activity.",
};

export default function AgencyDetailsPage() {
  return (
    <Suspense fallback={<AirplaneLoader size="lg" label="Loading agencies…" fullPage className="h-[60vh]" />}>
      <AgencyDetailsClient />
    </Suspense>
  );
}
