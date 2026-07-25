import { requireAdmin } from "@/features/admin/auth/guards";
import StoryListClient from "@/features/admin/stories/components/StoryListClient";

export const metadata = {
  title: "Stories | Admin",
};

export default async function StoriesPage() {
  await requireAdmin();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <StoryListClient />
    </div>
  );
}
