import { requireAdmin } from "@/features/admin/auth/guards";
import MetricsDashboardClient from "@/features/admin/dashboard/components/MetricsDashboardClient";

export const metadata = {
  title: "Dashboard | Admin",
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  return <MetricsDashboardClient />;
}
