import { requireAdmin } from "@/features/auth/guards";
import MetricsDashboardClient from "@/features/dashboard/components/MetricsDashboardClient";

export const metadata = {
  title: "Dashboard | Admin",
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  return <MetricsDashboardClient />;
}
