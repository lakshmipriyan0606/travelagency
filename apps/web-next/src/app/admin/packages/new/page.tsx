// @ts-nocheck
import { requireAdmin } from "@/features/admin/auth/guards";
import PackageFormClient from "@/features/admin/packages/components/PackageFormClient";

export const metadata = {
  title: "Create Package | Admin",
};

export default async function NewPackagePage() {
  await requireAdmin();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Package</h1>
        <p className="text-gray-500 text-sm mt-1">Configure all details, itineraries, and pricing.</p>
      </div>
      
      {/* @ts-ignore */}
      <PackageFormClient isEdit={false} />
    </div>
  );
}

