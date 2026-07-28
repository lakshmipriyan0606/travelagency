import { config } from "@/lib/config";
import { requireAdmin } from "@/features/auth/guards";
import PackageFormClient from "@/features/packages/components/PackageFormClient";
import { getAccessToken } from '@travelagency/auth';
import { notFound } from "next/navigation";
import { ENDPOINTS } from "@/lib/endpoints";

export const metadata = {
  title: "Edit Activity | Admin",
};

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const token = await getAccessToken();
  const { id } = await params;

  const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.packageById(id)}`, {
    headers: {
      Cookie: `access_token=${token}`
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    notFound();
  }

  const json = await res.json();
  const packageData = json.data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Activity</h1>
        <p className="text-gray-500 text-sm mt-1">Update details for {packageData?.packageName}</p>
      </div>
      
      <PackageFormClient isActivity={true} editId={id} />
    </div>
  );
}
