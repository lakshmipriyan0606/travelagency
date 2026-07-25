import { requireAdmin } from "@/features/admin/auth/guards";
import BlogFormClient from "@/features/admin/blog/components/BlogFormClient";

export const metadata = {
  title: "Create Blog | Admin",
};

export default async function NewBlogPage() {
  await requireAdmin();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BlogFormClient isEdit={false} />
    </div>
  );
}
