import { requireAdmin } from "@/features/admin/auth/guards";
import BlogFormClient from "@/features/admin/blogs/components/BlogFormClient";

export const metadata = {
  title: "Create Blog | Admin",
};

export default async function NewBlogPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <BlogFormClient />
    </div>
  );
}
