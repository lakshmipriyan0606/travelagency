import { requireB2BAdmin } from "@/features/auth/guards";
import B2BAdminShell from "./B2BAdminShell";

export const metadata = {
  title: "B2B Admin Dashboard | Travel Agency",
  description: "B2B partnership management panel",
};

export default async function B2BAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireB2BAdmin();
  
  return (
    <B2BAdminShell user={admin}>
      {children}
    </B2BAdminShell>
  );
}
