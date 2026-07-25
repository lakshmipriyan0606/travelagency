import { requireAdmin } from "@/features/admin/auth/guards";
import BlogFormClient from "@/features/admin/blogs/components/BlogFormClient";

export const metadata = {
  title: "Edit Blog | Admin",
};

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <BlogFormClient editBlogId={params.id} />
    </div>
  );
}
