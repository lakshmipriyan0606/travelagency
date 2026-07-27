import { requireAdmin } from "@/features/auth/guards";
import AdminShell from "@/components/layout/AdminShell";

export const metadata = {
  title: "Admin Dashboard | Travel Agency",
  description: "Administrative console",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  
  return (
    <AdminShell user={admin}>
      {children}
    </AdminShell>
  );
}
