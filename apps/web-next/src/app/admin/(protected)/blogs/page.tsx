import { requireAdmin } from "@/features/admin/auth/guards";
import BlogListClient from "@/features/admin/blogs/components/BlogListClient";

export const metadata = {
  title: "Blogs | Admin",
};

export default async function BlogsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <BlogListClient />
    </div>
  );
}
