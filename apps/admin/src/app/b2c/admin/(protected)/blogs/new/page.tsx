import { requireAdmin } from "@/features/auth/guards";
import BlogFormClient from "@/features/blogs/components/BlogFormClient";

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
