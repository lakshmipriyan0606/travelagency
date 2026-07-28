import Link from "next/link";
import { config } from "@/lib/config";
import { ROUTES } from "@/lib/routes";
import { ENDPOINTS } from "@/lib/endpoints";

export const metadata = {
  title: "Packages | Admin",
};

async function getPackages() {
  try {
    const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.packages}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.packages ?? data ?? [];
  } catch {
    return [];
  }
}

export default async function PackagesListPage() {
  const packages = await getPackages();

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tours, activities, and travel packages.</p>
        </div>
        <Link
          href={ROUTES.packages.new}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          + New Package
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No packages found.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Title", "Type", "Destination", "Price", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {packages.map((pkg: { _id: string; title: string; activityCategory?: string; destination?: string; price?: number; isActive?: boolean }) => (
                <tr key={pkg._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{pkg.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{pkg.activityCategory ? "Activity" : "Package"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{pkg.destination ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{pkg.price ? `RM ${pkg.price}` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${pkg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={ROUTES.packages.edit(pkg._id)} className="text-amber-600 hover:text-amber-800 text-xs font-medium mr-3">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
