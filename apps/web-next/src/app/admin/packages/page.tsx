import { requireAdmin } from "@/features/admin/auth/guards";
import { PackageListTable } from "@/features/admin/packages/components/PackageListTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getAccessToken } from "@/lib/auth/session";

export const metadata = {
  title: "Packages | Admin",
};

export default async function PackagesListPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  await requireAdmin();
  
  const page = parseInt(searchParams.page || "1", 10);
  const token = await getAccessToken();
  
  // Fetch from backend
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/packages?page=${page}&limit=10`, {
    headers: {
      Cookie: `access_token=${token}`
    },
    next: { revalidate: 0 },
  });
  
  let packages = [];
  let totalPages = 1;
  
  if (res.ok) {
    const json = await res.json();
    packages = json.data || [];
    totalPages = json.totalPages || 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tours, activities, and travel packages.</p>
        </div>
        <Link href="/admin/packages/new">
          <Button className="flex items-center gap-2">
            <PlusCircle size={16} />
            Create Package
          </Button>
        </Link>
      </div>

      <PackageListTable 
        packages={packages} 
        currentPage={page} 
        totalPages={totalPages} 
      />
    </div>
  );
}
