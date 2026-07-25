import { requireAdmin } from "@/features/admin/auth/guards";
import { BlogListTable } from "@/features/admin/blog/components/BlogListTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getAccessToken } from "@/lib/auth/session";

export const metadata = {
  title: "Blogs | Admin",
};

export default async function BlogsListPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string };
}) {
  await requireAdmin();
  
  const page = parseInt(searchParams.page || "1", 10);
  const search = searchParams.search || "";
  const status = searchParams.status || "";
  const token = await getAccessToken();
  
  // Construct URL with searchParams
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/admin/blogs`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", "10");
  if (search) url.searchParams.append("search", search);
  if (status && status !== "all") url.searchParams.append("status", status);

  // Fetch from backend
  const res = await fetch(url.toString(), {
    headers: {
      Cookie: `access_token=${token}`
    },
    next: { revalidate: 0 },
  });
  
  let blogs = [];
  let totalPages = 1;
  
  if (res.ok) {
    const json = await res.json();
    blogs = json.data || [];
    totalPages = json.totalPages || 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage articles and news for your travel agency.</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button className="flex items-center gap-2">
            <PlusCircle size={16} />
            Create Blog
          </Button>
        </Link>
      </div>

      <BlogListTable 
        blogs={blogs} 
        currentPage={page} 
        totalPages={totalPages} 
      />
    </div>
  );
}
