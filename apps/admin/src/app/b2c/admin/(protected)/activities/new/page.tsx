import { requireAdmin } from "@/features/auth/guards";
import PackageFormClient from "@/features/packages/components/PackageFormClient";

export const metadata = {
  title: "Create Activity | Admin",
};

export default async function NewActivityPage() {
  await requireAdmin();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="admin-page-title text-2xl font-bold">Create New Activity</h1>
        <p className="admin-page-subtitle text-sm mt-1">Configure all details, highlights, and operating hours.</p>
      </div>
      
      <PackageFormClient isActivity={true} editId={null} />
    </div>
  );
}
