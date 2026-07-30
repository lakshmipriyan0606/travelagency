import B2BDashboardClient from "@/features/b2b-agencies/components/B2BDashboardClient";

export const metadata = {
  title: "B2B Admin Dashboard | TravelAgency",
  description: "Overview of all B2B partner agencies, account statuses, and quick actions.",
};

export default function B2BAgenciesDashboardPage() {
  return <B2BDashboardClient />;
}
