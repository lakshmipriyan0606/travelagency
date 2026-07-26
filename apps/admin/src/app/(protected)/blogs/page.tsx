import { requireAdmin } from "@/features/auth/guards";
import BlogListClient from "@/features/blogs/components/BlogListClient";

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
