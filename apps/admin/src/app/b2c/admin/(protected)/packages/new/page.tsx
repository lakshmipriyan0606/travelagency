// @ts-nocheck
import { requireAdmin } from "@/features/auth/guards";
import PackageFormClient from "@/features/packages/components/PackageFormClient";

export const metadata = {
  title: "Create Package | Admin",
};

export default async function NewPackagePage() {
  await requireAdmin();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="admin-page-title text-2xl font-bold">Create New Package</h1>
        <p className="admin-page-subtitle text-sm mt-1">Configure all details, itineraries, and pricing.</p>
      </div>
      
      <PackageFormClient isActivity={false} editId={null} />
    </div>
  );
}
