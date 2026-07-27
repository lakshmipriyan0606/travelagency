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
        <h1 className="text-2xl font-bold text-gray-900">Create New Activity</h1>
        <p className="text-gray-500 text-sm mt-1">Configure all details, highlights, and operating hours.</p>
      </div>
      
      <PackageFormClient isActivity={true} editId={null} />
    </div>
  );
}
