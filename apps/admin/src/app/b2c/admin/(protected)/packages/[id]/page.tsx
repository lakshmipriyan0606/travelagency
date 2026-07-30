import { config } from "@/lib/config";
import { requireAdmin } from "@/features/auth/guards";
import PackageFormClient from "@/features/packages/components/PackageFormClient";
import { getAccessToken } from "@travelagency/auth";
import { notFound, redirect } from "next/navigation";
import { ENDPOINTS } from "@/lib/endpoints";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Edit Package | Admin",
};

function unwrapPackage(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== "object") return null;
  const body = json as Record<string, unknown>;
  // sendSuccess({ data: pkg }) flattens to { success, message, data: pkg }
  if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    return body.data as Record<string, unknown>;
  }
  // Defensive: already-flattened package fields on the envelope
  if (typeof body.packageName === "string" || typeof body._id === "string") {
    return body;
  }
  return null;
}

function isActivityPackage(pkg: Record<string, unknown>): boolean {
  if (pkg.type === "activity") return true;
  if (pkg.type === "package") return false;
  const cat = pkg.activityCategory;
  return typeof cat === "string" && cat !== "" && cat !== "none";
}

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const token = await getAccessToken();
  const { id } = await params;

  const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.packageById(id)}`, {
    headers: {
      Cookie: `access_token=${token}`,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    notFound();
  }

  const json = await res.json();
  const packageData = unwrapPackage(json);

  if (!packageData) {
    notFound();
  }

  // Activities belong on the Activities edit route
  if (isActivityPackage(packageData)) {
    redirect(ROUTES.activities.edit(id));
  }

  const packageName =
    typeof packageData.packageName === "string" ? packageData.packageName : "this package";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="admin-page-title text-2xl font-bold">Edit Package</h1>
        <p className="admin-page-subtitle text-sm mt-1">Update details for {packageName}</p>
      </div>

      <PackageFormClient isActivity={false} editId={id} />
    </div>
  );
}
