import { requireAdmin } from "@/features/admin/auth/guards";
import BlogFormClient from "@/features/admin/blog/components/BlogFormClient";
import { getAccessToken } from "@/lib/auth/session";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Blog | Admin",
};

export default async function EditBlogPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const token = await getAccessToken();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/blogs/${params.id}`, {
    headers: {
      Cookie: `access_token=${token}`
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    notFound();
  }

  const json = await res.json();
  const blogData = json.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BlogFormClient isEdit={true} initialData={blogData} />
    </div>
  );
}
