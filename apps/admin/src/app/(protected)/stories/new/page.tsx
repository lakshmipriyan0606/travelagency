import { requireAdmin } from "@/features/auth/guards";
import StoryFormClient from "@/features/stories/components/StoryFormClient";

export const metadata = {
  title: "Create Story | Admin",
};

export default async function NewStoryPage() {
  await requireAdmin();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Marquee Story</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new image to the homepage marquee gallery.</p>
      </div>
      
      <StoryFormClient />
    </div>
  );
}
