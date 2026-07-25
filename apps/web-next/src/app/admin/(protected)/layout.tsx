import { requireAdmin } from "@/features/admin/auth/guards";
import AdminShell from "../components/AdminShell";

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
